const express = require('express');
const router = express.Router();
const path = require('path');
const authRoutes = require('./auth');
const { checkSession } = require('../middleware/auth');
const config = require('../config/config');

// Auth routes
router.use('/', authRoutes);

// Page routes
router.get('/', checkSession, (req, res) => {
    res.render('menu', { port: config.port, host: config.host });
});

router.get('/gerar', checkSession, (req, res) => {
    res.render('gerar', { port: config.port, host: config.host });
});

router.get('/chamar', checkSession, (req, res) => {
    res.render('chamar', { port: config.port, host: config.host });
});

router.get('/painel', checkSession, (req, res) => {
    res.render('painel', { port: config.port, host: config.host });
});

router.get('/menu', checkSession, (req, res) => {
    res.render('menu', { port: config.port, host: config.host });
});

module.exports = router;