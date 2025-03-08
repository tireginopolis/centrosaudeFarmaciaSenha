const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const DATA_FILE = 'queue_backup.txt';
const ADMIN_PASSWORD = '1234'; // Defina a senha de acesso aqui
let normalQueue = [];
let priorityQueue = [];
let servedTickets = [];
let lastNormal = 0;
let lastPriority = 0;
let normalCount = 0; // Counter for normal tickets called

// Servir a página frontend
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/gerar', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gerar.html'));
});

app.get('/chamar', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chamar.html'));
});

app.get('/painel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'painel.html'));
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
    }
}

// Salvar estado atual no arquivo de backup
function saveBackup() {
    const data = JSON.stringify({ normalQueue, priorityQueue, servedTickets, lastNormal, lastPriority, normalCount });
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
    saveBackup();
    console.log('Filas e contadores resetados.');
    io.emit('queues_reset');
}

loadBackup();

function sendQueueStatus() {
    io.emit('queue_status', {
        waitingNormal: normalQueue,
        waitingPriority: priorityQueue,
        served: servedTickets.slice().reverse()
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
        let sea;
        if (type === 'N') {
            lastNormal++;
            sea = `N${lastNormal}`;
            normalQueue.push(sea);
        } else if (type === 'P') {
            lastPriority++;
            sea = `P${lastPriority}`;
            priorityQueue.push(sea);
        }
        console.log(`Senha gerada: ${sea}`);
        saveBackup();
        io.emit('new_sea', sea);
        sendQueueStatus();
    });

    socket.on('request_sea', () => {
        let sea = null;

        // INVERTED LOGIC: For every 2 normal tickets, call 1 priority ticket
        if (normalCount >= 2 && priorityQueue.length > 0) {
            // After 2 normal tickets, call a priority ticket if available
            sea = priorityQueue.shift();
            normalCount = 0; // Reset normal counter
        } else if (normalQueue.length > 0) {
            // Call a normal ticket
            sea = normalQueue.shift();
            normalCount++; // Increment normal counter
        } else if (priorityQueue.length > 0) {
            // If no normal tickets, call priority
            sea = priorityQueue.shift();
            normalCount = 0; // Reset counter
        }

        if (sea) {
            servedTickets.push(sea);
            console.log(`Senha chamada: ${sea}`);
            saveBackup();
            io.emit('called_sea', sea);
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