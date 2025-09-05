
  const avisFormateurService = require('../../services/admin/avis_formateur');

class AvisFormateurController {
  async getAvisFormateur(req, res) {
    try {
      const { idSession } = req.params;
      const avis = await avisFormateurService.getAvisBySession(idSession);
      res.json(avis);
    } catch (error) {
      if (error.message === 'Aucun avis trouvé pour cette session') {
        return res.status(404).json({ message: error.message });
      }
      console.error("Erreur lors de la récupération des avis:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async createAvisFormateur(req, res) {
    try {
      const avisId = await avisFormateurService.createAvis(req.body);
      res.status(201).json({ id_avis: avisId });
    } catch (error) {
      console.error("Erreur lors de la création de l'avis:", error);
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new AvisFormateurController();