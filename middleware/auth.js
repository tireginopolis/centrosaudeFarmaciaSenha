const path = require('path');
const config = require('../config/config');
/**
 * Middleware to check if user is authenticated
 */
const checkSession = (req, res, next) => {
    if (req.session.authenticated) {
        next();
    } else {
        // res.status(401).json({ success: false, message: "Acesso não autorizado!" });
        // res.sendFile(path.join(__dirname, '../public', 'login.html'));
        res.render('login', { port: config.port, host: config.host });
    }
};

module.exports = { checkSession };