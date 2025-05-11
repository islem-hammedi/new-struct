{/*const db = require('../../connect');

class DomainService {
  async addDomain({ domaineName, abbreviation, themes }) {
   
    try {
    
      // 2. Insérer le domaine
      const [domaineResult] = await db.query(
        'INSERT INTO domaine (domaine) VALUES (?)',
        [domaineName]
      );
      const id_domaine = domaineResult.insertId;

      // 3. Insérer les thèmes et gérer les formateurs
      const themeResults = [];
      
      for (const theme of themes) {
        const { name, code, formateurs } = theme;

        // Insérer le thème
        const [themeResult] = await db.query(
          'INSERT INTO theme (theme, code, id_domaine) VALUES (?, ?, ?)',
          [name, code, id_domaine]
        );
        const id_theme = themeResult.insertId;
        themeResults.push({ id_theme, id_domaine });

        // Mettre à jour les formateurs
        for (const formateur of formateurs) {
          const [existing] = await db.query(
            'SELECT themes_a_enseigner FROM formateur WHERE id_formateur = ?',
            [formateur.id_formateur]
          );

          let existingThemes = {};
          if (existing[0]?.themes_a_enseigner) {
            try {
              existingThemes = JSON.parse(existing[0].themes_a_enseigner);
            } catch (e) {
              console.error("Erreur parsing JSON:", e);
            }
          }

          // Mettre à jour avec le nouveau thème
          const updatedThemes = {
            ...existingThemes,
            [name]: formateur.rang
          };

         
        }
      }

      await db.commit();
      return {
        id_domaine,
        themes: themeResults
      };
    } catch (error) {
      if (db) await db.rollback();
      console.error("Erreur dans addDomain:", error);
      throw error;
    } 
  }
}

module.exports = new DomainService();*/}
















const db = require('../../connect');

class DomainService {
  async addDomain({ domaineName, abbreviation, themes }) {
    try {
      // Démarrer la transaction
      await new Promise((resolve, reject) => {
        db.beginTransaction(err => {
          if (err) return reject(err);
          resolve();
        });
      });

      // 1. Insérer le domaine
      const domaineResult = await new Promise((resolve, reject) => {
        db.query(
          'INSERT INTO domaine (domaine) VALUES (?)',
          [domaineName],
          (err, result) => err ? reject(err) : resolve(result)
        );
      });
      const id_domaine = domaineResult.insertId;

      // 2. Insérer les thèmes et gérer les formateurs
      const themeResults = [];
      
      for (const theme of themes) {
        const { name, code, formateurs } = theme;

        // Insérer le thème
        const themeResult = await new Promise((resolve, reject) => {
          db.query(
            'INSERT INTO theme (theme, code, id_domaine) VALUES (?, ?, ?)',
            [name, code, id_domaine],
            (err, result) => err ? reject(err) : resolve(result)
          );
        });
        const id_theme = themeResult.insertId;
        themeResults.push({ id_theme, id_domaine });

        // Mettre à jour les formateurs
        for (const formateur of formateurs) {
          // Récupérer les thèmes existants
          const existing = await new Promise((resolve, reject) => {
            db.query(
              'SELECT themes_a_enseigner FROM formateur WHERE id_formateur = ?',
              [formateur.id_formateur],
              (err, results) => err ? reject(err) : resolve(results)
            );
          });

          let existingThemes = {};
          if (existing[0]?.themes_a_enseigner) {
            try {
              existingThemes = JSON.parse(existing[0].themes_a_enseigner);
            } catch (e) {
              console.error("Erreur parsing JSON:", e);
            }
          }

          // Mettre à jour avec le nouveau thème
          const updatedThemes = {
            ...existingThemes,
            [name]: formateur.rang
          };

          await new Promise((resolve, reject) => {
            db.query(
              `UPDATE formateur 
               SET domaine_de_competences = ?,
                   themes_a_enseigner = ?
               WHERE id_formateur = ?`,
              [
                domaineName,
                JSON.stringify(updatedThemes),
                formateur.id_formateur
              ],
              (err, result) => err ? reject(err) : resolve(result)
            );
          });
        }
      }

      // Valider la transaction
      await new Promise((resolve, reject) => {
        db.commit(err => {
          if (err) return reject(err);
          resolve();
        });
      });

      return {
        id_domaine,
        themes: themeResults
      };
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      await new Promise(resolve => {
        db.rollback(() => resolve());
      });
      console.error("Erreur dans addDomain:", error);
      throw error;
    }
  }
}

module.exports = new DomainService();