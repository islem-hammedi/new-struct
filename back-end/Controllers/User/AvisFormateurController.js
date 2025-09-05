const AvisFormateurService = require('../../services/user/AvisFormateurService');

class AvisFormateurController {
  async getThemesByFormateur(req, res) {
    try {
      const formateurId = req.user.id; // Récupéré du middleware d'authentification
      const sessions = await AvisFormateurService.getThemesByFormateur(formateurId);
      res.json(sessions);
    } catch (error) {
      console.error("Erreur lors de la récupération des thèmes:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async submitEvaluation(req, res) {
    try {
      const { id_presence, id_participant, evaluations } = req.body;
      const id_formateur = req.user.id;
      
      const result = await AvisFormateurService.submitEvaluation(
        evaluations, 
        id_presence, 
        id_formateur,
        id_participant
      );
      
      res.status(201).json(result);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'évaluation:", error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AvisFormateurController();