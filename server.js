const express = require('express');
const session = require("express-session");
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require('./routes');
const config = require('./config/config');
const QueueManager = require('./controller/queueManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve Bootstrap files from node_modules
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));

// Setup view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Setup session
app.use(session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: config.isProduction }
}));

app.use('/', routes);

const queueManager = new QueueManager(config, io);

// Socket connection
io.on('connection', (socket) => {
    // Setup socket handlers for the queue manager
    queueManager.setupSocketHandlers(socket);
});

server.listen(config.port, config.host, () => {
    console.log(`Servidor rodando em http://${config.host}:${config.port}`);
});