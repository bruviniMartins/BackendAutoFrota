const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
});

async function testarConexao() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('🟢 Conexão bem-sucedida!', res.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('🔴 Erro ao conectar no banco de dados:', error.message);
    process.exit(1);
  }
}

testarConexao();
