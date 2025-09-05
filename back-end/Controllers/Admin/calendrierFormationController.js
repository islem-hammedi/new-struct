
const CalendrierFormationService = require('../../services/admin/calendrierFormation');
class CalendrierFormationController {
 

  async calendrierFormation(req, res) {
    try {
      const updatedCount = await CalendrierFormationService.updateSessions(req.body);
      res.json({
        success: true,
        message: `${updatedCount} sessions mises à jour avec succès.`,
        updatedCount
      });
    } catch (error) {
      console.error("Erreur serveur:", error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  async getDomainesWithSessions(req, res) {
    try {
      const data = await CalendrierFormationService.getDomainesWithSessions();
      res.json(data);
    } catch (error) {
      console.error("Erreur serveur:", error);
      res.status(500).json({ error: error.message });
    }
  }

  async getCalendarSessions(req, res) {
  try {
    const sessions = await CalendrierFormationService.getCalendarSessions();
    res.json(sessions);
   // res.status(200).json(sessions);
  } catch (error) {
    console.error("Error in getCalendarSessions:", error);
    res.status(500).json({ error: error.message });
  }
}

  async deletSessionFromCalendrier(req, res) {
    try {
      const { id } = req.params;
      const success = await CalendrierFormationService.deleteSession(id);
      res.json({
        success: true,
        message: 'Session retirée du calendrier avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      res.status(error.message === "Session non trouvée" ? 404 : 500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports =new CalendrierFormationController();
