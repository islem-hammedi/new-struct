require('dotenv').config();
const nodemailer = require('nodemailer');

// Fonction pour envoyer un email
const sendMail = async (req, res) => {
  const { nom, email, message } = req.body;
  console.log("Données reçues : ", req.body); // Ajoute ceci pour vérifier les données

  if (!nom || !email || !message) {
    console.error("Erreur : paramètre manquant");
    return res.status(400).send('Nom, email et message sont requis');
  }

  // Crée un transporteur avec nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
      user: 'khadijabenabdelkader1206@gmail.com',  // Ton email (doit être une variable d'environnement)
    pass: 'qqij aava gtxv hpdz',  // Votre mot de passe d'email ou application-specific password
    }
  });

  const mailOptions = {
    from: email,  // Ton adresse email
    to: 'khadijabenabdelkader1206@gmail.com', // Email destinataire (ex : direction@sac-consulting.com)
    subject: `Nouveau message de ${nom}`,  // Sujet de l'email
    text: `Message de ${nom} (Email: ${email}):${message}`,  // Corps du message
  };

  try {
    console.log("Envoi de l'email...");
    await transporter.sendMail(mailOptions);
    console.log("Email envoyé avec succès.");
    res.status(200).send('Email envoyé avec succès');
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    res.status(500).send('Erreur lors de l\'envoi de l\'email: ' + error.toString());
  }
};

module.exports = { sendMail };
