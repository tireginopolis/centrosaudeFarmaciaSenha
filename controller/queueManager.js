const fs = require('fs');

class QueueManager {
    constructor(config, io) {
        this.config = config;
        this.io = io;
        this.normalQueue = [];
        this.priorityQueue = [];
        this.servedTickets = [];
        this.lastNormal = 0;
        this.lastPriority = 0;
        this.normalCount = 0; // Counter for normal tickets called
        this.globalSequence = 0; // Global sequence counter for overall insertion order

        this.loadBackup();
    }

    // Load data from backup file if it exists
    loadBackup() {
        if (fs.existsSync(this.config.dataFile)) {
            try {
                const data = fs.readFileSync(this.config.dataFile, 'utf8');
                const parsedData = JSON.parse(data);
                this.normalQueue = parsedData.normalQueue || [];
                this.priorityQueue = parsedData.priorityQueue || [];
                this.servedTickets = parsedData.servedTickets || [];
                this.lastNormal = parsedData.lastNormal || 0;
                this.lastPriority = parsedData.lastPriority || 0;
                this.normalCount = parsedData.normalCount || 0;
                this.globalSequence = parsedData.globalSequence || 0;
                console.log('Queue data loaded from backup file');
            } catch (error) {
                console.error('Error loading backup file:', error);
            }
        }
    }

    // Save current state to backup file
    saveBackup() {
        const data = JSON.stringify({
            normalQueue: this.normalQueue,
            priorityQueue: this.priorityQueue,
            servedTickets: this.servedTickets,
            lastNormal: this.lastNormal,
            lastPriority: this.lastPriority,
            normalCount: this.normalCount,
            globalSequence: this.globalSequence
        });
        try {
            fs.writeFileSync(this.config.dataFile, data, 'utf8');
        } catch (error) {
            console.error('Error saving backup file:', error);
        }
    }

    // Reset all queues and counters
    resetQueues() {
        this.normalQueue = [];
        this.priorityQueue = [];
        this.servedTickets = [];
        this.lastNormal = 0;
        this.lastPriority = 0;
        this.normalCount = 0;
        this.globalSequence = 0;

        try {
            if (fs.existsSync(this.config.dataFile)) {
                fs.unlinkSync(this.config.dataFile);
                console.log('Backup file was deleted successfully');
            }
        } catch (err) {
            console.error('Error deleting backup file:', err);
        }

        this.saveBackup();
        console.log('Queues and counters have been reset.');
        this.io.emit('queues_reset');
    }

    // Helper function to get next ticket respecting insertion order and 2N:1P rule
    getNextTicket() {
        // If both queues are empty, return null
        if (this.normalQueue.length === 0 && this.priorityQueue.length === 0) {
            return null;
        }

        // If only one queue has tickets, take from that queue
        if (this.normalQueue.length === 0) {
            this.normalCount = 0; // Reset normal counter when serving from priority-only
            return this.priorityQueue.shift();
        }
        if (this.priorityQueue.length === 0) {
            return this.normalQueue.shift();
        }

        // Get the oldest tickets from each queue
        const oldestNormal = this.normalQueue[0];
        const oldestPriority = this.priorityQueue[0];

        // If we've called 2 normal tickets and there's a priority ticket, call priority
        if (this.normalCount >= 2) {
            this.normalCount = 0; // Reset counter
            return this.priorityQueue.shift();
        }

        // Otherwise, call the ticket with the lowest sequence number (oldest)
        if (oldestNormal.sequence < oldestPriority.sequence) {
            this.normalCount++;
            return this.normalQueue.shift();
        } else {
            this.normalCount = 0; // Reset normal counter when serving priority
            return this.priorityQueue.shift();
        }
    }

    // Generate a new ticket
    generateTicket(type, name) {
        this.globalSequence++; // Increment global sequence for each new ticket
        let ticketObj;

        if (type === 'N') {
            this.lastNormal++;
            const ticketId = `N${this.lastNormal}`;
            ticketObj = {
                id: ticketId,
                name: name,
                sequence: this.globalSequence,
                type: 'N'
            };
            this.normalQueue.push(ticketObj);
        } else if (type === 'P') {
            this.lastPriority++;
            const ticketId = `P${this.lastPriority}`;
            ticketObj = {
                id: ticketId,
                name: name,
                sequence: this.globalSequence,
                type: 'P'
            };
            this.priorityQueue.push(ticketObj);
        }

        console.log(`Ticket generated: ${ticketObj.id} (sequence: ${ticketObj.sequence})`);
        this.saveBackup();
        this.io.emit('new_sea', ticketObj.id);
        this.sendQueueStatus();

        return ticketObj.id;
    }

    // Call the next ticket
    callNextTicket() {
        const nextTicket = this.getNextTicket();

        if (nextTicket) {
            this.servedTickets.push(nextTicket);
            console.log(`Ticket called: ${nextTicket.id} (sequence: ${nextTicket.sequence})`);
            this.saveBackup();
            this.io.emit('called_sea', nextTicket.id);
            this.sendQueueStatus();
            return nextTicket.id;
        }

        return null;
    }

    // Send queue status to all connected clients
    sendQueueStatus() {
        // For the frontend, we only send the ticket IDs without the sequence info
        const normalQueueData = this.normalQueue.map(ticket => ({
            id: ticket.id,
            name: ticket.name
        }));

        const priorityQueueData = this.priorityQueue.map(ticket => ({
            id: ticket.id,
            name: ticket.name
        }));

        const servedTicketData = this.servedTickets.map(ticket => ({
            id: ticket.id,
            name: ticket.name
        })).reverse(); // Inverte

        this.io.emit('queue_status', {
            waitingNormal: normalQueueData,
            waitingPriority: priorityQueueData,
            served: servedTicketData
        });
    }

    // Setup socket handlers
    setupSocketHandlers(socket) {
        console.log('New client connected:', socket.id);

        socket.on('validate_password', (password, callback) => {
            if (password === this.config.adminPassword) {
                callback({ valid: true });
            } else {
                callback({ valid: false });
            }
        });

        socket.on('generate_sea', (parameters) => {
            this.generateTicket(parameters.tipo, parameters.nome);
        });

        socket.on('request_sea', () => {
            this.callNextTicket();
        });

        socket.on('get_queue_status', () => {
            this.sendQueueStatus();
        });

        socket.on('reset_queues', () => {
            console.log('Resetting queue data');
            this.resetQueues();
            this.sendQueueStatus();
        });
    }
}

module.exports = QueueManager;