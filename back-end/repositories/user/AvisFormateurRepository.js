const db = require('../../connect');

class AvisFormateurRepository {
  async getThemesByFormateur(idFormateur) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
    s.id_session AS id, 
    t.nom_theme AS nom, 
    s.lieu, 
    s.type_session, 
    s.etat, 
    fp.id_presence, 
    fp.entreprise_beneficiaire, 
    COUNT(DISTINCT fpp.id_participant) AS nb_participants 
FROM 
    session_formation s 
JOIN 
    formateur f ON s.id_formateur = f.id_formateur 
JOIN 
    theme t ON t.id_theme = s.id_theme
LEFT JOIN 
    feuille_presence_participants fpp ON s.id_session = fpp.id_session
LEFT JOIN 
    feuille_presence fp ON fpp.id_presence = fp.id_presence
WHERE 
    f.id_formateur = ?
GROUP BY 
    s.id_session, fp.id_presence, fp.entreprise_beneficiaire, t.nom_theme, s.lieu, s.type_session, s.etat
ORDER BY 
    s.id_session DESC;
      `;

      db.query(sql, [idFormateur], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  async getFeuillePresence(id_presence) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
    fp.id_presence, 
    fp.entreprise_beneficiaire, 
    DATE_FORMAT(s.date_debut, '%d/%m/%Y') AS date_debut, 
    DATE_FORMAT(s.date_fin, '%d/%m/%Y') AS date_fin,
    s.id_session,
    p.id_participant,
    p.nom_complet
FROM feuille_presence fp
LEFT JOIN feuille_presence_participants fpp ON fp.id_presence = fpp.id_presence
LEFT JOIN session_formation s ON fpp.id_session = s.id_session
LEFT JOIN participants p ON fpp.id_participant = p.id_participant
WHERE fp.id_presence = ?;
      `;

      db.query(sql, [id_presence], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

   async verifyParticipantsExist(participantIds) {
    return new Promise((resolve, reject) => {
      if (participantIds.length === 0) return resolve(true);
      
      const query = `SELECT id_participant FROM participants WHERE id_participant IN (?)`;
      db.query(query, [participantIds], (err, results) => {
        if (err) return reject(err);
        
        const existingIds = results.map(r => r.id_participant);
        const missingIds = participantIds.filter(id => !existingIds.includes(id));
        
        if (missingIds.length > 0) {
          reject(new Error(`Participants non trouvés: ${missingIds.join(', ')}`));
        } else {
          resolve(true);
        }
      });
    });
  }
  async getParticipantsByPresence(id_presence) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT p.id_participant, p.nom_complet 
        FROM participants p
        JOIN feuille_presence_participants fpp ON p.id_participant = fpp.id_participant
        WHERE fpp.id_presence = ?
      `;

      db.query(sql, [id_presence], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  async insertAvisFormateur(id_formateur, id_presence, organisme_formation) {
    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO avis_formateur 
         (id_formateur, id_presence, organisme_formation) 
         VALUES (?, ?, ?)`,
        [id_formateur, id_presence, organisme_formation],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  }

  async insertAvisDetails(avisDetails) {
    const participantIds = avisDetails.map(d => d.id_participant);
  
  // Vérification d'abord
  await this.verifyParticipantsExist(participantIds);
  
    return new Promise((resolve, reject) => {
      

      const values = avisDetails.map(detail => [
        detail.id_avis,
        detail.id_participant,
        detail.connaissances_professionnelles,
        detail.connaissances_equipements,
        detail.comprehension_competences,
        detail.aptitude_appliquer_infos,
        detail.rapidite_execution,
        detail.qualite_travaux,
        detail.clarte_pertinence_resultats,
        detail.perfectionnement_connaissances,
        detail.respect_consignes_constructeur,
        detail.respect_normes_securite,
        detail.autonomie_travail,
        detail.participation,
        detail.assiduite_ponctualite,
        detail.initiative,
        detail.esprit_groupe,
        detail.observation
      ]);

      db.query(
        `INSERT INTO avis_formateur_details 
         (id_avis, id_participant, connaissances_professionnelles, connaissances_equipements,
          comprehension_competences, aptitude_appliquer_infos, rapidite_execution, qualite_travaux,
          clarte_pertinence_resultats, perfectionnement_connaissances, respect_consignes_constructeur,
          respect_normes_securite, autonomie_travail, participation, assiduite_ponctualite,
          initiative, esprit_groupe, observation)
         VALUES ?`,
        [values],
        (err, result) => {
          if (err) return reject(err);
          resolve(result);
        }
      );
    });
  }

}

module.exports = AvisFormateurRepository;