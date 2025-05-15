const db = require('../../connect');

class CatalogueRepository {
  static fetchCatalogue() {
    const query = `
      SELECT d.domaine, d.id_domaine as id_formation, t.id_theme, t.theme, t.code,
        fm.id_formateur, fm.nom_complet, fm.mail, fm.adr, fm.domaine_de_competences,
        fm.themes_a_enseigner, fm.tarif_journalier, fm.tel, fm.cv, fm.niveau_etude, fm.nb_experience
      FROM domaine d
      LEFT JOIN theme t ON t.id_domaine = d.id_domaine
      LEFT JOIN formateur fm ON JSON_CONTAINS(JSON_KEYS(fm.themes_a_enseigner), JSON_QUOTE(t.theme), '$')
      ORDER BY d.domaine;
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

  static fetchThemeById(id_theme) {
    const query = 'SELECT theme, code FROM theme WHERE id_theme = ?';
    return new Promise((resolve, reject) => {
      db.query(query, [id_theme], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  static fetchFormateursByTheme(theme) {
    const query = `
      SELECT 
        fm.id_formateur,
        fm.nom_complet,
        fm.themes_a_enseigner
      FROM formateur fm
      WHERE JSON_CONTAINS(JSON_KEYS(fm.themes_a_enseigner), JSON_QUOTE(?))
    `;
    return new Promise((resolve, reject) => {
      db.query(query, [theme], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }
  static async addThemeToDomain(domaineName, abbreviation, themes) {
    const abbreviationToUse = abbreviation || '';

    return new Promise((resolve, reject) => {
      db.beginTransaction(async (err) => {
        if (err) {
          return reject(new Error("Erreur de transaction"));
        }

        try {
          // Vérifier si le domaine existe déjà
          const checkDomain = await new Promise((resolve, reject) => {
            db.query(
              'SELECT domaine FROM domaine WHERE domaine = ? LIMIT 1',
              [domaineName],
              (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
              }
            );
          });

          if (!checkDomain) {
            return reject(new Error("Domaine non trouvé"));
          }

          // Récupérer le dernier code de thème pour ce domaine
          const lastCodeQuery = `
            SELECT t.code 
            FROM theme t
            JOIN domaine d ON t.id_domaine = d.id_domaine
            WHERE d.domaine = ?
            ORDER BY 
              LENGTH(t.code) DESC, 
              t.code DESC
            LIMIT 1
          `;
          const lastCodeResult = await new Promise((resolve, reject) => {
            db.query(lastCodeQuery, [domaineName], (err, results) => {
              if (err) return reject(err);
              resolve(results[0]);
            });
          });

          let lastNumber = 0;
          let existingPrefix = abbreviationToUse;

          if (lastCodeResult && lastCodeResult.code) {
            const match = lastCodeResult.code.match(/^([A-Za-z]*)(\d+)$/);
            if (match) {
              existingPrefix = match[1] || abbreviationToUse;
              lastNumber = parseInt(match[2], 10);
            }
          }

          // Insérer les thèmes
          const sessionPromises = themes.map(async (theme, index) => {
            const { name, formateurs } = theme;

            const nextNumber = lastNumber + 1;
            lastNumber = nextNumber;

            const formattedNumber = String(nextNumber).padStart(3, '0');
            const code = `${existingPrefix}${formattedNumber}`;

            // Créer une entrée dans la table "formation"
            const formationResult = await new Promise((resolve, reject) => {
              db.query(
                'INSERT INTO domaine (domaine) VALUES (?)',
                [domaineName],
                (err, result) => {
                  if (err) return reject(err);
                  resolve(result);
                }
              );
            });
            const new_id_domaine = formationResult.insertId;

            // Insérer le thème dans la table "theme"
            const querySession = 'INSERT INTO theme (theme, code, id_domaine) VALUES (?, ?, ?)';
            const sessionResult = await new Promise((resolve, reject) => {
              db.query(
                querySession,
                [name, code, new_id_domaine],
                (err, result) => {
                  if (err) return reject(err);
                  resolve(result);
                }
              );
            });
            const id_theme = sessionResult.insertId;

            // Mettre à jour les formateurs
            const formateurPromises = formateurs.map((formateur) => {
              const themeEnseignement = { [name]: formateur.rang };

              return new Promise((resolve, reject) => {
                db.query(
                  'SELECT themes_a_enseigner FROM formateur WHERE id_formateur = ?',
                  [formateur.id_formateur],
                  (err, results) => {
                    if (err) return reject(err);

                    let existingThemes = {};
                    if (results[0]?.themes_a_enseigner) {
                      try {
                        existingThemes = JSON.parse(results[0].themes_a_enseigner);
                      } catch (e) {
                        console.error("Erreur parsing JSON:", e);
                      }
                    }

                    const updatedThemes = {
                      ...existingThemes,
                      ...themeEnseignement,
                    };

                    db.query(
                      `UPDATE formateur 
                       SET domaine_de_competences = ?,
                           themes_a_enseigner = ?
                       WHERE id_formateur = ?`,
                      [domaineName, JSON.stringify(updatedThemes), formateur.id_formateur],
                      (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                      }
                    );
                  }
                );
              });
            });

            await Promise.all(formateurPromises);
            return { 
              id_theme, 
              id_domaine: new_id_domaine,
              theme: name,
              code: code 
            };
          });

          const results = await Promise.all(sessionPromises);

          // Valider la transaction
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                reject(err);
              });
            }

            resolve({
              message: 'Thèmes créés avec succès',
              results: results.map((r) => ({
                id_domaine: r.id_domaine,
                id_theme: r.id_theme,
                theme: r.theme,
                code: r.code,
              })),
              domaine: domaineName,
            });
          });
        } catch (error) {
          db.rollback(() => {
            reject(error);
          });
        }
      });
    });
  }

  static deleteDomain(id_formation) {
    const query = 'DELETE FROM domaine WHERE id_domaine = ?';
    return new Promise((resolve, reject) => {
      db.query(query, [id_formation], (err, result) => {
        if (err) {
          return reject(err);
        }
        if (result.affectedRows === 0) {
          return reject(new Error('No domain found with the given ID'));
        }
        resolve({ message: 'Domaine supprimé avec succès' });
      });
    });
  }

  static deleteTheme(id_domaine, id_theme) {
    const query = 'DELETE FROM theme WHERE id_domaine = ? AND id_theme = ?';
    return new Promise((resolve, reject) => {
      db.query(query, [id_domaine, id_theme], (err, result) => {
        if (err) {
          return reject(err);
        }
        if (result.affectedRows === 0) {
          return reject(new Error('No theme found with the given ID'));
        }
        resolve({ message: `Thème ${id_theme} supprimé du domaine ${id_domaine}` });
      });
    });
  }

  static async updateTheme(id_theme, formateursToAdd, formateursToRemove) {
    return new Promise((resolve, reject) => {
      // 1. Récupérer le nom du thème
      const themeQuery = 'SELECT theme FROM theme WHERE id_theme = ?';

      db.query(themeQuery, [id_theme], async (themeErr, themeResults) => {
        if (themeErr) {
          console.error("Erreur lors de la récupération du thème:", themeErr);
          return reject(new Error("Erreur serveur"));
        }

        if (!themeResults || themeResults.length === 0) {
          return reject(new Error("Thème non trouvé"));
        }

        const themeName = themeResults.theme;
        console.log('themeName',themeName);
        try {
          // 2. Traitement des formateurs à supprimer
          for (const id_formateur of formateursToRemove) {
            await new Promise((resolve, reject) => {
              db.query(
                'SELECT themes_a_enseigner FROM formateur WHERE id_formateur = ?',
                [id_formateur],
                async (formateurErr, formateurResults) => {
                  if (formateurErr) {
                    console.error("Erreur lors de la récupération du formateur:", formateurErr);
                    return reject(formateurErr);
                  }

                  if (formateurResults && formateurResults.length > 0) {
                    const formateur = formateurResults;
                    let themes = {};

                    try {
                      themes = formateur.themes_a_enseigner 
                        ? JSON.parse(formateur.themes_a_enseigner)
                        : {};
                    } catch (e) {
                      console.error("Erreur de parsing JSON:", e);
                      return resolve();
                    }

                    if (themes[themeName]) {
                      delete themes[themeName];

                      // Mise à jour des domaines de compétences
                      const domaines = Object.keys(themes);

                      db.query(
                        'UPDATE formateur SET themes_a_enseigner = ?, domaine_de_competences = ? WHERE id_formateur = ?',
                        [JSON.stringify(themes), domaines.join(','), id_formateur],
                        (updateErr) => {
                          if (updateErr) {
                            console.error("Erreur lors de la mise à jour:", updateErr);
                            return reject(updateErr);
                          }
                          resolve();
                        }
                      );
                    } else {
                      resolve();
                    }
                  } else {
                    resolve();
                  }
                }
              );
            });
          }

          // 3. Traitement des formateurs à ajouter/modifier
          for (const { id_formateur, rang } of formateursToAdd) {
            await new Promise((resolve, reject) => {
              db.query(
                'SELECT themes_a_enseigner FROM formateur WHERE id_formateur = ?',
                [id_formateur],
                async (formateurErr, formateurResults) => {
                  if (formateurErr) {
                    console.error("Erreur lors de la récupération du formateur:", formateurErr);
                    return reject(formateurErr);
                  }

                  if (formateurResults && formateurResults.length > 0) {
                    const formateur = formateurResults;
                    let themes = {};

                    try {
                      themes = formateur.themes_a_enseigner 
                        ? JSON.parse(formateur.themes_a_enseigner)
                        : {};
                    } catch (e) {
                      console.error("Erreur de parsing JSON:", e);
                      return resolve();
                    }

                    themes[themeName] = rang;
                    console.log('domaine,themeName à inserer:',JSON.stringify(themes), domaines.join(','));
                    const domaines = Object.keys(themes);

                    db.query(
                      'UPDATE formateur SET themes_a_enseigner = ?, domaine_de_competences = ? WHERE id_formateur = ?',
                      [JSON.stringify(themes), domaines.join(','), id_formateur],
                      (updateErr) => {
                        if (updateErr) {
                          console.error("Erreur lors de la mise à jour:", updateErr);
                          return reject(updateErr);
                        }
                        resolve();
                      }
                    );
                  } else {
                    resolve();
                  }
                }
              );
            });
          }

          resolve({
            success: true,
            message: "Mise à jour des formateurs réussie",
          });
        } catch (error) {
          console.error("Erreur complète lors de la mise à jour:", error);
          reject(error);
        }
      });
    });
  }
}

module.exports = CatalogueRepository;