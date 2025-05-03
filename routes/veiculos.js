const express = require('express');
const router = express.Router();
const {
  cadastrarVeiculo,
  listarVeiculos,
  atualizarQuilometragem,
} = require('../controllers/veiculosController');
const autenticarToken = require('../middlewares/authMiddleware');

// Rotas protegidas
router.post('/', autenticarToken, cadastrarVeiculo);
router.get('/', autenticarToken, listarVeiculos);
router.put('/:id/km', autenticarToken, atualizarQuilometragem);

module.exports = router;
