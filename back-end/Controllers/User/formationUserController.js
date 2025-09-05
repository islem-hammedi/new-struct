const db = require('../../connect');  
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
require('dotenv').config();

const getDomains = (req, res) => {
    const sql = 'SELECT DISTINCT domaine FROM formation';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur de récupération des données:', err);
            return res.status(500).send('Erreur de récupération des données');   }

        if (results.length > 0) {
            const data = results.map(row => row.domaine).join('\n');  
            res.type('text/plain').send(data);
        } else {
            res.type('text/plain').send('Aucune donnée disponible !'); 
        }
    });
};


const getFormation = async (req, res) => {
    const query = `
      SELECT f.domaine,
        f.id_formation,
        s.id_session,
        s.theme,
        s.code,
        s.etat, s.type_session, 
        s.id_fiche_prg ,
        fm.nom_complet AS formateur 
      FROM formation f 
      LEFT JOIN session s 
      ON f.id_formation = s.id_formation 
      LEFT JOIN formateur fm 
      ON s.id_formateur = fm.id_formateur 
      ORDER BY f.domaine, f.id_formation;
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching formations:", err);
        return res.status(500).json({ error: err.message });
      }
  
      const formationsMap = new Map();
      results.forEach((row) => {
        if (!formationsMap.has(row.id_formation)) {
          formationsMap.set(row.id_formation, {
            domaine: row.domaine,
            id_formation: row.id_formation,
            sessions: [],
          });
        }
        if (row.id_session) {
          formationsMap.get(row.id_formation).sessions.push({
            id_session: row.id_session,
            theme: row.theme,
            code: row.code,
            date_debut: row.date_debut,
            date_fin: row.date_fin,
            duree: row.duree,
            etat: row.etat,
            idFichePrg: row.id_fichePrg,
            type_session: row.type_session,
          });
        }
      });
      return res.json(Array.from(formationsMap.values()));
    });
  };
  
const getSession = async(req,res) => {
    const sqlQuery = `
    SELECT 
    session.id_session,
    session.theme,
    session.code,
    session.etat,
    formateur.nom_complet AS formateur,
    formation.domaine,
    session.id_fiche_prg  -- Récupérer uniquement l'ID de la fiche programme
FROM session
JOIN formateur ON session.id_formateur = formateur.id_formateur
JOIN formation ON session.id_formation = formation.id_formation;
`;

  db.query(sqlQuery, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des sessions: ', err);
      return res.status(500).json({ message: 'Erreur lors de la récupération des sessions' });
    }
    res.json(results);
  });
};
const getfichePrg = async (req, res) => {
  const { id_fichePrg } = req.params;
  const sqlQuery = `SELECT chemin FROM fiche_prg WHERE id_fichePrg = ?`;

  db.query(sqlQuery, [id_fichePrg], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération de la fiche programme:", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Fiche programme non trouvée" });
    }
    const fileUrl = `http://localhost:5000/uploads/${results[0].chemin}`;
    res.json({ chemin: fileUrl });
  });
};

const nodemailer = require('nodemailer');


const sendMail = async (req, res) => {
    const { subject, body, email } = req.body;
    console.log("Données reçues : ", req.body);

    if (!subject || !body || !email) {
      console.error("Erreur : paramètre manquant");
      return res.status(400).send('Subject, body et email sont requis');
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
        host: 'smtp.gmail.com', 
        port: 587,   
        secure: false,        
        auth: {
            user: 'khadijabenabdelkader1206@gmail.com', 
            pass: 'qqij aava gtxv hpdz', 
        }
    });

    const mailOptions = {
      from: 'khadijabenabdelkader1206@gmail.com',
      to: email,
      subject: subject,
      text: body
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




module.exports = {
    getDomains,
  getFormation,
  getSession,
  getfichePrg,
  sendMail
  
};
