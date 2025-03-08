const express = require('express');
const session = require("express-session");
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuração da sessão
app.use(session({
    secret: "chave-secreta",  // Troque por uma chave mais segura
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // true apenas se usar HTTPS
}));

// Middleware para verificar sessão
const checkSession = (req, res, next) => {
    if (req.session.authenticated) {
        next();
    } else {
        res.status(401).json({ success: false, message: "Acesso não autorizado!" });
    }
};

const DATA_FILE = 'queue_backup.txt';
const ADMIN_PASSWORD = '1234'; // Defina a senha de acesso aqui

// Modified queue structure to track insertion order
let normalQueue = [];
let priorityQueue = [];
let servedTickets = [];
let lastNormal = 0;
let lastPriority = 0;
let normalCount = 0; // Counter for normal tickets called
let globalSequence = 0; // Global sequence counter for overall insertion order


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
app.get('/gerar', checkSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gerar.html'));
});
app.get('/chamar', checkSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chamar.html'));
});
app.get('/painel', checkSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'painel.html'));
});
app.get('/menu', checkSession, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'menu.html'));
});
// Rota de login
app.post("/login", (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        req.session.authenticated = true;
        res.json({ success: true, message: "Login bem-sucedido!" });
    } else {
        res.json({ success: false, message: "Senha incorreta!" });
    }
});

// Carregar dados do arquivo de backup, se existir
function loadBackup() {
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        const parsedData = JSON.parse(data);
        normalQueue = parsedData.normalQueue || [];
        priorityQueue = parsedData.priorityQueue || [];
        servedTickets = parsedData.servedTickets || [];
        lastNormal = parsedData.lastNormal || 0;
        lastPriority = parsedData.lastPriority || 0;
        normalCount = parsedData.normalCount || 0;
        globalSequence = parsedData.globalSequence || 0;
    }
}

// Salvar estado atual no arquivo de backup
function saveBackup() {
    const data = JSON.stringify({
        normalQueue,
        priorityQueue,
        servedTickets,
        lastNormal,
        lastPriority,
        normalCount,
        globalSequence
    });
    fs.writeFileSync(DATA_FILE, data, 'utf8');
}

// Resetar todas as filas e contadores
function resetQueues() {
    normalQueue = [];
    priorityQueue = [];
    servedTickets = [];
    lastNormal = 0;
    lastPriority = 0;
    normalCount = 0;
    globalSequence = 0;
    saveBackup();
    console.log('Filas e contadores resetados.');
    io.emit('queues_reset');
}

// Helper function to get next ticket respecting insertion order and 2N:1P rule
function getNextTicket() {
    // If both queues are empty, return null
    if (normalQueue.length === 0 && priorityQueue.length === 0) {
        return null;
    }

    // If only one queue has tickets, take from that queue
    if (normalQueue.length === 0) {
        normalCount = 0; // Reset normal counter when serving from priority-only
        return priorityQueue.shift();
    }
    if (priorityQueue.length === 0) {
        return normalQueue.shift();
    }

    // Get the oldest tickets from each queue
    const oldestNormal = normalQueue[0];
    const oldestPriority = priorityQueue[0];

    // If we've called 2 normal tickets and there's a priority ticket, call priority
    if (normalCount >= 2) {
        normalCount = 0; // Reset counter
        return priorityQueue.shift();
    }

    // Otherwise, call the ticket with the lowest sequence number (oldest)
    if (oldestNormal.sequence < oldestPriority.sequence) {
        normalCount++;
        return normalQueue.shift();
    } else {
        normalCount = 0; // Reset normal counter when serving priority
        return priorityQueue.shift();
    }
}

loadBackup();

function sendQueueStatus() {
    // For the frontend, we only send the ticket IDs without the sequence info
    const normalQueueIds = normalQueue.map(ticket => ticket.id);
    const priorityQueueIds = priorityQueue.map(ticket => ticket.id);
    const servedTicketIds = servedTickets.map(ticket => ticket.id);

    io.emit('queue_status', {
        waitingNormal: normalQueueIds,
        waitingPriority: priorityQueueIds,
        served: servedTicketIds.slice().reverse()
    });
}

io.on('connection', (socket) => {
    console.log('Novo cliente conectado:', socket.id);

    socket.on('validate_password', (password, callback) => {
        if (password === ADMIN_PASSWORD) {
            callback({ valid: true });
        } else {
            callback({ valid: false });
        }
    });

    socket.on('generate_sea', (type) => {
        globalSequence++; // Increment global sequence for each new ticket
        let ticketObj;

        if (type === 'N') {
            lastNormal++;
            const ticketId = `N${lastNormal}`;
            ticketObj = {
                id: ticketId,
                sequence: globalSequence,
                type: 'N'
            };
            normalQueue.push(ticketObj);
        } else if (type === 'P') {
            lastPriority++;
            const ticketId = `P${lastPriority}`;
            ticketObj = {
                id: ticketId,
                sequence: globalSequence,
                type: 'P'
            };
            priorityQueue.push(ticketObj);
        }

        console.log(`Senha gerada: ${ticketObj.id} (sequência: ${ticketObj.sequence})`);
        saveBackup();
        io.emit('new_sea', ticketObj.id);
        sendQueueStatus();
    });

    socket.on('request_sea', () => {
        const nextTicket = getNextTicket();

        if (nextTicket) {
            servedTickets.push(nextTicket);
            console.log(`Senha chamada: ${nextTicket.id} (sequência: ${nextTicket.sequence})`);
            saveBackup();
            io.emit('called_sea', nextTicket.id);
            sendQueueStatus();
        }
    });

    socket.on('get_queue_status', () => {
        sendQueueStatus();
    });

    socket.on('reset_queues', () => {
        resetQueues();
        sendQueueStatus();
    });
});

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});