const pool = require('../db');

// Lista de intervalos padrão
const intervalosPadrao = {
  'Troca de óleo do motor': { km: 5000 },
  'Troca de filtro de ar': { km: 10000 },
  'Troca de filtro de combustível': { km: 10000 },
  'Troca de correia dentada': { km: 60000 },
  'Troca de velas de ignição': { km: 30000 },
  'Alinhamento de direção': { km: 10000 },
  'Balanceamento de rodas': { km: 10000 },
  'Troca de pneus': { km: 40000 },
  'Troca de pastilhas de freio': { km: 30000 },
  'Troca de fluido de freio': { meses: 24 }
};

// Marcar revisão como realizada e gerar próxima
async function realizarRevisao(req, res) {
  const { id } = req.params;
  const { data_realizada, km_realizado, tipo_realizado, qualidade, terreno } = req.body;

  try {
    // Atualizar a revisão como realizada
    await pool.query(
      'UPDATE revisoes SET status = $1, data_realizada = $2, km_realizado = $3 WHERE id = $4',
      ['Realizada', data_realizada, km_realizado, id]
    );

    // Buscar o veículo ID da revisão atual
    const revisaoAtual = await pool.query('SELECT veiculo_id FROM revisoes WHERE id = $1', [id]);
    const veiculoId = revisaoAtual.rows[0].veiculo_id;

    // Gerar próxima revisão
    const intervalo = intervalosPadrao[tipo_realizado];

    if (intervalo) {
      let km_revisao = null;
      let data_revisao_prevista = null;

      // ✅ Fator de qualidade dos produtos usados
      let fatorQualidade = 1;
      if (qualidade === 'alta') fatorQualidade = 1.2;   // +20%
      if (qualidade === 'baixa') fatorQualidade = 0.7;  // -30%

      // ✅ Fator de uso do terreno
      let fatorTerreno = 1;
      if (terreno === 'ruim') fatorTerreno = 0.6;        // -40%
      if (terreno === 'normal') fatorTerreno = 0.9;      // -10%
      if (terreno === 'bom') fatorTerreno = 1.1;         // +10%

      // ✅ Fator final combinado
      const fatorFinal = fatorQualidade * fatorTerreno;

      if (intervalo.km) {
        km_revisao = Math.round(Number(km_realizado) + intervalo.km * fatorFinal);
      }

      if (intervalo.meses) {
        const data = new Date();
        data.setMonth(data.getMonth() + Math.round(intervalo.meses * fatorFinal));
        data_revisao_prevista = data;
      }

      // Cadastrar nova revisão
      await pool.query(
        'INSERT INTO revisoes (veiculo_id, tipo, km_revisao, data_revisao_prevista, status) VALUES ($1, $2, $3, $4, $5)',
        [veiculoId, tipo_realizado, km_revisao, data_revisao_prevista, 'pendente']
      );
    }

    res.send('Revisão realizada e próxima revisão cadastrada.');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao realizar revisão.');
  }
}

// Listar revisões pendentes de um veículo
async function listarRevisoesPendentes(req, res) {
  const { id } = req.params;

  try {
    const revisoes = await pool.query(
      'SELECT * FROM revisoes WHERE veiculo_id = $1',
      [id]
    );
    res.json(revisoes.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao listar revisões.');
  }
}

module.exports = {
  realizarRevisao,
  listarRevisoesPendentes,
};
