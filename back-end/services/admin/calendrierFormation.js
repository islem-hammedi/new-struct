const CalendrierFormationRepository = require('../../repositories/admin/calendrierFormation');

class CalendrierFormationService {
 

  async updateSessions(sessions) {
    if (!Array.isArray(sessions) || sessions.length === 0) {
      throw new Error("Aucune session à enregistrer.");
    }

    const invalidSessions = sessions.filter(session =>
      !session.id_session || !session.date_debut || !session.date_fin || !session.duree
    );

    if (invalidSessions.length > 0) {
      throw new Error(`${invalidSessions.length} sessions invalides (champs manquants)`);
    }

    await CalendrierFormationRepository.updateSessions(sessions);
    return sessions.length;
  }

  async getDomainesWithSessions() {
    const results = await CalendrierFormationRepository.getDomainesWithSessions();
    const domainesMap = new Map();

    results.forEach(row => {
      if (!domainesMap.has(row.id_formation)) {
        domainesMap.set(row.id_formation, {
          id_formation: row.id_formation,
          domaine: row.domaine,
          sessions: []
        });
      }

      const catalogue = domainesMap.get(row.id_formation);
      if (row.id_session) {
        let session = catalogue.sessions.find(s => s.id_session === row.id_session);
        if (!session) {
          session = {
            id_theme: row.id_theme,
            theme: row.theme,
            code: row.code,
            createdAt: row.createdAt,
            id_session: row.id_session
          };
          catalogue.sessions.push(session);
        }
      }
    });

    return Array.from(domainesMap.values());
  }

async getCalendarSessions() {
  try {
    const results = await CalendrierFormationRepository.getCalendarSessions();

    const domainesMap = new Map();

    results.forEach(row => {
      if (!domainesMap.has(row.id_formation)) {
        domainesMap.set(row.id_formation, {
          id_formation: row.id_formation,
          domaine: row.domaine,
          sessions: []
        });
      }

      const catalogue = domainesMap.get(row.id_formation);
      if (row.id_session) {
        let session = catalogue.sessions.find(s => s.id_session === row.id_session);
        
        if (!session) {
          session = {
            id_theme: row.id_theme,
            theme: row.theme,
            code: row.code,
            createdAt: row.createdAt,
            id_session: row.id_session,
            date_debut: row.date_debut,
            date_fin: row.date_fin,
            duree: row.duree,
            nom_complet: row.nom_complet,
            cv: row.cv,
            fiche_prg: row.fiche_prg,
            type_session: row.type_session,
            mode: row.mode,
            genre: row.genre,
            lieu: row.lieu
          };
          catalogue.sessions.push(session);
        }
      }
    });

    return Array.from(domainesMap.values());
  } catch (error) {
    console.error("Service error in getCalendarSessions:", error);
    throw error;
  }
}

  async deleteSession(id) {
    const exists = await CalendrierFormationRepository.sessionExists(id);
    if (!exists) {
      throw new Error("Session non trouvée");
    }

    const result = await CalendrierFormationRepository.deleteSessionFromCalendar(id);
    const affectedRows = result.affectedRows || result.rowCount || 0;
    return affectedRows > 0;
  }
}

module.exports = new CalendrierFormationService();