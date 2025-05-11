const SessionRepository = require('../../repositories/admin/sessionRepository');

class SessionService {
  static async updateSession(id_formation, id_session, code, theme, formateur) {
    await SessionRepository.checkSession(id_formation, id_session);
    await SessionRepository.checkFormateur(formateur);
    await SessionRepository.updateSession(id_session, code, theme, formateur);
  }

  static async deleteSession(id_formation, id_session) {
    await SessionRepository.deleteSession(id_formation, id_session);
  }

  static async addSession(id_formation, theme, code, nb_participants, etat, type_session, formateurs) {
    const sessionId = await SessionRepository.addSession(id_formation, theme, code, nb_participants, etat, type_session);

    if (formateurs && formateurs.length > 0) {
      for (const id_formateur of formateurs) {
        await SessionRepository.addFormateurToSession(sessionId, id_formateur);
      }
    }

    return await SessionRepository.getSessionsByFormation(id_formation);
  }
}

module.exports = SessionService;