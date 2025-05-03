const express = require('express');
const cors = require('cors');
require('dotenv').config();

const veiculosRoutes = require('./routes/veiculos');
const authRoutes = require('./routes/auth');
const revisoesRoutes = require('./routes/revisoes');

const app = express();
app.use(cors());
app.use(express.json());

// Rotas
app.use('/veiculos', veiculosRoutes);
app.use('/auth', authRoutes);
app.use('/revisoes', revisoesRoutes);
app.use('/servicos', require('./routes/servicos'));



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
