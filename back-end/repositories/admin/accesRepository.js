const db = require('../../connect');
const Acces = require('../../models/admin/acces');

class AccesRepository {
  constructor() {
    this.initTable();
  }

  async initTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS acces (
        id_acces INT PRIMARY KEY,
        nom_acces VARCHAR(50) NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `;
    
    return new Promise((resolve, reject) => {
      db.query(createTableQuery, (err) => {
        if (err) {
          console.error('❌ Erreur création table acces:', err);
          return reject(err);
        }
        this.seedDefaultData()
          .then(() => {
            //console.log('✅ Table acces initialisée');
            resolve();
          })
          .catch(reject);
      });
    });
  }

  async seedDefaultData() {
    const defaultData = [
      { id_acces: 1, nom_acces: 'visiteur' },
      { id_acces: 2, nom_acces: 'editeur_formateur' },
      { id_acces: 3, nom_acces: 'editeur_formation' },
      { id_acces: 4, nom_acces: 'super_admin' }
    ];

    const promises = defaultData.map(data => {
      return new Promise((resolve, reject) => {
        db.query(
          'INSERT IGNORE INTO acces (id_acces, nom_acces) VALUES (?, ?)',
          [data.id_acces, data.nom_acces],
          (err) => err ? reject(err) : resolve()
        );
      });
    });

    return Promise.all(promises);
  }

  async getAll() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM acces', (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  }

  async getByAdmin(id_admin) {
    return new Promise((resolve, reject) => {
      db.query(
        `SELECT a.nom_acces 
         FROM admin ad
         JOIN acces a ON ad.id_acces = a.id_acces
         WHERE ad.id_admin = ?`,
        [id_admin],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.length ? results[0] : null);
        }
      );
    });
  }

  async updateAdminAccess(id_admin, id_acces) {
    return new Promise((resolve, reject) => {
      db.query(
        'UPDATE admin SET id_acces = ? WHERE id_admin = ?',
        [id_acces, id_admin],
        (err, result) => {
          if (err) return reject(err);
          resolve(result.affectedRows > 0);
        }
      );
    });
  }
}

module.exports = new AccesRepository();