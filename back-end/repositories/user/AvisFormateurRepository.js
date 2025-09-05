
const db = require('../../connect');

class AvisFormateurRepository {
  async getThemesByFormateur(idFormateur) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
    s.id_session AS id, 
    t.theme AS nom, 
    s.lieu, 
    s.type_session, 
    s.etat, s.mode, s.genre, s.date_debut, s.date_fin, 
    p.nom_complet, 
    e.nom_entreprise,
    fp.id_presence, 
    fp.entreprise_beneficiaire, 
    COUNT(DISTINCT fpp.id_participant) AS nb_participants 
FROM 
    session s
JOIN 
    formateur f ON s.id_formateur = f.id_formateur
JOIN 
    theme t ON t.id_theme = s.id_theme
JOIN 
    entreprise e
JOIN 
    participant p ON p.id_entreprise = e.id_entreprise
LEFT JOIN 
    feuille_presence_participants fpp ON s.id_session = fpp.id_session
LEFT JOIN 
    feuille_presence fp ON fpp.id_presence = fp.id_presence
WHERE 
    f.id_formateur = 102
GROUP BY 
    s.id_session, t.theme, s.lieu, s.type_session, s.etat, 
    p.nom_complet, e.nom_entreprise, fp.id_presence, fp.entreprise_beneficiaire
ORDER BY 
    s.id_session DESC 
LIMIT 0, 25;`;

      db.query(sql, [idFormateur], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  async insertAvisFormateur(id_formateur, id_presence, id_participant, evaluations) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO avis_formateur (
          connaissances_professionnelles,
          connaissances_equipements,
          comprehension_competences,
          aptitude_appliquer_infos,
          rapidite_execution,
          qualite_travaux,
          clarte_pertinence_resultats,
          perfectionnement_connaissances,
          respect_consignes_constructeur,
          respect_normes_securite,
          autonomie_travail,
          participation,
          assiduite_ponctualite,
          initiative,
          esprit_groupe,
          observation,
          id_session,
          id_participant,
          id_formateur
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `;

      const values = [
        evaluations.connaissances_professionnelles,
        evaluations.connaissances_equipements,
        evaluations.comprehension_competences,
        evaluations.aptitude_appliquer_infos,
        evaluations.rapidite_execution,
        evaluations.qualite_travaux,
        evaluations.clarte_pertinence_resultats,
        evaluations.perfectionnement_connaissances,
        evaluations.respect_consignes_constructeur,
        evaluations.respect_normes_securite,
        evaluations.autonomie_travail,
        evaluations.participation,
        evaluations.assiduite_ponctualite,
        evaluations.initiative,
        evaluations.esprit_groupe,
        evaluations.observation || '',
        evaluations.id_session,
        id_participant,
        id_formateur
      ];

      db.query(sql, values, (err, result) => {
        if (err) return reject(err);
        resolve({
          id: result.insertId,
          message: 'Évaluation enregistrée avec succès'
        });
      });
    });
  }
}

module.exports = new AvisFormateurRepository();