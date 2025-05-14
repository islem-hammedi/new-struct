const db = require('../../connect');
const AvisFormateur = require('../../models/admin/avis_f');

class AvisFormateurRepository {
 

  async getBySession(idSession) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT a.*, t.theme
        FROM avis_formateur a
        JOIN session s ON a.id_session = s.id_session
        join theme t ON s.id_theme = t.id_theme
        WHERE a.id_session = ?`;
      
      db.query(sql, [idSession], (err, results) => {
        if (err) return reject(err);
        
        // Transformation des résultats en objets AvisFormateur
        const avisList = results.map(row => new AvisFormateur(row));
        resolve(avisList);
      });
    });
  }

  async create(avisData) {
    return new Promise((resolve, reject) => {
      // Création et validation de l'objet
      const avis = new AvisFormateur(avisData);
      try {
        avis.validate();
      } catch (validationError) {
        return reject(validationError);
      }

      db.query('INSERT INTO avis_formateur SET ?', avisData, (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });
  }
}

module.exports = new AvisFormateurRepository();