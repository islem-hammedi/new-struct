


const candidature_formateur = require('../../models/user/candidature');

const db = require('../../connect');

class FormateurCandidatureRepository {
    constructor() {
        this.initializeTable();
    }

    async initializeTable() {
        try {
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS formateur_candidatures (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    nom VARCHAR(50) NOT NULL,
                    themes VARCHAR(255) NOT NULL,
                    domaine VARCHAR(255)  NOT NULL,
                   motivation TEXT  NOT NULL,
                    cv_path VARCHAR(255) NOT NULL,
                    telephone VARCHAR(100) NOT NULL,
                    email VARCHAR (255) ,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )`;
            
            await db.query(createTableQuery);
        } catch (err) {
            console.error('Erreur lors de l\'initialisation de la table:', err);
            throw err;
        }
    }

    async createCandidature(data) {
        try {
            const query = `
                INSERT INTO formateur_candidatures 
        (nom, telephone, email, domaine, themes, motivation, cv_path, created_at)
        VALUES (?, ?, ?, ?, ?, ?,  ?, NOW()) `;
            
            const result = await db.query(query, [
              data.nom,
               data.telephone,
              data.email,
              data.domaine,
                data.themes,
                data.motivation || null,
                data.cv_path || null
            ]);

            return new candidature_formateur({
                id: result.insertId,
                ...data
            });

        } catch (err) {
            console.error('Repository Error - createCandidature:', err);
            throw err;
        }
    }

      
    






async getAll  () {
  const query =  `SELECT 
                    id,
                    nom,
                    telephone,
                    email,
                    domaine,
                    themes,
                    motivation,
                    cv_path,
                    created_at
                FROM formateur_candidatures 
                ORDER BY created_at DESC`;
  return new Promise((resolve, reject) => {
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error in getAllCandidature:', error);
        return reject(error);
      }
      resolve(results);
    });
  });
};





}

module.exports = FormateurCandidatureRepository;