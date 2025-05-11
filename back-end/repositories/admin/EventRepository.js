const db = require('../../connect');
const Event = require('../../models/admin/evenement');

class EventRepository {
  constructor() {
    this.initTable();
  }

  async initTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS calendrier (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        date DATETIME NOT NULL,
        created_by VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    return new Promise((resolve, reject) => {
      db.query(createTableQuery, (err) => {
        if (err) {
          console.error('❌ Erreur création table calendrier:', err);
          return reject(err);
        }
       // console.log('✅ Table "calendrier" initialisée');
        resolve();
      });
    });
  }

  async getAll() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM calendrier', (err, results) => {
        if (err) {
          console.error('Erreur dans EventRepository.getAll:', err);
          return reject(err);
        }
        resolve(results.map(row => new Event({
          id: row.id,
          title: row.title,
          date: row.date,
          created_by: row.created_by
        })));
      });
    });
  }

  async create(title, date, createdBy) {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO calendrier (title, date, created_by) VALUES (?, ?, ?)';
      db.query(query, [title, date, createdBy], (err, result) => {
        if (err) {
          console.error('Erreur dans EventRepository.create:', err);
          return reject(err);
        }
        resolve(new Event({
          id: result.insertId,
          title,
          date,
          created_by: createdBy
        }));
      });
    });
  }

  async delete(id, createdBy) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM calendrier WHERE id = ? AND created_by = ?';
      db.query(query, [id, createdBy], (err, result) => {
        if (err) {
          console.error('Erreur dans EventRepository.delete:', err);
          return reject(err);
        }
        resolve(result.affectedRows > 0);
      });
    });
  }
}

module.exports = new EventRepository();