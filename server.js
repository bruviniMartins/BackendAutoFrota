const express = require('express');
const cors = require('cors');
require('dotenv').config();

const veiculosRoutes = require('./routes/veiculos');
const authRoutes = require('./routes/auth');
const revisoesRoutes = require('./routes/revisoes');
const servicosRoutes = require('./routes/servicos');

const app = express();

// ✅ Configuração completa do CORS
app.use(cors({
    origin: 'https://backendautofrota.onrender.com', // Você pode trocar por seu domínio específico se preferir
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rotas
app.use('/veiculos', veiculosRoutes);
app.use('/auth', authRoutes);
app.use('/revisoes', revisoesRoutes);
app.use('/servicos', servicosRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
