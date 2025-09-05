const db = require('../../connect');

class CalendrierFormationRepository {
  async updateSessions(sessions) {
    const updatePromises = sessions.map(session =>
      db.query(
        "UPDATE session SET date_debut = ?, date_fin = ?, duree = ? WHERE id_session = ?",
        [session.date_debut, session.date_fin, session.duree, session.id_session]
      )
    );
    return Promise.all(updatePromises);
  }

  async getDomainesWithSessions() {
    const query = `
      SELECT 
        f.id_formation, d.id_domaine, d.domaine,
        t.id_theme, t.theme, t.code,
        s.createdAt, s.id_session
      FROM formation f
      JOIN domaine d ON f.id_domaine = d.id_domaine
      JOIN session s ON f.id_formation = s.id_formation
      JOIN theme t ON t.id_theme = s.id_theme;
    `;
    
 return new Promise((resolve, reject) => {
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });    
  }

async  getCalendarSessions() {
  const query = `
    SELECT 
      f.id_formation,
      d.id_domaine,
      d.domaine,
      t.id_theme,
      t.theme,
      t.code,
      s.createdAt,s.fiche_prg,
      s.id_session,s.date_debut,s.date_fin,s.duree,
      s.type_session,s.mode,s.genre,s.lieu,
      fm.nom_complet,
      fm.cv
    FROM formation f
    JOIN domaine d ON f.id_domaine = d.id_domaine
    JOIN session s ON f.id_formation = s.id_formation
    JOIN formateur fm ON s.id_formateur= fm.id_formateur
    JOIN theme t ON t.id_theme = s.id_theme
    where s.duree is not NULL and s.date_fin is not NULL and s.date_debut is not null;`;
  return new Promise((resolve, reject) => {
    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching calendrier:", err);
        return reject(err);
      }
      resolve(results);
    });
  });
}

  async sessionExists(id) {
    const result = await db.query('SELECT id_session FROM session WHERE id_session = ?', [id]);
    return result && result.length > 0;
  }

  async deleteSessionFromCalendar(id) {
    return db.query(
      `UPDATE session SET date_debut = NULL, date_fin = NULL, duree = NULL WHERE id_session = ?`,
      [id]
    );
  }
}

module.exports =new  CalendrierFormationRepository();
