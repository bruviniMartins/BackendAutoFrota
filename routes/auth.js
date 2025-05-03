const express = require('express');
const router = express.Router();
const { registrar, login } = require('../controllers/authController');

// Rota de cadastro
router.post('/register', registrar);

// Rota de login
router.post('/login', login);

module.exports = router;
