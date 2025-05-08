const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
require('dotenv').config();

router.get('/', async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'frotaapi@gmail.com', // 🛠️ Troque por um e-mail seu válido
      subject: '🔔 Teste de envio de e-mail do AutoFrota',
      text: '✅ Se você recebeu este e-mail, o sistema AutoFrota está enviando mensagens com sucesso!',
    });

    console.log('E-mail enviado: ', info.response);
    res.send('✅ E-mail de teste enviado com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao enviar e-mail de teste:', err);
    res.status(500).send('Erro ao enviar e-mail de teste.');
  }
});

module.exports = router;
