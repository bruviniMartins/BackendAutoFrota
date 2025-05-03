const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Registrar usuário
async function registrar(req, res) {
  const { email, senha, nome } = req.body;

  try {
    // Verificar se o usuário já existe
    const usuarioExistente = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({ mensagem: 'Email já cadastrado' });
    }

    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Cadastrar novo usuário
    const novoUsuario = await pool.query(
      'INSERT INTO usuarios (email, senha, nome) VALUES ($1, $2, $3) RETURNING id, email, nome',
      [email, senhaHash, nome]
    );

    res.status(201).json(novoUsuario.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao registrar usuário');
  }
}

// Login
async function login(req, res) {
  const { email, senha } = req.body;

  try {
    // Buscar usuário
    const usuario = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (usuario.rows.length === 0) {
      return res.status(400).json({ mensagem: 'Email ou senha inválidos' });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.rows[0].senha);
    if (!senhaValida) {
      return res.status(400).json({ mensagem: 'Email ou senha inválidos' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: usuario.rows[0].id, email: usuario.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao fazer login');
  }
}

module.exports = {
  registrar,
  login,
};
