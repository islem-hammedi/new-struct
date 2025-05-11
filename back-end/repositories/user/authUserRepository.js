const db = require('../../connect');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Formateur = require('../../models/admin/formateur');
const participants = require('../../models/admin/participant');

class AuthRepository {
  constructor() {
    this.initTables();
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
          nature_participant VARCHAR(50),
          id_entreprise INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (id_entreprise) REFERENCES entreprise(id_entreprise)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      console.log('✅ Table participant initialisée');

    } catch (error) {
      console.error('❌ Erreur initialisation tables:', error);
      throw error;
    }
  }

  async findByUsername(nom_complet) {
    try {
        // Recherche dans la table formateur
        const formateurResult = await db.query(
            "SELECT * FROM formateur WHERE nom_complet = ?", 
            [nom_complet]
        );
        
        if (formateurResult && formateurResult.length > 0) {
            return { 
                user: new Formateur(formateurResult[0]),
                isFormateur: true 
            };
        }

        // Recherche dans la table participant (notez le nom correct de la table)
        const participantResult = await db.query(
            "SELECT * FROM participants WHERE nom_complet = ?", 
            [nom_complet]
        );

        if (participantResult && participantResult.length > 0) {
            const participant = participantResult[0];
            let entrepriseInfo = {};
            
            if (participant.id_entreprise) {
                const entrepriseResult = await db.query(
                    "SELECT * FROM entreprise WHERE id_entreprise = ?",
                    [participant.id_entreprise]
                );
                entrepriseInfo = entrepriseResult[0] || {};
            }

            return { 
                user: new participants({
                    ...participant,
                    entrepriseInfo
                }),
                isFormateur: false 
            };
        }

        return null;
    } catch (error) {
        console.error('Erreur dans findByUsername:', error);
        throw new Error('Erreur lors de la recherche de l\'utilisateur');
    }
}

  async findByEmail(mail) {
    try {
      // Cherche dans les deux tables
      const participantRows = await db.query(
        "SELECT * FROM participants WHERE mail = ?", 
        [mail]
      );
      
      if (participantRows.length) {
        return {
          user: new Participant(participantRows[0]),
          isFormateur: false
        };
      }

      const formateurRows = await db.query(
        "SELECT * FROM formateur WHERE mail = ?",
        [mail]
      );

      if (formateurRows.length) {
        return {
          user: new Formateur(formateurRows[0]),
          isFormateur: true
        };
      }

      return null;
    } catch (error) {
      console.error('Erreur findByEmail:', error);
      throw new Error('Erreur lors de la recherche par email');
    }
  }
async createParticipant(participantData) {
    const hashedPwd = await bcrypt.hash(participantData.pwd, 10);
    const result = await db.query(
      "INSERT INTO participants SET ?",
      {
        nom_complet: participantData.nom_complet,
        mail: participantData.mail,
        pwd: hashedPwd,
        telephone: participantData.telephone,
        adresse: participantData.adresse,
        nature_participant: participantData.nature_participant,
        id_entreprise: participantData.id_entreprise
      }
    );
    return result.insertId;
  }

  async comparePasswords(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  
  async findFormateurById(id) {
    try {
      const rows = await db.query(
        "SELECT * FROM formateur WHERE id_formateur = ?",
        [id]
      );
      return rows.length ? new Formateur(rows[0]) : null;
    } catch (error) {
      console.error('Erreur findFormateurById:', error);
      throw new Error('Erreur lors de la recherche formateur');
    }
  }
  
  async findParticipantById(id) {
    try {
      const rows = await db.query(
        "SELECT * FROM participants WHERE id_participant = ?",
        [id]
      );
      return rows.length ? new Participant(rows[0]) : null;
    } catch (error) {
      console.error('Erreur findParticipantById:', error);
      throw new Error('Erreur lors de la recherche participant');
    }
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
  async updatePassword(userId, newPassword, isFormateur = false) {
    try {
      const hashedPwd = await bcrypt.hash(newPassword, 10);
      const table = isFormateur ? 'formateur' : 'participant';
      const idField = isFormateur ? 'id_formateur' : 'id_participant';
      
      await db.query(
       ` UPDATE ${table} SET ${isFormateur ? 'mdp_formateur' : 'pwd'} = ? WHERE ${idField} = ?`,
        [hashedPwd, userId]
      );
      return true;
    } catch (error) {
      console.error('Erreur updatePassword:', error);
      throw new Error('Erreur lors de la mise à jour du mot de passe');
    }
  }

  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async sendResetEmail(email, token) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const resetLink = `${process.env.APP_URL}/reset-password?token=${token}&email=${email};`
      
      await transporter.sendMail({
        from: "Support" `<${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Réinitialisation de mot de passe',
        html: `
          <p>Vous avez demandé une réinitialisation de mot de passe.</p>
          <p>Cliquez <a href="${resetLink}">ici</a> pour réinitialiser votre mot de passe</p>
          <p>Ce lien expirera dans 1 heure.</p>
        `
      });
      return true;
    } catch (error) {
      console.error('Erreur sendResetEmail:', error);
      throw new Error('Erreur lors de l\'envoi de l\'email');
    }
  }
}

module.exports = new AuthRepository();