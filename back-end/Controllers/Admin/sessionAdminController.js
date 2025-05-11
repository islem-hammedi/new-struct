const SessionService = require('../../services/admin/sessionService');

class SessionController {
  static async updateSession(req, res) {
    try {
      const { id_formation, id_session } = req.params;
      const { code, theme, formateur } = req.body;

      await SessionService.updateSession(id_formation, id_session, code, theme, formateur);
      res.json({ message: 'Session mise à jour avec succès' });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la session:', error);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de la session', error: error.message });
    }
  }

  static async deleteSession(req, res) {
    try {
      const { id_formation, id_session } = req.params;

      await SessionService.deleteSession(id_formation, id_session);
      res.json({ message: 'Session supprimée avec succès' });
    } catch (error) {
      console.error('Erreur lors de la suppression de la session:', error);
      res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
  }

  static async addSession(req, res) {
    try {
      const { id } = req.params;
      const { theme, code, nb_participants, etat, type_session, formateurs } = req.body;

      const sessions = await SessionService.addSession(id, theme, code, nb_participants, etat, type_session, formateurs);
      res.status(201).json({ sessions });
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la session:', error);
      res.status(500).json({ message: 'Erreur lors de l\'ajout de la session', error: error.message });
    }
  }
}

module.exports = SessionController;