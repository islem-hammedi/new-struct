const mysql = require('mysql2/promise');
const Entreprise = require('./entreprise.model'); // Import de votre classe Entreprise

class EntrepriseRepository {
  constructor(dbConfig) {
    this.pool = mysql.createPool(dbConfig);
  }

  async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS entreprise (
        id_entreprise INT AUTO_INCREMENT PRIMARY KEY,
        nom_entreprise VARCHAR(100) NOT NULL,
        tel_entreprise VARCHAR(20),
        email_entreprise VARCHAR(100) UNIQUE,
        adr_entreprise TEXT,
        matricule VARCHAR(50) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `;
    await this.pool.query(query);
  }


  async create(entreprise) {
    const query = `
      INSERT INTO entreprise 
        (nom_entreprise, tel_entreprise, email_entreprise, adr_entreprise, matricule)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      entreprise.nom_entreprise,
      entreprise.tel_entreprise,
      entreprise.email_entreprise,
      entreprise.adr_entreprise,
      entreprise.matricule
    ];

    const [result] = await this.pool.query(query, params);
    return this.getById(result.insertId);
  }


  async getById(id) {
    const query = 'SELECT * FROM entreprise WHERE id_entreprise = ?';
    const [rows] = await this.pool.query(query, [id]);
    
    if (rows.length === 0) return null;
    return new Entreprise(rows[0]);
  }

 
  async getAll() {
    const query = 'SELECT * FROM entreprise';
    const [rows] = await this.pool.query(query);
    return rows.map(row => new Entreprise(row));
  }

 
  async update(id, updates) {
    const existing = await this.getById(id);
    if (!existing) return null;

    const query = `
      UPDATE entreprise SET
        nom_entreprise = ?,
        tel_entreprise = ?,
        email_entreprise = ?,
        adr_entreprise = ?,
        matricule = ?
      WHERE id_entreprise = ?
    `;
    const params = [
      updates.nom_entreprise || existing.nom_entreprise,
      updates.tel_entreprise || existing.tel_entreprise,
      updates.email_entreprise || existing.email_entreprise,
      updates.adr_entreprise || existing.adr_entreprise,
      updates.matricule || existing.matricule,
      id
    ];

    await this.pool.query(query, params);
    return this.getById(id);
  }

  async delete(id) {
    const query = 'DELETE FROM entreprise WHERE id_entreprise = ?';
    const [result] = await this.pool.query(query, [id]);
    return result.affectedRows > 0;
  }


  async search(searchTerm) {
    const query = `
      SELECT * FROM entreprise 
      WHERE nom_entreprise LIKE ? 
         OR email_entreprise LIKE ? 
         OR matricule LIKE ?
    `;
    const searchParam = `%${searchTerm}%`;
    const [rows] = await this.pool.query(query, [searchParam, searchParam, searchParam]);
    return rows.map(row => new Entreprise(row));
  }
}

module.exports = EntrepriseRepository;