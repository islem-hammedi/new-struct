


const eventService = require('../../services/admin/calendrierEventService');

class EventController {
  async getEvents(req, res) {
    try {
      const events = await eventService.getAllEvents();
      res.status(200).json(events);
    } catch (error) {
      console.error('Erreur getEvents:', error);
      res.status(500).json({ 
        error: error.message || 'Erreur serveur'
      });
    }
  }

  async createEvent(req, res) {
    try {
      const { title, date, created_by } = req.body;
      const newEvent = await eventService.createEvent(title, date, created_by);
      res.status(201).json(newEvent);
    } catch (error) {
      console.error('Erreur createEvent:', error);
      const status = error.message.includes('invalide') ? 400 : 500;
      res.status(status).json({ error: error.message });
    }
  }

  async deleteEvent(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentification requise' });
      }
      
      await eventService.deleteEvent(
        req.params.id, 
        req.user.nom_admin
      );
      res.status(200).json({ message: 'Événement supprimé' });
    } catch (error) {
      console.error('Erreur deleteEvent:', error);
      const status = error.message.includes('non trouvé') ? 404 : 
                    error.message.includes('non autorisé') ? 403 : 500;
      res.status(status).json({ error: error.message });
    }
  }
}

module.exports = new EventController();