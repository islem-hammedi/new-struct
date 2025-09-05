

  
  const avisService = require('../../services/admin/avis_participantService');

  class AvisController {
    async getAvis(req, res) {
      try {
        const { idSession } = req.params;
        const avis = await avisService.getAvisBySession(idSession);
        res.json(avis);
      } catch (error) {
        if (error.message === 'Aucun avis trouvé pour cette session') {
          return res.status(404).json({ message: error.message });
        }
        console.error("Erreur lors de la récupération des avis:", error);
        res.status(500).json({ error: error.message });
      }
    }
  }
  
  module.exports = new AvisController();