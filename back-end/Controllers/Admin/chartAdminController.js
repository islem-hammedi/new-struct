const db = require('../../connect');
/*
// Fonction de conversion des évaluations textuelles en notes
const convertEvaluationToNote = (evaluation) => {
  switch(evaluation) {
    case 'Insuffisant': return 1;
    case 'Peu satisfaisant': return 2;
    case 'Satisfaisant': return 3;
    case 'Très satisfaisant': return 4;
    case 'Excellent': return 5;
    default: return 0; // Valeur par défaut si non reconnu
  }
};

// Fonction utilitaire pour normaliser les résultats de la base de données
const normalizeDbResult = (result) => {
  if (Array.isArray(result)) return result;
  if (result?.rows) return result.rows;
  if (Array.isArray(result?.[0])) return result[0];
  if (result) return [result];
  return [];
};

const Avis = {
  async getAvisBySession(id_session) {
    try {
      const result = await db.query(`
        SELECT 
          s.id_session,
          s.theme,
          a.note,
          a.adaptation_programme_vie_pro,
          a.moyens_pedagogiques_utilises,
          a.convenance_horaires_formation,
          a.apports_niveau_professionnel,
          a.qualite_documentation_distribuee,
          a.maitrise_globale_sujets_presentes,
          a.traitement_exemples_travail,
          a.animations_seances,
          a.homogeneite_groupe,
          a.satisfaction_attentes,
          a.duree_formation
        FROM avis a
        JOIN session s ON a.id_session = s.id_session
        WHERE s.id_session = ?
      `, [id_session]);
  
      const rows = normalizeDbResult(result);
  
      return rows.map(row => ({
        id_session: row.id_session,
        theme: row.theme,
        note: convertEvaluationToNote(row.note),
        adaptation_programme_vie_pro: convertEvaluationToNote(row.adaptation_programme_vie_pro),
        moyens_pedagogiques_utilises: convertEvaluationToNote(row.moyens_pedagogiques_utilises),
        convenance_horaires_formation: convertEvaluationToNote(row.convenance_horaires_formation),
        apports_niveau_professionnel: convertEvaluationToNote(row.apports_niveau_professionnel),
        qualite_documentation_distribuee: convertEvaluationToNote(row.qualite_documentation_distribuee),
        maitrise_globale_sujets_presentes: convertEvaluationToNote(row.maitrise_globale_sujets_presentes),
        traitement_exemples_travail: convertEvaluationToNote(row.traitement_exemples_travail),
        animations_seances: convertEvaluationToNote(row.animations_seances),
        homogeneite_groupe: convertEvaluationToNote(row.homogeneite_groupe),
        satisfaction_attentes: convertEvaluationToNote(row.satisfaction_attentes),
        duree_formation: convertEvaluationToNote(row.duree_formation)
      }));
    } catch (error) {
      console.error('Error in getAvisBySession:', error);
      throw error;
    }
  },
  

  async getSessions() {
    try {
      const result = await db.query('SELECT * FROM session');
      return normalizeDbResult(result);
    } catch (error) {
      console.error('Error in getSessions:', error);
      throw error;
    }
  }
};


const getAllSessionsWithAverages = async (req, res) => {
  try {
    const sessions = await Avis.getSessions();

    const sessionsWithAverages = await Promise.all(
      sessions.map(async (session) => {
        const avis = await Avis.getAvisBySession(session.id_session);
        const calculateAverage = (field) => {
          if (avis.length === 0) return 0;
          const validValues = avis.map(item => Number(item[field]) || 0);
          const sum = validValues.reduce((acc, val) => acc + val, 0);
          return (sum / avis.length).toFixed(2);
        };

        return {
          id_session: session.id_session,
          theme: session.theme,
          moyenne_note: calculateAverage('note'),
          moyenne_adaptation: calculateAverage('adaptation_programme_vie_pro'),
          moyenne_pedagogie: calculateAverage('moyens_pedagogiques_utilises'),
          moyenne_horaires: calculateAverage('convenance_horaires_formation'),
          moyenne_apports: calculateAverage('apports_niveau_professionnel'),
          moyenne_documentation: calculateAverage('qualite_documentation_distribuee'),
          moyenne_maitrise: calculateAverage('maitrise_globale_sujets_presentes'),
          moyenne_exemples: calculateAverage('traitement_exemples_travail'),
          moyenne_animation: calculateAverage('animations_seances'),
          moyenne_homogeneite: calculateAverage('homogeneite_groupe'),
          moyenne_satisfaction: calculateAverage('satisfaction_attentes'),
          moyenne_duree: calculateAverage('duree_formation'),
          nombre_avis: avis.length
        };
      })
    );

    res.json(sessionsWithAverages);
  } catch (error) {
    console.error('Error in getAllSessionsWithAverages:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getSessions = async (req, res) => {
  try {
    const sessions = normalizeDbResult(await Avis.getSessions());
    res.json(sessions);
  } catch (error) {
    console.error('Error in getSessions:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des sessions'
    });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_admins,
        SUM(CASE WHEN id_acces != 4 THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN id_acces = 4 THEN 1 ELSE 0 END) as super_admins
      FROM admin
    `;
    
    const results = await new Promise((resolve, reject) => {
      db.query(query, (error, results) => {
        if (error) return reject(error);
        const cleanResults = {
          total_admins: results[0].total_admins,
          admins: results[0].admins,
          super_admins: results[0].super_admins
        };
        resolve(cleanResults);
      });
    });

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin statistics'
    });
  }
};const getSessionStats = async (req, res) => {
  try {
    const query = `
      SELECT 
  id_cal,
  COUNT(*) AS nombre_sessions,
  GROUP_CONCAT(mois ORDER BY id SEPARATOR ', ') AS mois_concaténés
FROM 
  calendrierformation
WHERE 
  id_domaine IS NOT NULL
  AND date_debut IS NOT NULL
GROUP BY 
  id_cal
ORDER BY 
  id_cal;

    `;
    
    const rawResults = await new Promise((resolve, reject) => {
      db.query(query, (error, results) => {
        if (error) return reject(error);
        
        // Nettoyer les résultats ici, AVANT de les renvoyer
        const cleanResults = results.map(row => ({
          id_cal: row.id_cal,
          nombre_sessions: row.nombre_sessions,
          mois_concaténés: row.mois_concaténés
        }));

        resolve(cleanResults); // <- pas les résultats bruts
      });
    });

    res.json({
      success: true,
      data: rawResults // <- ici c'est propre
    });

  } catch (error) {
    console.error('Error fetching session stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching session statistics'
    });
  }
};

module.exports = {
  getSessions,
  getAllSessionsWithAverages,
  getAdminStats,
  getSessionStats,

};
*/