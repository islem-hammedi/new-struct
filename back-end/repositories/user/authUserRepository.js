const db = require('../../connect');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Formateur = require('../../models/admin/formateur');
const participants = require('../../models/admin/participant');

class AuthRepository {
  constructor() {
    this.initTables();

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'khadijabenabdelkader1206@gmail.com',
        pass: 'qqij aava gtxv hpdz',
      }
    });
  }

  async initTables() {
    try {
      // Initialisation table formateur
      await db.query(`
        CREATE TABLE IF NOT EXISTS formateur (
          id_formateur INT PRIMARY KEY AUTO_INCREMENT,
          nom_complet VARCHAR(100) NOT NULL,
          mail VARCHAR(100) NOT NULL UNIQUE,
          mdp_formateur VARCHAR(255) NOT NULL,
          telephone VARCHAR(20),
          adr TEXT,
          domaine_de_competences TEXT,
          tarif_journalier DECIMAL(10,2),
          cv TEXT,
          themes_a_enseigner JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('✅ Table formateur initialisée');
        await db.query( `
            CREATE TABLE IF NOT EXISTS entreprise (
              id_entreprise INT PRIMARY KEY AUTO_INCREMENT,
              nom_entreprise VARCHAR(100) NOT NULL,
              tel_entreprise VARCHAR(20),
              email_entreprise VARCHAR(100),
              adr_entreprise TEXT,
              matricule VARCHAR(50) UNIQUE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
          `);
          console.log('✅ Table Entreprise initialisée');

      // Initialisation table participant
      await db.query(`
        CREATE TABLE IF NOT EXISTS participants (
          id_participant INT PRIMARY KEY AUTO_INCREMENT,
          nom_complet VARCHAR(100) NOT NULL,
          mail VARCHAR(100) NOT NULL UNIQUE,
          pwd VARCHAR(255) NOT NULL,
          telephone VARCHAR(20),
          adresse TEXT,
          CIN VARCHAR(50),
          id_entreprise INT,
          FOREIGN KEY (id_entreprise) REFERENCES entreprise(id_entreprise)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('✅ Table participant initialisée');

    } catch (error) {
      console.error('❌ Erreur initialisation tables:', error);
      throw error;
    }
  }

 
async findFormateurByUsername(nom_complet) {
  const query = "SELECT * FROM formateur WHERE nom_complet = ?";
  return new Promise((resolve, reject) => {
    db.query(query, [nom_complet], (err, results) => {
      if (err) reject(err);
      resolve(results.length > 0 ? results[0] : null);
    });
  });
}

async findParticipantByUsername(nom_complet) {
  const query = "SELECT * FROM participants WHERE nom_complet = ?";
  return new Promise((resolve, reject) => {
    db.query(query, [nom_complet], (err, results) => {
      if (err) reject(err);
      resolve(results.length > 0 ? results[0] : null);
    });
  });
}

async findByEmail(email) {
  const query = "SELECT * FROM participants WHERE mail = ?";
  return new Promise((resolve, reject) => {
    db.query(query, [email], (err, results) => {
      if (err) reject(err);
      resolve(results.length > 0 ? results[0] : null);
    });
  });
}


/*async findByEmail(mail) {
  try {
    // Version sécurisée sans déstructuration [rows]
    const participantResult = await this.db.query(
      "SELECT * FROM participants WHERE mail = ?", 
      [mail]
    );
    
    // Accès sécurisé aux résultats
    const participantRows = participantResult && participantResult[0] ? participantResult[0] : [];
    
    if (participantRows.length > 0) {
      return {
        user: participantRows[0],
        isFormateur: false
      };
    }

    const formateurResult = await this.db.query(
      "SELECT * FROM formateur WHERE mail = ?",
      [mail]
    );
    
    const formateurRows = formateurResult && formateurResult[0] ? formateurResult[0] : [];
    
    if (formateurRows.length > 0) {
      return {
        user: formateurRows[0],
        isFormateur: true
      };
    }

    return null;
  } catch (error) {
    console.error('Repository Error - findByEmail:', error);
    throw new Error('Erreur lors de la recherche par email');
  }
}*/


async findParticipantById(id) {
  const query = "SELECT * FROM participants WHERE id_participant = ?";
  return new Promise((resolve, reject) => {
    db.query(query, [id], (err, results) => {
      if (err) reject(err);
      resolve(results.length > 0 ? results[0] : null);
    });
  });
}


async findFormateurById(id) {
  const query = "SELECT * FROM formateur WHERE id_formateur = ?";
  return new Promise((resolve, reject) => {
    db.query(query, [id], (err, results) => {
      if (err) reject(err);
      resolve(results.length > 0 ? results[0] : null);
    });
  });
}

async updateParticipantPassword(id, hashedPassword) {
  return new Promise((resolve, reject) => {
    const query = "UPDATE participants SET pwd = ? WHERE id_participant = ?";
    db.query(query, [hashedPassword, id], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows > 0);
    });
  });
}
  async createParticipant(participantData) {
    try {
      const hashedPwd = await bcrypt.hash(participantData.pwd, 10);
      const result = await db.query(
        `INSERT INTO participants 
        (nom_complet, mail, pwd, telephone, adresse, nature_participant, id_entreprise)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          participantData.nom_complet,
          participantData.mail,
          hashedPwd,
          participantData.telephone,
          participantData.adresse,
          participantData.nature_participant,
          participantData.id_entreprise || null
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('Erreur createParticipant:', error);
      throw new Error('Erreur lors de la création participant');
    }
  }

  async createFormateur(formateurData) {
    try {
      const hashedPwd = await bcrypt.hash(formateurData.mdp_formateur, 10);
      const result = await db.query(
        `INSERT INTO formateur 
        (nom_complet, mail, mdp_formateur, telephone, adr, domaine_de_competences, tarif_journalier, cv, themes_a_enseigner)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          formateurData.nom_complet,
          formateurData.mail,
          hashedPwd,
          formateurData.telephone,
          formateurData.adr,
          formateurData.domaine_de_competences,
          formateurData.tarif_journalier,
          formateurData.cv,
          JSON.stringify(formateurData.themes_a_enseigner || [])
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('Erreur createFormateur:', error);
      throw new Error('Erreur lors de la création formateur');
    }
  }

  

  
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async sendResetEmail(email, token, expiresAt) {
    try {
      const resetLink = `${process.env.APP_URL}/reset-password?token=${token}&email=${email}`;
      
      const mailOptions = {
        from: `khadijabenabdelkader1206@gmail.com`,
        to: email,
        subject: 'Réinitialisation de votre mot de passe',
        html: `
          <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
          <p>Ce lien expirera le ${expiresAt.toLocaleString()}</p>
          <a href="${resetLink}">Cliquez ici pour réinitialiser votre mot de passe</a>
          <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        `
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Repository Error - sendResetEmail:', error);
      throw new Error("Erreur lors de l'envoi de l'email de réinitialisation");
    }
  }
}

module.exports = new AuthRepository();