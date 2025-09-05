const FormateurCandidatureRepository = require('../../repositories/User/FormateurCandidatureRepository');
const nodemailer = require('nodemailer');

class FormateurCandidatureService {
    constructor() {
        this.transporter = nodemailer.createTransport({
                        service: 'gmail',
                        host: 'smtp.gmail.com',
                        port: 587,
                        secure: false,
                        auth: {
                            user: process.env.EMAIL_USER || 'khadijabenabdelkader1206@gmail.com',
                            pass: process.env.EMAIL_PASSWORD || 'qqij aava gtxv hpdz'
                        }
                    });
      }
  async submitCandidature(formData, files) {
    try {
      return await FormateurCandidatureRepository.createCandidature(formData, files);
    } catch (error) {
      console.error('Erreur lors de la soumission de la candidature:', error);
      throw error;
    }
  }

  async getAllCandidatures() {
    return FormateurCandidatureRepository.getAll();
  }

  async traiterDemande(id, action) {
    try {
      if (action === 'accept') {
        // Mise à jour du statut
        const candidature = await FormateurCandidatureRepository.updateStatus(id, 'accepted');
        await this.envoyerEmailReponse(candidature.email, candidature.nom, 'accept');
        return candidature;
      } else if (action === 'reject') {
        // Récupération avant suppression pour l'email
        const candidature = await FormateurCandidatureRepository.getById(id);
        if (!candidature) {
          throw new Error('Candidature non trouvée');
        }
        
        await this.envoyerEmailReponse(candidature.email, candidature.nom, 'reject');
        await FormateurCandidatureRepository.delete(id);
        return { message: 'Candidature refusée et supprimée' };
      }
    } catch (error) {
      console.error('Erreur dans traiterDemande:', error);
      throw error;
    }
  }

  genererContenuEmail(nom, action) {
    if (action === 'accept') {
      return `Bonjour ${nom},\n\nNous sommes heureux de vous informer que votre candidature a été acceptée.`;
    } else {
      return `Bonjour ${nom},\n\nNous regrettons de vous informer que votre candidature a été refusée.`;
    }
  }

  genererContenuEmailHTML(nom, action) {
    if (action === 'accept') {
      return `<h1>Félicitations ${nom} !</h1>
        <p>Votre candidature a été acceptée.</p>`;
    } else {
      return `<h1>Notification</h1>
        <p>Votre candidature a été refusée.</p>`;
    }
  }

  async envoyerEmailReponse(email, nom, action) {
    try {
      const mailOptions = {
        from: 'khadijabenabdelkader1206@gmail.com',
        to: email,
        subject: action === 'accept' 
          ? 'Votre candidature a été acceptée' 
          : 'Votre candidature a été refusée',
        text: this.genererContenuEmail(nom, action),
        html: this.genererContenuEmailHTML(nom, action)
      };

      const info = await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erreur envoi email:', error);
      throw new Error('Échec envoi email');
    }
  }

  async getByStatus(status) {
  return new Promise((resolve, reject) => {
    db.query(
      'SELECT * FROM formateur_candidatures WHERE status = ?',
      [status],
      (error, results) => {
        if (error) return reject(error);
        resolve(results.map(row => new FormateurCandidature(row)));
      }
    );
  });
}
}

module.exports = new FormateurCandidatureService();