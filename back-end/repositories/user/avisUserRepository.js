const db = require('../../connect');
const Avis = require('../../models/admin/avis_p')
class AvisUserRepository {
    async createAvis(avisData) {
        try {
            const query = `
                INSERT INTO avis_participant 
        (id_participant, id_session, note, commentaire, adaptation_programme_vie_pro, 
        moyens_pedagogiques_utilises, convenance_horaires_formation, apports_niveau_professionnel, 
        qualite_documentation_distribuee, maitrise_globale_sujets_presentes, traitement_exemples_travail, 
        animations_seances, homogeneite_groupe, satisfaction_attentes, duree_formation) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const result = await db.query(query, [
                avisData.id_participant,
                avisData.id_session,
                avisData.note,
                avisData.commentaire,
                avisData.adaptation_programme_vie_pro,
                avisData.moyens_pedagogiques_utilises,
                avisData.convenance_horaires_formation,
                avisData.apports_niveau_professionnel,
                avisData.qualite_documentation_distribuee,
                avisData.maitrise_globale_sujets_presentes,
                avisData.traitement_exemples_travail,
                avisData.animations_seances,
                avisData.homogeneite_groupe,
                avisData.satisfaction_attentes,
                avisData.duree_formation
            ]);

            return new Avis({
                id_avis: result.insertId,
                ...avisData,
                date_creation: new Date()
            });

        } catch (err) {
            console.error('Repository Error - createAvis:', err);
            throw err;
        }
    }

    async getSessionsByParticipant(id_participant) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT s.id_session, t.nom_theme, t.code, s.id_formation, s.id_formateur
                FROM session_formation s
                JOIN theme t on t.id_theme = s.id_theme
                
                JOIN feuille_presence_participants fpp ON FIND_IN_SET(s.id_session, fpp.id_session) > 0
                JOIN participants p on p.id_participant=fpp.id_participant 
                WHERE p.id_participant =?;
            `;

            db.query(query, [id_participant], (err, results) => {
                if (err) {
                    console.error('Repository Error - getSessionsByParticipant:', err);
                    return reject(err);
                }
                
                // Convertir les résultats en format simple
                const plainResults = JSON.parse(JSON.stringify(results));
                resolve(plainResults);
            });
        });
    }
}

module.exports = AvisUserRepository;