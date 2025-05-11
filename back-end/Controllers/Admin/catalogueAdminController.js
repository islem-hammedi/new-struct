
  const db = require('../../connect');








const getCatalogue = async (req, res) => {
  const query = `
 SELECT d.domaine, d.id_domaine as id_formation,t.id_theme, t.theme, t.code,
   fm.id_formateur, fm.nom_complet,
    fm.mail,
      fm.adr,
      fm.domaine_de_competences,
      fm.themes_a_enseigner,
      fm.tarif_journalier,
      fm.tel,
      fm.cv,
      fm.niveau_etude,
      fm.nb_experience
    FROM domaine d 
    LEFT JOIN theme t ON t.id_domaine = d.id_domaine 
    LEFT JOIN formateur fm ON JSON_CONTAINS( JSON_KEYS(fm.themes_a_enseigner),
   JSON_QUOTE(t.theme), '$' ) ORDER BY d.domaine;`
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching catalogue:", err);
      return res.status(500).json({ error: err.message });
    }
    const catalogues = [];
    const domainesMap = new Map();

    results.forEach(row => {
      if (!domainesMap.has(row.id_formation)) {
        domainesMap.set(row.id_formation, {
          id_formation: row.id_formation,
          domaine: row.domaine,
          sessions: []
        });
      }

      const catalogue = domainesMap.get(row.id_formation);
      if (row.id_theme) {
        let session = catalogue.sessions.find(s => s.id_theme === row.id_theme);
        
        if (!session) {
          session = {
            id_theme: row.id_theme,
            theme: row.theme,
            code: row.code,
            formateurs: [],
          };
          catalogue.sessions.push(session);
        }

        if (row.id_formateur) {
          try {
            const themesFormateur = row.themes_a_enseigner 
              ? JSON.parse(row.themes_a_enseigner) : {};

            if (themesFormateur[row.theme]) {
              const formateur = {
                id_formateur: row.id_formateur,
                nom_complet: row.nom_complet,
                mail: row.mail,
                adr: row.adr,
                domaine_de_competences: row.domaine_de_competences,
                themes_a_enseigner: themesFormateur,
                tarif_journalier: row.tarif_journalier,
                tel: row.tel,
                cv: row.cv,
                niveau_etude: row.niveau_etude,
                nb_experience: row.nb_experience,
                rang: themesFormateur[row.theme]
              };

              if (!session.formateurs.some(f => f.id_formateur === row.id_formateur)) {
                session.formateurs.push(formateur);
                session.formateurs.sort((a, b) => a.rang - b.rang);
              }              

            }
          } catch (e) {
            console.error("Error parsing themes_a_enseigner:", e);
          }
        }
      }
    });

    res.json(Array.from(domainesMap.values()));
  });
};














