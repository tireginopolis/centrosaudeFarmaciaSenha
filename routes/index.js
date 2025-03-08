const express = require('express');
const router = express.Router();
const path = require('path');
const authRoutes = require('./auth');
// const queueRoutes = require('./queue');
const { checkSession } = require('../middleware/auth');

// Auth routes
router.use('/', authRoutes);

// Queue routes (protected)
// router.use('/queue', queueRoutes);

// Page routes
router.get('/', checkSession, (req, res) => {
    // res.sendFile(path.join(__dirname, '../public', 'login.html'));
    res.render('menu');
});

router.get('/gerar', checkSession, (req, res) => {
    // res.sendFile(path.join(__dirname, '../public', 'gerar.html'));
    res.render('gerar');
});

router.get('/chamar', checkSession, (req, res) => {
    // res.sendFile(path.join(__dirname, '../public', 'chamar.html'));
    res.render('chamar');
});

router.get('/painel', checkSession, (req, res) => {
    // res.sendFile(path.join(__dirname, '../public', 'painel.html'));
    res.render('painel');
});

router.get('/menu', checkSession, (req, res) => {
    // res.sendFile(path.join(__dirname, '../public', 'menu.html'));
    res.render('menu');
});

module.exports = router;