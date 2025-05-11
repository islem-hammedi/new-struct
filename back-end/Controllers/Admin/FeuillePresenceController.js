{/*const db = require('../../connect');

// Fonction pour récupérer les détails de la session
const getSessionDetails = (req, res) => {
  const sessionId = req.params.sessionId;  // Récupération correcte de sessionId

  const query = `
    SELECT
        c.id AS id_calendrier,
        c.id_session,
        c.date_debut,
        c.date_fin,
        c.nbj,
        s.theme,
        s.code,
        s.lieu,
        s.nb_participants,
        s.type_session,
        f.nom_complet AS formateur_nom,
        f.mail AS formateur_mail,
        f.CIN AS formateur_CIN
    FROM
        calendrierformation c
    JOIN
        session s ON c.id_session = s.id_session
    JOIN
        formateur f ON s.id_formateur = f.id_formateur
    WHERE
        c.id_session = ?;
  `;

  db.query(query, [sessionId], (err, results) => {
    if (err) {
      console.error('Erreur SQL:', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération des détails de la session.' });
    }
    res.json(results);  // Retourner les résultats en réponse
  });
};
const addParticipantAndInsertPresence = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ 
      success: false,
      error: "Données manquantes dans la requête" 
    });
  }

  try {
    const {
      participants = [],
      idCalendrier,
      creditImpôt = false,
      droitTirage = '',
      modeFormation = '',
      coOrganisateurs = '',
      horaire_debut = '',
      horaire_fin = '',
      pause_debut = '',
      pause_fin = '',
      entreprise_beneficiaire = '',
    } = req.body;

    // Validation des données
    if (!idCalendrier) {
      return res.status(400).json({ 
        success: false,
        error: "L'id calendrier est requis" 
      });
    }

    if (!Array.isArray(participants) || participants.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: "Les participants doivent être un tableau non vide" 
      });
    }

    // Début de la transaction
    await new Promise((resolve, reject) => {
      db.beginTransaction(err => {
        if (err) return reject(err);
        resolve();
      });
    });

    try {
      // Vérification de l'existence du calendrier
      const sessionRows = await new Promise((resolve, reject) => {
        db.query(
          'SELECT id, id_session FROM calendrierformation WHERE id = ?',
          [idCalendrier],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      if (!sessionRows || sessionRows.length === 0) {
        throw new Error("Le calendrier spécifié n'existe pas");
      }
      const sessionRow = sessionRows[0];

      // Insertion feuille de présence
      const presenceResult = await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO feuille_presence SET ?',
          {
            id_calendrier: idCalendrier,
            credit_impot: creditImpôt ? 1 : 0,
            droit_tirage: droitTirage,
            mode_formation: modeFormation,
            co_organisateurs: coOrganisateurs,
            horaire_debut: horaire_debut,
            horaire_fin: horaire_fin,
            pause_debut: pause_debut,
            pause_fin: pause_fin,
            entreprise_beneficiaire: entreprise_beneficiaire
          },
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      // Traitement des participants
      for (const participant of participants) {
        if (!participant.CIN || !participant.nomComplet) {
          throw new Error("CIN et nomComplet sont obligatoires pour chaque participant");
        }

        // Vérification existence participant
        const existingRows = await new Promise((resolve, reject) => {
          db.query(
            'SELECT id_participant FROM participant WHERE CIN = ?',
            [participant.CIN],
            (err, results) => {
              if (err) return reject(err);
              resolve(results);
            }
          );
        });

        let idParticipant;
        
        if (existingRows && existingRows.length > 0) {
          // Mise à jour participant existant
          idParticipant = existingRows[0].id_participant;
          
          await new Promise((resolve, reject) => {
            db.query(
              `UPDATE participant SET 
                id_session = ?
              WHERE id_participant = ?`,
              [
                sessionRow.id_session,
                idParticipant
              ],
              (err) => {
                if (err) return reject(err);
                resolve();
              }
            );
          });
        } else {
          // Insertion nouveau participant
          const result = await new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO participant SET ?',
              {
                nom_complet: participant.nomComplet,
                mail: participant.mail || null,
                telephone: participant.telephone || null,
                CIN: participant.CIN,
                //id_session: sessionRow.id_session,
                direction_service: participant.direction_service || null,
                nom_entreprise: participant.nom_entreprise || null,
                nature_participant: participant.nature_participant || 'interne',
                matricule: participant.matricule || null,
                adr_entreprise: participant.adr_entreprise || null,
                email_entreprise: participant.email_entreprise || null,
                tel_entreprise: participant.tel_entreprise || null,
                adresse: participant.adresse || null,
                pwd: null
              },
              (err, results) => {
                if (err) return reject(err);
                resolve(results);
              }
            );
          });

          if (!result || !result.insertId) {
            throw new Error("Échec de la création du participant");
          }
          idParticipant = result.insertId;
        }

        // Insertion dans la table de relation avec émargements
        await new Promise((resolve, reject) => {
          db.query(
            `INSERT INTO feuille_presence_participants 
             (id_presence, id_participant, emargements, id_session) 
             VALUES (?, ?, ?, ?)`,
            [
              presenceResult.insertId, 
              idParticipant,
              JSON.stringify(participant.emargements || {}),
              sessionRow.id_session
            ],
            (err) => {
              if (err) return reject(err);
              resolve();
            }
          );
        });
      }

      await new Promise((resolve, reject) => {
        db.commit(err => {
          if (err) return reject(err);
          resolve();
        });
      });
      
      return res.status(201).json({
        success: true,
        id_feuille_presence: presenceResult.insertId,
        message: "Feuille de présence enregistrée avec succès"
      });

    } catch (error) {
      await new Promise((resolve) => {
        db.rollback(() => {
          resolve();
        });
      });
      
      console.error('Erreur transaction:', {
        message: error.message,
        stack: error.stack,
        sqlError: error.sqlMessage
      });
      
      return res.status(500).json({
        success: false,
        error: 'Erreur lors de la transaction',
        details: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack,
          sqlError: error.sqlMessage
        } : undefined
      });
    }
  } catch (error) {
    console.error('Erreur globale:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur',
      details: error.message
    });
  }
};
// Fonction pour insérer une feuille de présence

const getCalendrier= (req, res) => {
  const sql = `
  SELECT 
  c.id,
  c.id_session,
  f.nom_complet AS formateur, 
  s.theme, 
  s.code, 
  c.nbj, 
  c.mois, 
  c.date_debut, 
  c.date_fin,
  fo.domaine
FROM calendrierformation c
LEFT JOIN session s ON c.id_session = s.id_session
LEFT JOIN formateur f ON s.id_formateur = f.id_formateur
LEFT JOIN formation fo ON s.id_formation = fo.id_formation;
`;

db.query(sql, (err, result) => {
  if (err) {
      console.error(err);
      return res.status(500).json({ error: "Erreur serveur" });
  }
  res.json(result);
});
};
module.exports = {
  addParticipantAndInsertPresence,
  getSessionDetails,
  getCalendrier
};*/}