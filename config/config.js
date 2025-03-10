const os = require("os");

function getLocalIP() {
    const interfaces = os.networkInterfaces();

    for (let iface in interfaces) {
        for (let config of interfaces[iface] || []) { // Garante que interfaces[iface] não seja undefined
            if (config.family === "IPv4" && !config.internal) {
                return config.address; // Retorna o primeiro IP válido encontrado
            }
        }
    }
    return "127.0.0.1"; // Fallback para localhost
}

const localIP = getLocalIP();
console.log(`IP da máquina: ${localIP}`);

module.exports = {
    host: process.env.HOST || localIP, // Usa o IP local detectado ou variável de ambiente
    port: process.env.PORT || 3000,
    sessionSecret: process.env.SESSION_SECRET || "chave-secreta", // Use environment variables in production
    adminPassword: process.env.ADMIN_PASSWORD || "1234",
    dataFile: process.env.DATA_FILE || "filaAtendimento.txt",
    isProduction: process.env.NODE_ENV === "production"
};