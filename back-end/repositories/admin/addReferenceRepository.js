const db = require('../../connect');
const Reference = require('../../models/admin/Reference');

class AddReferenceRepository {
     constructor() {
    this.initTable(); 
  }
      async initTable() {
    const createTableQuery = `
     CREATE TABLE IF NOT EXISTS reference (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  lien VARCHAR(100) UNIQUE NOT NULL,
  logo VARCHAR(100) NOT NULL,
  secteur VARCHAR(100) NOT NULL ,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
    
    try {
      await db.query(createTableQuery);
      console.log('✅ Table reference initialisée');
    } catch (error) {
      console.error('❌ Erreur création table reference:', error);
      throw error;
    }
  }
    async createReference(nom, lien, logoPath, secteur) {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO reference (nom, lien, logo,secteur) VALUES (?, ?, ?, ?)';
            
            db.query(query, [nom, lien, logoPath, secteur], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(new Reference(results.insertId, nom, lien, logoPath, secteur));
            });
        });
    }

    async checkReferenceExists(nom) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM reference WHERE nom = ?';
            
            db.query(query, [nom], (error, results) => {
                if (error) {
                    return reject(error);
                }
                resolve(results.length > 0);
            });
        });
    }
}

module.exports = AddReferenceRepository;