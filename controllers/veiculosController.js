const pool = require('../db');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurando o Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Função para enviar email
async function enviarEmail(destino, assunto, mensagem) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: destino,
    subject: assunto,
    text: mensagem,
  });
}

// Lista de revisões padrão
const revisoesPadrao = [
  { tipo: 'Troca de óleo do motor', intervaloKm: 5000 },
  { tipo: 'Troca de filtro de ar', intervaloKm: 10000 },
  { tipo: 'Troca de filtro de combustível', intervaloKm: 10000 },
  { tipo: 'Troca de correia dentada', intervaloKm: 60000 },
  { tipo: 'Troca de velas de ignição', intervaloKm: 30000 },
  { tipo: 'Alinhamento de direção', intervaloKm: 10000 },
  { tipo: 'Balanceamento de rodas', intervaloKm: 10000 },
  { tipo: 'Troca de pneus', intervaloKm: 40000 },
  { tipo: 'Troca de pastilhas de freio', intervaloKm: 30000 },
  { tipo: 'Troca de fluido de freio', intervaloMeses: 24 }, // 24 meses = 2 anos
];

// Função para cadastrar veículo
async function cadastrarVeiculo(req, res) {
  const { placa, marca, modelo, ano, km_atual, email_contato, categoria } = req.body;
  const usuario_id = req.usuario.id;

  try {
    const novoVeiculo = await pool.query(
      'INSERT INTO veiculos (placa, marca, modelo, ano, km_atual, email_contato, categoria, usuario_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [placa, marca, modelo, ano, km_atual, email_contato, categoria, usuario_id]
    );

    const veiculoId = novoVeiculo.rows[0].id;

    // Cadastrar revisões padrões
    for (const rev of revisoesPadrao) {
      let km_revisao = null;
      let data_revisao_prevista = null;

      if (rev.intervaloKm) {
        km_revisao = km_atual + rev.intervaloKm;
      }

      if (rev.intervaloMeses) {
        const data = new Date();
        data.setMonth(data.getMonth() + rev.intervaloMeses);
        data_revisao_prevista = data.toISOString(); // formato correto para o PostgreSQL
      }

      await pool.query(
        'INSERT INTO revisoes (veiculo_id, tipo, km_revisao, data_revisao_prevista, status) VALUES ($1, $2, $3, $4, $5)',
        [veiculoId, rev.tipo, km_revisao, data_revisao_prevista, 'pendente']
      );
    }

    res.json(novoVeiculo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao cadastrar veículo');
  }
}

// Função para listar veículos
async function listarVeiculos(req, res) {
  const usuario_id = req.usuario.id;

  try {
    const veiculos = await pool.query(
      'SELECT * FROM veiculos WHERE usuario_id = $1',
      [usuario_id]
    );
    res.json(veiculos.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao listar veículos');
  }
}

// Função para atualizar quilometragem e revisar alertas
async function atualizarQuilometragem(req, res) {
  const { id } = req.params;
  const { km_atual } = req.body;

  try {
    // Atualizar km atual do veículo
    await pool.query('UPDATE veiculos SET km_atual = $1 WHERE id = $2', [km_atual, id]);

    const agora = new Date();

    const revisoes = await pool.query(
      'SELECT r.*, v.email_contato FROM revisoes r INNER JOIN veiculos v ON r.veiculo_id = v.id WHERE r.veiculo_id = $1 AND r.status = $2',
      [id, 'pendente']
    );

    for (const rev of revisoes.rows) {
      let precisaAvisar = false;

      if (rev.km_revisao && (rev.km_revisao - km_atual <= 500)) {
        precisaAvisar = true;
      }

      if (rev.data_revisao_prevista && (new Date(rev.data_revisao_prevista) <= agora)) {
        precisaAvisar = true;
      }

      if (precisaAvisar) {
        await enviarEmail(
          rev.email_contato,
          `Revisão próxima: ${rev.tipo}`,
          `Atenção! Seu veículo precisa de uma ${rev.tipo} em breve.`
        );

        await pool.query('UPDATE revisoes SET status = $1 WHERE id = $2', ['avisado', rev.id]);
      }
    }

    res.send('Quilometragem atualizada e revisões verificadas.');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao atualizar quilometragem');
  }
}

module.exports = {
  cadastrarVeiculo,
  listarVeiculos,
  atualizarQuilometragem,
};
