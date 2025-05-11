const formationAdminService = require('../../services/admin/formationService');

// Ensure uploads directory exists


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

    addFormation: async (req, res) => {
      try {
          const { domaine } = req.body;
          const sessions = JSON.parse(req.body.sessions);
          const files = req.files;

          const result = await formationAdminService.createFormationWithSessions(
              domaine,
              sessions,
              files
          );

          if (result.success) {
              res.status(201).json(result);
          } else {
              res.status(400).json(result);
          }
      } catch (error) {
          console.error("Erreur:", error);
          res.status(500).json({ 
              success: false,
              message: 'Erreur serveur',
              error: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
        const { id } = req.params;
        
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: "ID de session invalide"
            });
        }

        const result = await formationAdminService.deleteSession(parseInt(id));

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
}
};
 


module.exports = formationAdminController;