const getFormateursBySession = async (req, res) => {
  const { id_theme } = req.params;

  try {
    // 1. Récupération des informations de la session
    const sessionResults = await new Promise((resolve, reject) => {
      db.query(
        'SELECT  theme,code FROM theme WHERE id_theme = ?', 
        [id_theme], 
        (err, results) => {
          if (err) {
            console.error('Erreur SQL:', err);
            reject(err);
          } else {

            resolve(results);
          }
        }
      );
    });
    if (!Array.isArray(sessionResults) || sessionResults.length === 0) {
      console.log(`Aucune theme trouvée pour l'ID ${id_theme}`);
      return res.status(404).json({ 
        success: false,
        error: 'theme non trouvée',
        sessionId: id_theme
      });
    }

    const sessionTheme = sessionResults[0].theme;
    console.log(`Thème de la session ${id_session}: ${sessionTheme}`); // Log

    // 2. Récupération des formateurs
    const formateurs = await new Promise((resolve, reject) => {
      const query = `
        SELECT 
          fm.id_formateur,
          fm.nom_complet,
          fm.themes_a_enseigner
        FROM formateur fm
        WHERE JSON_CONTAINS(JSON_KEYS(fm.themes_a_enseigner), JSON_QUOTE(?))
      `;
      
      db.query(query, [sessionTheme], (err, results) => {
        if (err) {
          console.error('Erreur SQL formateurs:', err);
          reject(err);
        } else {

          resolve(results);
        }
      });
    },)
   

    // Formatage des résultats
    const result = formateurs.map(formateur => {
      let rang = 1;
      try {
        const themes = JSON.parse(formateur.themes_a_enseigner);
        rang = themes[sessionTheme];
      } catch (e) {
        console.error("Erreur parsing themes_a_enseigner:", e);
      }

      return {
        id_formateur: formateur.id_formateur,
        nom_complet: formateur.nom_complet,
        rang: rang
      };
    });

    res.json({
      success: true,
      id_theme: parseInt(id_theme),
      theme: sessionTheme,
      formateurs: result
    });

  } catch (error) {
    console.error("Erreur complète:", error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}; 


{/*}
const updateDomain = async (req, res) => {
  const { domaine, themes } = req.body;
  const { id_domaine } = req.params;

  db.beginTransaction(async (err) => {
    if (err) {
      return res.status(500).json({ error: "Erreur de transaction" });
    }

    try {
      // 1. Mettre à jour le domaine dans la table formation
      const queryUpdateFormation = 'UPDATE domaine SET domaine = ? WHERE id_domaine = ?';
      await new Promise((resolve, reject) => {
        db.query(queryUpdateFormation, [domaine, id_domaine], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      // 2. Récupérer les sessions existantes
      const existingSessions = await new Promise((resolve, reject) => {
        db.query('SELECT id_theme, theme, code FROM theme WHERE id_domaine = ?', [id_domaine], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

      // 3. Identifier les thèmes qui vont être supprimés
      const currentThemeCodes = themes.map(t => t.code);
      const themesToDelete = existingSessions.filter(s => !currentThemeCodes.includes(t.code));
      const deletedThemeNames = themesToDelete.map(t => t.theme);

      // 4. Traiter chaque session/thème
      const sessionPromises = themes.map(async (theme) => {
        const { code, formateurs } = theme;

        // Trouver ou créer la session
        let existingSession = existingSessions.find(t => t.code === code);
        let id_theme;

        if (existingSession) {
          // Mettre à jour la session existante
          const queryUpdateSession = 'UPDATE theme SET theme = ? WHERE id_theme = ?';
          await new Promise((resolve, reject) => {
            db.query(queryUpdateSession, [theme, existingSession.id_theme], (err, result) => {
              if (err) return reject(err);
              resolve(result);
            });
          });
          id_theme = existingSession.id_theme;
        } else {
          // Créer une nouvelle session
          const queryInsertSession = 'INSERT INTO theme (theme, code, id_domaine) VALUES (?, ?, ?)';
          const insertResult = await new Promise((resolve, reject) => {
            db.query(queryInsertSession, [theme, code, id_domaine], (err, result) => {
              if (err) return reject(err);
              resolve(result);
            });
          });
          id_theme = insertResult.insertId;
        }

        // 5. Mettre à jour les thèmes enseignés par chaque formateur
        const formateurPromises = formateurs.map(async (formateur) => {
          // Récupérer les données actuelles du formateur
          const formateurData = await new Promise((resolve, reject) => {
            db.query(
              'SELECT themes_a_enseigner FROM formateur WHERE id_formateur = ?',
              [formateur.id_formateur],
              (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
              }
            );
          });

          // Parser les thèmes existants ou initialiser un objet vide
          let existingThemes = {};
          if (formateurData?.themes_a_enseigner) {
            try {
              existingThemes = JSON.parse(formateurData.themes_a_enseigner);
            } catch (e) {
              console.error("Erreur parsing JSON:", e);
            }
          }
          // Mettre à jour seulement le thème actuel avec son rang
          const updatedThemes = {
            ...existingThemes,
            [theme]: formateur.rang,
          };

          // Mettre à jour le formateur
          await new Promise((resolve, reject) => {
            db.query(
              `UPDATE formateur 
               SET domaine_de_competences = ?,
                   themes_a_enseigner = ?
               WHERE id_formateur = ?`,
              [
                formation,
                JSON.stringify(updatedThemes),
                formateur.id_formateur,
              ],
              (err, result) => {
                if (err) return reject(err);
                resolve(result);
              }
            );
          });
        });

        // 6. Nettoyer les thèmes supprimés pour les formateurs non inclus dans cette session
        const currentFormateurIds = formateurs.map(f => f.id_formateur);
        const allFormateurs = await new Promise((resolve, reject) => {
          db.query(
            'SELECT id_formateur, themes_a_enseigner FROM formateur',
            (err, results) => {
              if (err) return reject(err);
              resolve(results);
            }
          );
        });

        const cleanupPromises = allFormateurs.map(async (formateur) => {
          if (!formateur.themes_a_enseigner) return;

          try {
            let themes = JSON.parse(formateur.themes_a_enseigner);
            let updatedThemes = {};

            // Garder seulement les thèmes qui n'ont pas été supprimés
            for (const [themeName, rang] of Object.entries(themes)) {
              if (themeName !== theme || currentFormateurIds.includes(formateur.id_formateur)) {
                updatedThemes[themeName] = rang;
              }
            }

            // Mettre à jour le formateur si les thèmes ont changé
            if (Object.keys(themes).length !== Object.keys(updatedThemes).length) {
              await new Promise((resolve, reject) => {
                db.query(
                  'UPDATE formateur SET themes_a_enseigner = ? WHERE id_formateur = ?',
                  [JSON.stringify(updatedThemes), formateur.id_formateur],
                  (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                  }
                );
              });
            }
          } catch (e) {
            console.error("Erreur lors du traitement des thèmes du formateur:", e);
          }
        });

        await Promise.all([...formateurPromises, ...cleanupPromises]);
      });

      await Promise.all(sessionPromises);

      // 7. Supprimer les sessions qui n'existent plus
      const deletePromises = themesToDelete.map(theme => {
        return new Promise((resolve, reject) => {
          db.query('DELETE FROM theme WHERE id_theme = ?', [theme.id_theme], (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
      });

      await Promise.all(deletePromises);

      // Valider la transaction
      db.commit((err) => {
        if (err) {
          return db.rollback(() => {
            throw err;
          });
        }

        return res.status(200).json({
          message: 'Domaine, thèmes et formateurs mis à jour avec succès',
          id_domaine: id_domaine,
          themes,
        });
      });
    } catch (error) {
      db.rollback(() => {
        console.error("Erreur lors de la mise à jour du domaine:", error);
        return res.status(500).json({ 
          error: error.message,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      });
    }
  });
};
*/}


const updateTheme = async (req, res) => {
  const { id_theme } = req.params;
  const { theme, formateurs } = req.body;

  // Démarrer une transaction
  db.beginTransaction(async (err) => {
    if (err) {
      return res.status(500).json({ error: "Erreur de transaction" });
    }

    try {
      // 1. Mettre à jour le thème
      const updateThemeQuery = 'UPDATE theme SET theme = ? WHERE id_theme = ?';
      await new Promise((resolve, reject) => {
        db.query(updateThemeQuery, [theme, id_theme], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      // 2. Récupérer les formateurs actuellement associés au thème
      const currentFormateurs = await new Promise((resolve, reject) => {
        db.query(
          'SELECT id_formateur FROM formateur_theme WHERE id_theme = ?',
          [id_theme],
          (err, results) => {
            if (err) return reject(err);
            resolve(results.map(f => f.id_formateur));
          }
        );
      });

      // 3. Identifier les formateurs à ajouter et à supprimer
      const newFormateurIds = formateurs.map(f => f.id_formateur);
      const formateursToAdd = formateurs.filter(
        f => !currentFormateurs.includes(f.id_formateur)
      );
      const formateursToRemove = currentFormateurs.filter(
        id => !newFormateurIds.includes(id)
      );

      // 4. Supprimer les associations qui ne sont plus nécessaires
      if (formateursToRemove.length > 0) {
        await new Promise((resolve, reject) => {
          db.query(
            'DELETE FROM formateur_theme WHERE id_theme = ? AND id_formateur IN (?)',
            [id_theme, formateursToRemove],
            (err, result) => {
              if (err) return reject(err);
              resolve(result);
            }
          );
        });

        // Mettre à jour les thèmes_a_enseigner pour les formateurs supprimés
        const cleanupPromises = formateursToRemove.map(async (id_formateur) => {
          // Récupérer les thèmes actuels du formateur
          const formateurData = await new Promise((resolve, reject) => {
            db.query(
              'SELECT themes_a_enseigner FROM formateur WHERE id_formateur = ?',
              [id_formateur],
              (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
              }
            );
          });

          if (formateurData?.themes_a_enseigner) {
            try {
              let themes = JSON.parse(formateurData.themes_a_enseigner);
              delete themes[theme]; // Supprimer le thème actuel

              // Mettre à jour le formateur
              await new Promise((resolve, reject) => {
                db.query(
                  'UPDATE formateur SET themes_a_enseigner = ? WHERE id_formateur = ?',
                  [JSON.stringify(themes), id_formateur],
                  (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                  }
                );
              });
            } catch (e) {
              console.error("Erreur parsing JSON:", e);
            }
          }
        });

        await Promise.all(cleanupPromises);
      }

      // 5. Ajouter les nouvelles associations
      if (formateursToAdd.length > 0) {
        const insertPromises = formateursToAdd.map(async (formateur) => {
          // Ajouter à la table formateur_theme
          await new Promise((resolve, reject) => {
            db.query(
              'INSERT INTO formateur_theme (id_formateur, id_theme, rang) VALUES (?, ?, ?)',
              [formateur.id_formateur, id_theme, formateur.rang],
              (err, result) => {
                if (err) return reject(err);
                resolve(result);
              }
            );
          });

          // Mettre à jour les thèmes_a_enseigner dans la table formateur
          const formateurData = await new Promise((resolve, reject) => {
            db.query(
              'SELECT themes_a_enseigner FROM formateur WHERE id_formateur = ?',
              [formateur.id_formateur],
              (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
              }
            );
          });

          let themes = {};
          if (formateurData?.themes_a_enseigner) {
            try {
              themes = JSON.parse(formateurData.themes_a_enseigner);
            } catch (e) {
              console.error("Erreur parsing JSON:", e);
            }
          }

          // Ajouter/mettre à jour le thème avec son rang
          themes[theme] = formateur.rang;

          await new Promise((resolve, reject) => {
            db.query(
              'UPDATE formateur SET themes_a_enseigner = ? WHERE id_formateur = ?',
              [JSON.stringify(themes), formateur.id_formateur],
              (err, result) => {
                if (err) return reject(err);
                resolve(result);
              }
            );
          });
        });

        await Promise.all(insertPromises);
      }

      // 6. Mettre à jour les rangs des formateurs existants
      const updateRankPromises = formateurs
        .filter(f => currentFormateurs.includes(f.id_formateur))
        .map(async (formateur) => {
          await new Promise((resolve, reject) => {
            db.query(
              'UPDATE formateur_theme SET rang = ? WHERE id_theme = ? AND id_formateur = ?',
              [formateur.rang, id_theme, formateur.id_formateur],
              (err, result) => {
                if (err) return reject(err);
                resolve(result);
              }
            );
          });

          // Mettre à jour aussi dans themes_a_enseigner
          await new Promise((resolve, reject) => {
            db.query(
              'UPDATE formateur SET themes_a_enseigner = JSON_SET(themes_a_enseigner, ?) WHERE id_formateur = ?',
              [`$.${theme}`, formateur.rang, formateur.id_formateur],
              (err, result) => {
                if (err) return reject(err);
                resolve(result);
              }
            );
          });
        });

      await Promise.all(updateRankPromises);

      // Valider la transaction
      db.commit((err) => {
        if (err) {
          return db.rollback(() => {
            throw err;
          });
        }

        return res.status(200).json({
          message: 'Thème et formateurs mis à jour avec succès',
          id_theme,
          theme,
          formateurs
        });
      });
    } catch (error) {
      db.rollback(() => {
        console.error("Erreur lors de la mise à jour du thème:", error);
        return res.status(500).json({ 
          error: error.message,
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      });
    }
  });
};









const addThemeToDomain = async (req, res) => {
  const { domaineName, abbreviation, themes } = req.body;
  
  // Vérifier que l'abréviation est bien définie
  const abbreviationToUse = abbreviation || '';
  
  // Démarrer une transaction
  db.beginTransaction(async (err) => {
    if (err) {
      return res.status(500).json({ error: "Erreur de transaction" });
    }

    try {
      // Vérifier d'abord si le domaine existe déjà
      const checkDomain = await new Promise((resolve, reject) => {
        db.query('SELECT domaine FROM domaine WHERE domaine = ? LIMIT 1', [domaineName], (err, results) => {
          if (err) return reject(err);
          resolve(results[0]);
        });
      });

      if (!checkDomain) {
        return res.status(404).json({ error: "Domaine non trouvé" });
      }

      // Récupérer le dernier code de thème pour ce domaine (tous codes confondus)
      const lastCodeQuery = `
        SELECT t.code 
        FROM theme t
        JOIN domaine d ON t.id_domaine = d.id_domaine
        WHERE d.domaine = ?
        ORDER BY 
          LENGTH(t.code) DESC,  -- Priorité aux codes les plus longs
          t.code DESC          -- Puis tri alphabétique inverse
        LIMIT 1
      `;
      
      console.log("Query parameters:", [domaineName]);
      
      const lastCodeResult = await new Promise((resolve, reject) => {
        db.query(lastCodeQuery, [domaineName], (err, results) => {
          if (err) return reject(err);
          console.log("Last code query results:", results);
          resolve(results[0]);
        });
      });

      let lastNumber = 0;
      let existingPrefix = abbreviationToUse;

      if (lastCodeResult && lastCodeResult.code) {
        console.log("Found last code:", lastCodeResult.code);
        // Extraire le préfixe et le numéro avec une regex améliorée
        const match = lastCodeResult.code.match(/^([A-Za-z]*)(\d+)$/);
        console.log("Regex match:", match);
        
        if (match) {
          existingPrefix = match[1] || abbreviationToUse;
          lastNumber = parseInt(match[2], 10);
          console.log("Last number extracted:", lastNumber);
          console.log("Using prefix:", existingPrefix);
        }
      } else {
        console.log("No previous code found, starting at 1");
      }

      // Insérer les thèmes
      const sessionPromises = themes.map(async (theme, index) => {
        const { name, formateurs } = theme;
        
        // Incrémenter le numéro pour le nouveau code
        const nextNumber = lastNumber + 1;
        lastNumber = nextNumber; // Mettre à jour pour le prochain thème
        console.log(`Generating code for theme ${index + 1}: nextNumber = ${nextNumber}`);
        
        // Formater le numéro avec des zéros en préfixe (3 chiffres minimum)
        const formattedNumber = String(nextNumber).padStart(3, '0');
        const code = `${existingPrefix}${formattedNumber}`;
        console.log(`Generated code: ${code}`);
        
        // Créer une entrée dans la table formation
        const formationResult = await new Promise((resolve, reject) => {
          db.query('INSERT INTO domaine (domaine) VALUES (?)', [domaineName], (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
        const new_id_domaine = formationResult.insertId;

        // Insérer le thème dans la table session
        const querySession = 'INSERT INTO theme (theme, code, id_domaine) VALUES (?, ?, ?)';
        console.log("Inserting theme with params:", [name, code, new_id_domaine]);
        
        const sessionResult = await new Promise((resolve, reject) => {
          db.query(querySession, [name, code, new_id_domaine], (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
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
                  ...themeEnseignement
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
            throw err;
          });
        }

        return res.status(201).json({
          message: 'Thèmes créés avec succès',
          results: results.map(r => ({
            id_domaine: r.id_domaine,
            id_theme: r.id_theme,
            theme: r.theme,
            code: r.code
          })),
          domaine: domaineName
        });
      });
    } catch (error) {
      // Annuler la transaction en cas d'erreur
      db.rollback(() => {
        console.error("Erreur lors de l'ajout des thèmes:", error);
        return res.status(500).json({ 
          error: error.message,
          details: error.stack 
        });
      });
    }
  });
};

const deleteDomain = (req, res) => {
  const { id_formation } = req.params;

  if (!id_formation || isNaN(id_formation)) {
    return res.status(400).json({ message: "ID de domaine invalide." });
  }
  const deleteFormationQuery = `DELETE FROM domaine WHERE id_domaine = ?;`

    // Ensuite, supprime la formation
    db.query(deleteFormationQuery, [id_formation], (err, result) => {
      if (err) {
        console.error("Erreur lors de la suppression de domaine(fc) :", err);
        return res.status(500).json({ message: "Erreur lors de la suppression de domaine(fc)", error: err });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Aucune domaine trouvée avec cet ID" });
      }
      res.json({ message: "Domaine supprimé avec succès" });
  });
};






// Assurez-vous que votre route est bien configurée comme ceci :
const deleteTheme= (req, res) => {
  const { id_domaine, id_theme } = req.params;

  console.log(`Requête reçue - Domaine: ${id_domaine}, Thème: ${id_theme}`); // Debug

  // 1. Vérification de l'existence
  db.query(
    `SELECT 1 FROM theme WHERE id_domaine = ? AND id_theme = ?`, 
    [id_domaine, id_theme],
    (err, results) => {
      if (err) {
        console.error('Erreur DB:', err);
        return res.status(500).json({ success: false, message: 'Erreur serveur' });
      }

      if (results.length === 0) {
        console.log('Thème non trouvé en base');
        return res.status(404).json({ 
          success: false,
          message: `Association non trouvée: domaine ${id_domaine} / thème ${id_theme}`
        });
      }

      // 2. Suppression
      db.query(
        `DELETE FROM theme WHERE id_domaine = ? AND id_theme = ?`,
        [id_domaine, id_theme],
        (err, result) => {
          if (err) {
            console.error('Erreur suppression:', err);
            return res.status(500).json({ success: false, message: 'Échec suppression' });
          }

          console.log(`Suppression réussie - Lignes affectées: ${result.affectedRows}`);
          res.json({ 
            success: true,
            message: `Thème ${id_theme} supprimé du domaine ${id_domaine}`
          });
        }
      );
    }
  );
};

  module.exports = {
    getCatalogue,updateTheme,getFormateursBySession,addThemeToDomain,deleteDomain
  ,deleteTheme};








































{/*}

const catalogueService = require('../../services/admin/catalogueService');

class CatalogueController {
  async getCatalogue(req, res) {
    try {
      const catalogue = await catalogueService.getCatalogue();
      res.json(catalogue);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getFormateursBySession(req, res) {
    try {
      const result = await catalogueService.getFormateursBySession(req.params.id_session);
      res.json(result);
    } catch (error) {
      if (error.message === 'Session non trouvée') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  async updateDomain(req, res) {
    try {
      const result = await catalogueService.updateDomain(req.params.id_domaine, req.body.nom_domaine);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async addThemeToDomain(req, res) {
    try {
      const result = await catalogueService.addThemeToDomain(req.params.id_domaine, req.body.themes);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new CatalogueController();*/}