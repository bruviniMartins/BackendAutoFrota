const express = require('express');
const router = express.Router();

const { listarRevisoesPorKmInformado } = require('../controllers/servicosController');
const autenticarToken = require('../middlewares/authMiddleware');

// ✅ Rota para buscar revisões próximas com base no KM informado
router.post('/proximas-revisoes-personalizadas', autenticarToken, listarRevisoesPorKmInformado);

module.exports = router;
