const db = require('../../connect');

class Domaine {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS domaine (
        id_domaine INT AUTO_INCREMENT PRIMARY KEY,
        nom_domaine VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await db.query(query);
  }

  static async syncTable() {
    await this.createTable();
  }

  constructor({ id_domaine, nom_domaine }) {
    this.id_domaine = id_domaine;
    this.nom_domaine = nom_domaine;
  }

  static async create({ nom_domaine }) {
    const query = 'INSERT INTO domaine (domaine) VALUES (?)';
    const [result] = await db.query(query, [domaine]);
    return new Domaine({ id_domaine: result.insertId, domaine });
  }
}

module.exports = Domaine;