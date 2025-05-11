const eventRepository = require('../../repositories/admin/EventRepository');
const Event = require('../../models/admin/evenement');

class EventService {
  async getAllEvents() {
    try {
      const events = await eventRepository.getAll();
      return events;
    } catch (error) {
      console.error('Erreur dans EventService.getAllEvents:', error);
      throw new Error('Échec de la récupération des événements');
    }
  }

  async createEvent(title, date, createdBy) {
    try {
      const event = new Event({ title, date, created_by: createdBy });
      event.validate();
      return await eventRepository.create(title, date, createdBy);
    } catch (error) {
      console.error('Erreur dans EventService.createEvent:', error);
      throw error;
    }
  }

  async deleteEvent(id, createdBy) {
    try {
      if (!createdBy) {
        throw new Error('Utilisateur non authentifié');
      }
      const success = await eventRepository.delete(id, createdBy);
      if (!success) {
        throw new Error('Événement non trouvé ou non autorisé');
      }
      return success;
    } catch (error) {
      console.error('Erreur dans EventService.deleteEvent:', error);
      throw error;
    }
  }
}

module.exports = new EventService();