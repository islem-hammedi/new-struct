const db = require('../../connect');
const Theme = require('../../models/admin/theme');

class ThemeRepository {
  async create(nom_theme, code, id_domaine) {
    const [result] = await db.query(
      'INSERT INTO theme (nom_theme, code, id_domaine) VALUES (?, ?, ?)',
      [nom_theme, code, id_domaine]
    );
    return new Theme({
      id_theme: result.insertId,
      nom_theme,
      code,
      id_domaine
    });
  }

  async findByDomaine(id_domaine) {
    const [rows] = await db.query(
      'SELECT * FROM theme WHERE id_domaine = ?',
      [id_domaine]
    );
    return rows.map(row => new Theme(row));
  }
}

module.exports = new ThemeRepository();