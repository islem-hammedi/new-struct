const FormateurCandidature = require('../../models/admin/FormateurCandidature');
const path = require('path');
const fs = require('fs');
const db = require('../../connect');

class FormateurCandidatureRepository {
  constructor() {

    // Appeler l'initialisation de la table
    this.initializeTable().catch(err => {
      console.error('Échec de l\'initialisation de la table:', err);
    });
  }

  async initializeTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS formateur_candidatures (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(255) NOT NULL,
        telephone VARCHAR(50) NOT NULL,
        email VARCHAR(255) NOT NULL,
        domaine VARCHAR(255) NOT NULL,
        themes TEXT NOT NULL,
        motivation TEXT NOT NULL,
        cv_path VARCHAR(255) NOT NULL,
        certificats_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    try {
      await db.query(sql);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la table:', error);
      throw error;
    }
  }

  

  async createCandidature(data, files) {
    try {
      // Vérification des fichiers
      if (!files?.cv?.[0]) {
        throw new Error('Le fichier CV est requis');
      }

      // Récupère juste le nom du fichier (sans le chemin)
      const cvFilename = files.cv[0].filename;
      let certificatsFilename = null;
      
      if (files.certificats?.[0]) {
        certificatsFilename = files.certificats[0].filename;
      }

      // Validation des données
      const candidature = new FormateurCandidature({
        ...data,
        cv_path: cvFilename, // Stocke seulement le nom du fichier
        certificats_path: certificatsFilename
      });

      candidature.validate();

      // Insertion en base
      const sql = `
        INSERT INTO formateur_candidatures 
        (nom, telephone, email, domaine, themes, motivation, cv_path, certificats_path)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await db.query(sql, [
        candidature.nom,
        candidature.telephone,
        candidature.email,
        candidature.domaine,
        candidature.themes,
        candidature.motivation,
        candidature.cv_path,
        candidature.certificats_path
      ]);
      
      return {
        id: result.insertId,
        ...candidature.toJSON()
      };

    } catch (error) {
      console.error('Erreur dans createCandidature:', error);
      // Nettoyage des fichiers en cas d'erreur
      if (files?.cv?.[0]?.path) fs.unlinkSync(files.cv[0].path);
      if (files?.certificats?.[0]?.path) fs.unlinkSync(files.certificats[0].path);
      throw error;
    }}

    // Dans FormateurCandidatureRepository.js
    async getAll() {
        try {
            console.log('Exécution de la requête...');
            
            // Utilisez une promesse pour wrapper le callback-style de mysql
            const rows = await new Promise((resolve, reject) => {
                db.query(
                    `SELECT 
                        id, nom, telephone as cin, email, 
                        domaine , themes , 
                        motivation, cv_path, certificats_path as diplome_path,
                        status,
                        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i:%s') as created_at 
                    FROM formateur_candidatures`,
                    (error, results) => {
                        if (error) {
                            console.error('Erreur de requête:', error);
                            return reject(error);
                        }
                        resolve(results);
                    }
                );
            });
    
            
            if (!rows.length) {
                console.warn('Aucune donnée trouvée dans la table formateur_candidatures');
                // Vérifiez directement dans la base
            }
    
            return rows.map(row => {
                return new FormateurCandidature(row);
            });
        } catch (error) {
            console.error('Erreur complète:', {
                message: error.message,
                stack: error.stack,
                sql: error.sql
            });
            throw new Error('Erreur serveur lors de la récupération des données');
        }
    }
      
      async getById(id) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM formateur_candidatures WHERE id = ?';
            
            db.query(query, [id], (error, results) => {
                if (error) {
                    console.error('Database query error:', error);
                    return reject(new Error('Database operation failed'));
                }
                
                if (!results || results.length === 0) {
                    console.log('No formateur candidature found for ID:', id);
                    return resolve(new FormateurCandidature({})); // Retourne un formateur vide
                }
                
                resolve(new FormateurCandidature(results[0]));
            });
        });
    }
    async updateStatus(id, status) {
        return new Promise((resolve, reject) => {
          db.query(
            'UPDATE formateur_candidatures SET status = ? WHERE id = ?',
            [status, id],
            (error, results) => {
              if (error) return reject(error);
              if (results.affectedRows === 0) {
                return reject(new Error('Candidature non trouvée'));
              }
              resolve(this.getById(id));
            }
          );
        });
      }
    
      async delete(id) {
        return new Promise((resolve, reject) => {
          db.query(
            'DELETE FROM formateur_candidatures WHERE id = ?',
            [id],
            (error, results) => {
              if (error) return reject(error);
              if (results.affectedRows === 0) {
                return reject(new Error('Candidature non trouvée'));
              }
              resolve(true);
            }
          );
        });
      }
    
      async getById(id) {
        return new Promise((resolve, reject) => {
          db.query(
            'SELECT * FROM formateur_candidatures WHERE id = ?',
            [id],
            (error, results) => {
              if (error) return reject(error);
              resolve(results[0] || null);
            }
          );
        });
      }
    
     
}
module.exports = new FormateurCandidatureRepository();