const FormateurCandidatureService = require('../../services/User/FormateurCandidatureService');

class FormateurCandidatureController {
    async submitCandidature(req, res) {
        try {
          const { body, files } = req;
          
          if (!files?.cv) {
            return res.status(400).json({
              success: false,
              message: 'Le fichier CV est requis'
            });
          }
      
          const candidature = await FormateurCandidatureService.submitCandidature(body, files);
          
          res.status(201).json({
            success: true,
            message: 'Candidature soumise avec succès',
            data: {
              ...candidature,
              cv_url: `/uploads/${candidature.cv_path}`, // URL d'accès au fichier
              certificats_url: candidature.certificats_path 
                ? `/uploads/${candidature.certificats_path}`
                : null
            }
          });
      
        } catch (error) {
          console.error('Erreur dans submitCandidature:', error);
          res.status(500).json({
            success: false,
            message: error.message
          });
        }
      }
      async getDemandes(req, res) {
        try {
            console.log('Début de getDemandes');
            const demandes = await FormateurCandidatureService.getAllCandidatures();
            console.log('Demandes récupérées:', demandes);
            
            if (!demandes || demandes.length === 0) {
                console.warn('Aucune demande trouvée');
                return res.status(404).json({ message: 'Aucune demande trouvée' });
            }
            
            res.json(demandes);
        } catch (error) {
            console.error('Erreur dans getDemandes:', error);
            res.status(500).json({ 
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
    
    async traiterDemande(req, res) {
        try {
          const { id } = req.params;
          const { action } = req.body;
      
          if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({ error: 'Action invalide' });
          }
      
          const result = await FormateurCandidatureService.traiterDemande(id, action);
          
          if (action === 'accept') {
            res.json(result);
          } else {
            res.json({ message: 'Candidature refusée et supprimée avec succès' });
          }
        } catch (error) {
          console.error('Erreur contrôleur:', error);
          res.status(500).json({ 
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
          });
        }
      }
    // Dans FormateurCandidatureController.js
async getAcceptedFormateurs(req, res) {
    try {
      const candidatures = await FormateurCandidatureService.getByStatus('accepted');
      res.json(candidatures);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new FormateurCandidatureController();