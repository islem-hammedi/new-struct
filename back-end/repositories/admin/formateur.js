const db = require('../../connect');

class FormateurRepository {
  async getAllFormateurs() {
    const query = 'SELECT * FROM formateur';
    return new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  async getFichePrgByFormateurId(idFormateur) {
    const query = 'SELECT fiche_prg FROM session WHERE id_formateur = ?';
    return new Promise((resolve, reject) => {
      db.query(query, [idFormateur], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  async getCoursSessionByFormateurId(idFormateur) {
    const query = 'SELECT cours_session FROM session WHERE id_formateur = ?';
    return new Promise((resolve, reject) => {
      db.query(query, [idFormateur], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  async getFormateurById(idFormateur) {
    const query = 'SELECT * FROM formateur WHERE id_formateur = ?';
    return new Promise((resolve, reject) => {
      db.query(query, [idFormateur], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }
/*}
  async getFormateurById(id) {
    const query = 'SELECT cv FROM formateur WHERE id_formateur = ?';
    return new Promise((resolve, reject) => {
      db.query(query, [id], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }
*/
  async updateFormateur(fields, values, id) {
    const query = `UPDATE formateur SET ${fields} WHERE id_formateur = ?;`;
    return new Promise((resolve, reject) => {
      db.query(query, [...values, id], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

async deleteFormateur(id) {
  return new Promise((resolve, reject) => {
    db.beginTransaction((err) => {
      if (err) {
        return reject(err);
      }

      console.log('🔄 Début de la suppression en cascade du formateur:', id);

      const updateSessionsQuery = 'UPDATE session SET id_formateur = NULL WHERE id_formateur = ?';
      
      db.query(updateSessionsQuery, [id], (err, updateResults) => {
        if (err) {
          console.error('❌ Erreur mise à jour sessions:', err);
          return db.rollback(() => {
            reject(err);
          });
        }

        console.log('Sessions mises à jour:', updateResults.affectedRows, 'lignes');

        const deleteFormateurQuery = 'DELETE FROM formateur WHERE id_formateur = ?';
        
        db.query(deleteFormateurQuery, [id], (err, deleteResults) => {
          if (err) {
            console.error('Erreur suppression formateur:', err);
            return db.rollback(() => {
              reject(err);
            });
          }

          console.log('Formateur supprimé avec succès');

          db.commit((err) => {
            if (err) {
              console.error('❌ Erreur commit transaction:', err);
              return db.rollback(() => {
                reject(err);
              });
            }
            resolve({
              ...deleteResults,
              sessionsUpdated: updateResults.affectedRows
            });
          });
        });
      });
    });
  });
}

  async addFormateur(data) {
    const query = `
      INSERT INTO formateur (nom_complet, mail, adr, domaine_de_competences, themes_a_enseigner, 
      tarif_journalier, nb_formations, tel, cv, mdp_formateur, niveau_etude, nb_experience, horraire_jour, 
      nom_banque, RIB, domaine_assistance, retour_sacConsulting) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    return new Promise((resolve, reject) => {
      db.query(query, data, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  async getDomaineThemes() {
    const query = `
      SELECT d.domaine, t.theme 
      FROM domaine d 
      JOIN theme t ON d.id_domaine = t.id_domaine
    `;
    return new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }
}

module.exports = new FormateurRepository();