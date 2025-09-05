const formationAdminService = require('../../services/admin/formationService');

const formationAdminController = {
   getFormations: async (req, res) => {
        try {
            const formations = await formationAdminService.getFormationsWithSessions();
            res.json(formations);
        } catch (error) {
            console.error("Error fetching formations:", error);
            res.status(500).json({ error: error.message });
        }
    },

    async addFormation(req, res) {
      try {
          if (!req.files) {
              return res.status(400).json({
                  success: false,
                  message: "Aucun fichier reçu"
              });
          }
          const { domaine, sessions } = req.body;
          const parsedSessions = typeof sessions === 'string' ? JSON.parse(sessions) : sessions;

          if (!domaine || !parsedSessions || !Array.isArray(parsedSessions)) {
              return res.status(400).json({
                  success: false,
                  message: "Données invalides"
              });
          }
          const result = await formationAdminService.createFormationWithSessions(
              domaine,
              parsedSessions,
              req.files
          );

          if (!result.success) {
              return res.status(400).json(result);
          }

          res.status(201).json(result);
      } catch (error) {
          console.error("Erreur addFormation controller:", error);
          res.status(500).json({
              success: false,
              message: error.message || "Erreur serveur"
          });
      }
  },

  addSession: async (req, res) => {
      try {
          const { id } = req.params;
          const sessionData = req.body;
          const file = req.file;

          const result = await formationAdminService.addSessionToFormation(
              id, 
              sessionData, 
              file
          );
          
          res.status(201).json({
              success: true,
              message: 'Session ajoutée avec succès',
              data: result
          });
      } catch (error) {
          console.error("Erreur:", error);
          const status = error.message.includes('obligatoire') ? 400 : 500;
          res.status(status).json({ 
              success: false,
              message: error.message,
              stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
          });
      }
  },
  async deleteSession(req, res) {
    try {
      const { formationId, sessionId } = req.params;
        
        if (!sessionId || isNaN(sessionId)) {
            return res.status(400).json({
                success: false,
                message: "ID de session invalide"
            });
        }



        const result = await formationAdminService.deleteSession(sessionId, formationId);

        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(result.message.includes("non trouvée") ? 404 : 400).json(result);
        }
    } catch (error) {
        console.error('Erreur controller suppression session:', error);
        res.status(500).json({
            success: false,
            message: "Erreur serveur",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
},
async updateSession(req, res) {
  console.log("Requête reçue - Body:", req.body);
  console.log("Requête reçue - Fichiers:", req.files); // Changé de req.file à req.files

  try {
    const { formationId, sessionId } = req.params;
    
    if (!formationId || !sessionId) {
      return res.status(400).json({ 
        success: false, 
        message: "IDs manquants" 
      });
    }

    const file = {
      fiche_programme: req.files['fiche_programme']?.[0], 
      cours_session: req.files['cours_session']?.[0] 
    };

    console.log("Fichiers traités:", file);

    const result = await formationAdminService.updateSession(
      formationId,
      sessionId,
      req.body,
      file
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error("Erreur dans controller:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Erreur serveur"
    });
  }
}
}


module.exports = formationAdminController;