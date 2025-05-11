const db = require('../../connect');

const updateSessions = async (sessions) => {
  const updatePromises = sessions.map(session => 
    db.query(
      "UPDATE session SET date_debut = ?, date_fin = ?, duree = ? WHERE id_session = ?",
      [session.date_debut, session.date_fin, session.duree, session.id_session]
    )
  );

  const results = await Promise.all(updatePromises);
  return results.length;
};

const fetchDomainesWithSessions = async () => {
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

  const [results] = await db.query(query);
  return results;
};

module.exports = {
  updateSessions,
  fetchDomainesWithSessions
};