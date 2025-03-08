const express = require('express');
const router = express.Router();
const config = require('../config/config');

// Login route
router.post("/login", (req, res) => {
    const { password } = req.body;
    if (password === config.adminPassword) {
        req.session.authenticated = true;
        res.json({ success: true, message: "Login bem-sucedido!" });
    } else {
        res.json({ success: false, message: "Senha incorreta!" });
    }
});

// Logout route
router.get("/logout", (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: "Logout realizado com sucesso!" });
});

module.exports = router;