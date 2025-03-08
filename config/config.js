module.exports = {
    port: process.env.PORT || 3000,
    sessionSecret: process.env.SESSION_SECRET || "chave-secreta", // Use environment variables in production
    adminPassword: process.env.ADMIN_PASSWORD || "1234",
    dataFile: process.env.DATA_FILE || 'filaAtendimento.txt',
    isProduction: process.env.NODE_ENV === 'production'
};