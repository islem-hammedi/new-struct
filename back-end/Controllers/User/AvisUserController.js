const db = require('../../connect');

const stockerAvis = (req, res) => {
    const { id_participant, id_session } = req.body;

    if (!id_participant || !id_session ) {
        return res.status(400).json({ message: 'Données manquantes' });
    }    console.log("Données reçues :", req.body);


    const {
        note,
        commentaire,
        adaptation_programme_vie_pro,
        moyens_pedagogiques_utilises,
        convenance_horaires_formation,
        apports_niveau_professionnel,
        qualite_documentation_distribuee,
        maitrise_globale_sujets_presentes,
        traitement_exemples_travail,
        animations_seances,
        homogeneite_groupe,
        satisfaction_attentes,
        duree_formation
    } = req.body;

    const query = `
        INSERT INTO avis 
        (id_participant, id_session, note, commentaire, adaptation_programme_vie_pro, 
        moyens_pedagogiques_utilises, convenance_horaires_formation, apports_niveau_professionnel, 
        qualite_documentation_distribuee, maitrise_globale_sujets_presentes, traitement_exemples_travail, 
        animations_seances, homogeneite_groupe, satisfaction_attentes, duree_formation) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [
        id_participant, id_session, note, commentaire, adaptation_programme_vie_pro,
        moyens_pedagogiques_utilises, convenance_horaires_formation, apports_niveau_professionnel,
        qualite_documentation_distribuee, maitrise_globale_sujets_presentes, traitement_exemples_travail,
        animations_seances, homogeneite_groupe, satisfaction_attentes, duree_formation
    ], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Évaluation enregistrée avec succès' });
    });
};


const getSessions = (req, res) => {
    const { id_participant } = req.query;

    if (!id_participant) {
        return res.status(400).json({ message: "ID participant requis" });
    }

    const sql = `
       SELECT s.id_session, t.theme, t.code
       FROM feuille_presence_participants s
       JOIN participant p ON s.id_participant = p.id_participant
       JOIN session se ON s.id_session = se.id_session
       JOIN theme t ON se.id_theme = t.id_theme
       WHERE p.id_participant = ?`;

    // Correction ici - bon usage de db.query
    db.query(sql, [id_participant], (err, results) => {
        if (err) {
            console.error("Erreur MySQL :", err);
            return res.status(500).json({ message: "Erreur serveur" });
        }
        
        console.log("Résultats de la requête :", results);
        // Renvoyer un objet avec propriété sessions pour cohérence
        res.json({ sessions: results });
    });
};
module.exports = { 
    stockerAvis,
    getSessions,
};
