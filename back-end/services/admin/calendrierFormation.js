const calendrierFormationRepo = require('../../repositories/admin/calendrierFormation');

const updateCalendrierFormation = async (sessions) => {
  if (sessions.length === 0) {
    throw new Error("Aucune session à enregistrer.");
  }

  const invalidSessions = sessions.filter(session =>
    !session.id_session || !session.date_debut || !session.date_fin || !session.duree
  );

  if (invalidSessions.length > 0) {
    throw new Error(`${invalidSessions.length} sessions invalides (champs manquants)`);
  }

  await calendrierFormationRepo.updateSessions(sessions);
  return `${sessions.length} sessions mises à jour avec succès.`;
};

const fetchDomainesWithSessions = async () => {
  const results = await calendrierFormationRepo.getDomainesWithSessions();
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
};

const fetchCalendarSessions = async () => {
  const results = await calendrierFormationRepo.getCalendarSessions();
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
          duree: row.duree
        };
        catalogue.sessions.push(session);
      }
    }
  });

  return Array.from(domainesMap.values());
};

const removeSessionFromCalendrier = async (id) => {
  const result = await calendrierFormationRepo.deleteSession(id);

  if (!result) {
    throw new Error("Session non trouvée");
  }

  const affectedRows = result.affectedRows || 0;
  if (affectedRows === 0) {
    throw new Error("Erreur lors de la suppression");
  }

  return "Session retirée du calendrier avec succès";
};

module.exports = {
  updateCalendrierFormation,
  fetchDomainesWithSessions,
  fetchCalendarSessions,
  removeSessionFromCalendrier,
};