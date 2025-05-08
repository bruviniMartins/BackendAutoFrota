const express = require('express');
const cors = require('cors');
require('dotenv').config();

const veiculosRoutes = require('./routes/veiculos');
const authRoutes = require('./routes/auth');
const revisoesRoutes = require('./routes/revisoes');
const servicosRoutes = require('./routes/servicos');
const testeEmailRoute = require('./routes/testeEmail');

const app = express();

// ✅ Configuração completa do CORS
app.use(cors({
  origin: 'https://frontend-auto-frota.vercel.app', // ✅ seu domínio real
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Rotas
app.use('/veiculos', veiculosRoutes); // Rota de veículos
app.use('/auth', authRoutes); // Rota de autenticação
app.use('/revisoes', revisoesRoutes); // Rota de revisões
app.use('/teste-email', testeEmailRoute); // Rota de teste de e-mail
app.use('/servicos', servicosRoutes); // Rota de serviços

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
