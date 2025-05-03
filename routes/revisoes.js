const express = require('express');
const router = express.Router();
const autenticarToken = require('../middlewares/authMiddleware');
const { realizarRevisao, listarRevisoesPendentes } = require('../controllers/revisoesController');
const { listarRevisoesPorKmInformado } = require('../controllers/servicosController'); // <-- CORRETO

// ✅ Marcar uma revisão como realizada
router.put('/:id/realizar', autenticarToken, realizarRevisao);

// ✅ Listar revisões pendentes de um veículo
router.get('/veiculo/:id', autenticarToken, listarRevisoesPendentes);

// ✅ Listar revisões personalizadas por KM informado
router.post('/proximas-revisoes-personalizadas', listarRevisoesPorKmInformado);

module.exports = router;
