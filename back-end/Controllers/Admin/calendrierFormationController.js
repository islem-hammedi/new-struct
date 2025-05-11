  const db = require('../../connect');




   const calendrierFormation = async (req, res) => {
  try {
    // Le corps de la requête est directement le tableau de sessions
    const sessions = Array.isArray(req.body) ? req.body : [];

    if (sessions.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Aucune session à enregistrer."
      });
    }

    // Validation des sessions
    const invalidSessions = sessions.filter(session => 
      !session.id_session || !session.date_debut || !session.date_fin || !session.duree
    );

    if (invalidSessions.length > 0) {
      return res.status(400).json({
        success: false,
        error: `${invalidSessions.length} sessions invalides (champs manquants)`
      });
    }

    // Exécution des requêtes
    const updatePromises = sessions.map(session => 
      db.query(
        "UPDATE session SET date_debut = ?, date_fin = ?, duree = ? WHERE id_session = ?",
        [session.date_debut, session.date_fin, session.duree, session.id_session]
      )
    );

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: `${sessions.length} sessions mises à jour avec succès.`,
      updatedCount: sessions.length
    });

  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erreur lors du traitement des sessions"
    });
  }
};




const getDomainesWithSessions = async (req, res) => {
  const query = `
    SELECT 
      f.id_formation,
      d.id_domaine,
      d.domaine,
      t.id_theme,
      t.theme,
      t.code,
      s.createdAt,
      s.id_session
    FROM formation f
    JOIN domaine d ON f.id_domaine = d.id_domaine
    JOIN session s ON f.id_formation = s.id_formation
    JOIN theme t ON t.id_theme = s.id_theme;
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching domaines with sessions:", err);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des données.",
        details: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Aucun domaine trouvé.",
      });
    }

    const formattedData = [];
    const domainesMap = new Map();

    results.forEach((row) => {
      // Trouver ou créer le domaine
      if (!domainesMap.has(row.id_domaine)) {
        domainesMap.set(row.id_domaine, {
          id_domaine: row.id_domaine,
          domaine: row.domaine,
          themes: [],
        });
      }

      const domaine = domainesMap.get(row.id_domaine);

      // Trouver ou créer le thème au sein du domaine
      let theme = domaine.themes.find((t) => t.id_theme === row.id_theme);
      if (!theme) {
        theme = {
          id_theme: row.id_theme,
          theme: row.theme,
          code: row.code,
          sessions: [],
        };
        domaine.themes.push(theme);
      }

      // Ajouter la session au thème
      if (row.id_session) {
        const sessionExists = theme.sessions.some((s) => s.id_session === row.id_session);
        if (!sessionExists) {
          theme.sessions.push({
            id_session: row.id_session,
            createdAt: row.createdAt,
          });
        }
      }
    });

   return {
  success: true,
  message: "Données récupérées avec succès.",
  data: Array.from(domainesMap.values())
};
  });
};







module.exports = {
  calendrierFormation,getDomainesWithSessions
};




{/*


const calendrierFormationService = require('../../services/admin/calendrierFormation');
const { successResponse, errorResponse } = require('../../helpers/response');

const saveSessions = async (req, res) => {
  try {
    const result = await calendrierFormationService.saveSessions(req.body);
    successResponse(res, result.message, result.data, result.updatedCount);
  } catch (error) {
    errorResponse(res, error.message, error.details);
  }
};

const getDomainesWithSessions = async (req, res) => {
  try {
    const result = await calendrierFormationService.getDomainesWithSessions();
    successResponse(res, result.message, result.data);
  } catch (error) {
    errorResponse(res, error.message, error.details);
  }
};

module.exports = {
  saveSessions,
  getDomainesWithSessions
};*/}