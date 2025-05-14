const ContactRepository = require('../../repositories/user/ContactRepository');

class ContactService {
  constructor() {
    this.contactRepository = new ContactRepository(); // Initialisation du repository
  }

  async sendContactEmail(nom, email, message) {
    // Validation des entrées
    if (!nom || !email || !message) {
      throw new Error('Nom, email et message sont requis');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Format d\'email invalide');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || email,
      to: process.env.EMAIL_RECEIVER || 'khadijabenabdelkader1206@gmail.com',
      subject: `Nouveau message de ${nom}`,
      text: `Message de ${nom} (Email: ${email}): ${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">Nouveau message de contact</h2>
          <p><strong>Nom:</strong> ${nom}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background: #f4f4f4; padding: 10px; border-radius: 5px;">${message}</p>
        </div>
      `,
      replyTo: email
    };

    try {
      console.log('Tentative d\'envoi d\'email...');
      const result = await this.contactRepository.sendEmail(mailOptions);
      console.log('Email envoyé avec succès à', mailOptions.to);
      return result;
    } catch (error) {
      console.error('Erreur ContactService:', error);
      throw new Error('Échec de l\'envoi de l\'email. Veuillez réessayer plus tard.');
    }
  }
}

module.exports = ContactService;