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

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'seuemaildeteste@gmail.com', // <- coloque um e-mail válido seu
      subject: '🛠️ Teste de envio de e-mail',
      text: 'Se você recebeu isso, o sistema de envio de e-mails do AutoFrota está funcionando corretamente!',
    });

    res.send('✅ E-mail de teste enviado com sucesso!');
  } catch (err) {
    console.error('❌ Erro ao enviar e-mail de teste:', err);
    res.status(500).send('Erro ao enviar e-mail de teste.');
  }
});

module.exports = router;
