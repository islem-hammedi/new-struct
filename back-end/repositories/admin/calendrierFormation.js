const db = require('../../connect');

const updateSessions = async (sessions) => {
  const updatePromises = sessions.map(session =>
    db.query(
      "UPDATE session SET date_debut = ?, date_fin = ?, duree = ? WHERE id_session = ?",
      [session.date_debut, session.date_fin, session.duree, session.id_session]
    )
  );
  return Promise.all(updatePromises);
};

const getDomainesWithSessions = async () => {
  const query = `
    SELECT 
      f.id_formation,
      d.id_domaine,
      d.domaine,
      t.id_theme,
      t.theme,
      t.code,
      s.createdAt,
      s.id_session
    FROM formation f
    JOIN domaine d ON f.id_domaine = d.id_domaine
    JOIN session s ON f.id_formation = s.id_formation
    JOIN theme t ON t.id_theme = s.id_theme;
  `;
  return db.query(query);
};

const getCalendarSessions = async () => {
  const query = `
    SELECT 
      f.id_formation,
      d.id_domaine,
      d.domaine,
      t.id_theme,
      t.theme,
      t.code,
      s.createdAt,
      s.id_session, s.date_debut, s.date_fin, s.duree
    FROM formation f
    JOIN domaine d ON f.id_domaine = d.id_domaine
    JOIN session s ON f.id_formation = s.id_formation
    JOIN theme t ON t.id_theme = s.id_theme
    WHERE s.duree IS NOT NULL AND s.date_fin IS NOT NULL AND s.date_debut IS NOT NULL;
  `;
  return db.query(query);
};

const deleteSession = async (id) => {
  const sessionExists = await db.query(
    "SELECT id_session FROM session WHERE id_session = ?", 
    [id]
  );

  if (!sessionExists || sessionExists.length === 0) {
    return null;
  }

  const updateResult = await db.query(
    `UPDATE session 
     SET date_debut = NULL, date_fin = NULL, duree = NULL
     WHERE id_session = ?`,
    [id]
  );

  return updateResult;
};

module.exports = {
  updateSessions,
  getDomainesWithSessions,
  getCalendarSessions,
  deleteSession,
};