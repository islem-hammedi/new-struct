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
    JOIN theme t ON t.id_theme = s.id_theme;`
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching calendrier:", err);
      return res.status(500).json({ error: err.message });
    }
    const catalogues = [];
    const domainesMap = new Map();

    results.forEach(row => {
      if (!domainesMap.has(row.id_formation)) {
        domainesMap.set(row.id_formation, {
          id_formation: row.id_formation,
          domaine: row.domaine,
          sessions: []
        });
      }

      const catalogue = domainesMap.get(row.id_formation);
      if (row.id_session) {
        let session = catalogue.sessions.find(s => s.id_session === row.id_session);
        
        if (!session) {
          session = {
            id_theme: row.id_theme,
            theme: row.theme,
            code: row.code,
            createdAt: row.createdAt,
            id_session: row.id_session

           
          };
          catalogue.sessions.push(session);
        }
      }
    });

    res.json(Array.from(domainesMap.values()));
  });
};

const getCalendarSessions = async (req, res) => {
  const query = `
  SELECT 
      f.id_formation,
      d.id_domaine,
      d.domaine,
      t.id_theme,
      t.theme,
      t.code,
      s.createdAt,
      s.id_session,s.date_debut,s.date_fin,s.duree
    FROM formation f
    JOIN domaine d ON f.id_domaine = d.id_domaine
    JOIN session s ON f.id_formation = s.id_formation
    JOIN theme t ON t.id_theme = s.id_theme
    where s.duree is not NULL and s.date_fin is not NULL and s.date_debut is not null;`
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching calendrier:", err);
      return res.status(500).json({ error: err.message });
    }
    const catalogues = [];
    const domainesMap = new Map();

    results.forEach(row => {
      if (!domainesMap.has(row.id_formation)) {
        domainesMap.set(row.id_formation, {
          id_formation: row.id_formation,
          domaine: row.domaine,
          sessions: []
        });
      }

      const catalogue = domainesMap.get(row.id_formation);
      if (row.id_session) {
        let session = catalogue.sessions.find(s => s.id_session === row.id_session);
        
        if (!session) {
          session = {
            id_theme: row.id_theme,
            theme: row.theme,
            code: row.code,
            createdAt: row.createdAt,
            id_session: row.id_session,
            date_debut: row.date_debut,
            date_fin: row.date_fin,
            duree: row.duree

           
          };
          catalogue.sessions.push(session);
        }
      }
    });

    res.json(Array.from(domainesMap.values()));
  });
};


const deletSessionFromCalendrier = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier d'abord si la session existe - version corrigée
    const sessionExists = await db.query(
      'SELECT id_session FROM session WHERE id_session = ?', 
      [id]
    );

    // Adaptez cette ligne selon le format de retour de votre driver de base de données
    if (!sessionExists || sessionExists.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Session non trouvée'
      });
    }

    // Mettre à jour les dates à null - version corrigée
    const updateResult = await db.query(
      `UPDATE session 
       SET date_debut = NULL, date_fin = NULL, duree = NULL
       WHERE id_session = ?`,
      [id]
    );

    // Adaptez cette vérification selon votre driver de base de données
    const affectedRows = updateResult.affectedRows || updateResult.rowCount || 0;
    
    if (affectedRows > 0) {
      return res.json({
        success: true,
        message: 'Session retirée du calendrier avec succès'
      });
    } else {
      return res.json({
        success: true,
        message: 'Session retirée du calendrier avec succès'
      });
    }

  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur serveur lors de la suppression',
      details: error.message // Ajout du message d'erreur pour le débogage
    });
  }
};



module.exports = {
  calendrierFormation,getDomainesWithSessions,getCalendarSessions,
  deletSessionFromCalendrier
};















{/*}
const calendrierFormationService = require('../../services/admin/calendrierFormation');

const calendrierFormation = async (req, res) => {
  try {
    const sessions = Array.isArray(req.body) ? req.body : [];
    const message = await calendrierFormationService.updateCalendrierFormation(sessions);

    res.json({
      success: true,
      message,
      updatedCount: sessions.length,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

const getDomainesWithSessions = async (req, res) => {
  try {
    const domaines = await calendrierFormationService.fetchDomainesWithSessions();
    res.json(domaines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCalendarSessions = async (req, res) => {
  try {
    const domaines = await calendrierFormationService.fetchCalendarSessions();
    res.json(domaines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deletSessionFromCalendrier = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await calendrierFormationService.removeSessionFromCalendrier(id);

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  calendrierFormation,
  getDomainesWithSessions,
  getCalendarSessions,
  deletSessionFromCalendrier,
};*/}