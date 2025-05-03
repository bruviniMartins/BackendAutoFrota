const pool = require('../db');

async function listarRevisoesPorKmInformado(req, res) {
    const { km_atuais } = req.body;
  
    if (!Array.isArray(km_atuais)) {
      return res.status(400).send('Formato inválido. Esperado: array de objetos com veiculo_id e km_atual.');
    }
  
    try {
      const revisoesProximas = [];
  
      for (const item of km_atuais) {
        const { veiculo_id, km_atual } = item;
  
        const resultado = await pool.query(`
          SELECT 
            v.id AS veiculo_id,
            v.marca,
            v.modelo,
            v.placa,
            $1::INTEGER AS km_atual,
            r.tipo,
            r.km_revisao,
            r.status
          FROM veiculos v
          JOIN revisoes r ON v.id = r.veiculo_id
          WHERE v.id = $2
            AND r.status = 'pendente'
            AND r.km_revisao IS NOT NULL
            AND (r.km_revisao - $1) <= 5000
          ORDER BY r.km_revisao ASC
        `, [km_atual, veiculo_id]);
  
        revisoesProximas.push(...resultado.rows);
      }
  
      res.json(revisoesProximas);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erro ao buscar revisões.');
    }
   
  }

  module.exports = {
    listarRevisoesPorKmInformado
  };
  