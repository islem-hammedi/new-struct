const db = require('../../connect');

class FormationAdminRepository {
    async getAllFormationsWithSessions() {
        const query = `
        SELECT 
         f.id_formation,
         s.id_session,
         t.theme,
         t.code,
         d.domaine,
         s.nb_participant, 
         s.lieu, 
         s.etat,
         s.genre,
         s.mode, 
         s.type_session, 
         s.id_formateur,
         s.fiche_prg,
         s.cours_session,
         s.date_debut,
         s.date_fin,
        s.createdAt,
         fm.nom_complet AS formateur 
         FROM formation f 
         LEFT JOIN session s ON f.id_formation = s.id_formation 
         LEFT JOIN formateur fm ON s.id_formateur = fm.id_formateur
         LEFT JOIN theme t on t.id_theme=s.id_theme
         LEFT JOIN domaine d on d.id_domaine=f.id_domaine
         ORDER BY  f.id_domaine, f.id_formation`;
        
        return new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    async addFormationWithSessions(domaine, sessions, files) {
        return new Promise(async (resolve, reject) => {
            try {
                // 1. Obtenir l'ID du domaine
                const domainQuery = 'SELECT id_domaine FROM domaine WHERE domaine = ? LIMIT 1';
                const domainResult = await this.query(domainQuery, [domaine]);
                
                if (!domainResult || domainResult.length === 0) {
                    throw new Error(`Domaine "${domaine}" introuvable`);
                }
                
                const id_domaine = domainResult[0].id_domaine;

                // 2. Démarrer la transaction
                await this.query('START TRANSACTION');

                // 3. Insérer la formation
                const formationQuery = 'INSERT INTO formation (id_domaine) VALUES (?)';
                const formationResult = await this.query(formationQuery, [id_domaine]);
                const id_formation = formationResult.insertId;

                // 4. Insérer les sessions
                const sessionResults = [];
                for (let i = 0; i < sessions.length; i++) {
                    const session = sessions[i];
                    const file = files[i];
                    
                    // Obtenir l'ID du thème
                    const themeQuery = 'SELECT id_theme FROM theme WHERE theme = ? LIMIT 1';
                    const themeResult = await this.query(themeQuery, [session.theme]);
                    
                    if (!themeResult || themeResult.length === 0) {
                        throw new Error(`Thème "${session.theme}" introuvable`);
                    }
                    
                    const id_theme = themeResult[0].id_theme;

                    const sessionQuery = `
                        INSERT INTO session (
                            id_theme, etat, mode, lieu, id_formation, 
                            id_formateur, fiche_prg, type_session, nb_participant, genre, createdAt 
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;
                    const result = await this.query(sessionQuery, [
                        id_theme,
                        'A Réalisé',
                        session.mode ,
                        session.lieu || null,
                        id_formation,
                        session.id_formateur,
                        file?.filename || null,
                        session.type_session ,
                        session.nb_participants || 0,
                        session.genre,
                        new Date() 
                    ]);
                    sessionResults.push(result);
                }

                await this.query('COMMIT');
                resolve({
                    id_formation,
                    sessions: sessionResults
                });
            } catch (error) {
                await this.query('ROLLBACK');
                reject(error);
            }
        });
    }

    // Méthode utilitaire pour exécuter les requêtes
    query(sql, params) {
        return new Promise((resolve, reject) => {
            db.query(sql, params, (err, result) => {
                if (err) {
                    console.error('Erreur SQL:', sql, params, err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    };


    async deleteSession(sessionId) {
        return new Promise((resolve, reject) => {
            // 1. Vérifier d'abord si la session existe
            const checkQuery = 'SELECT id_session, fiche_prg FROM session WHERE id_session = ?;'
            db.query(checkQuery, [sessionId], (err, result) => {
                if (err) return reject(err);
                
                if (result.length === 0) {
                    return reject(new Error("Session non trouvée"));
                }
                
                const fileName = result[0]?.fiche_prg;
                
                // 2. Supprimer la session
                const deleteQuery ='DELETE FROM session WHERE id_session = ?;' 
                db.query(deleteQuery, [sessionId], (err, result) => {
                    if (err) return reject(err);
                    
                    resolve({
                        success: true,
                        deletedCount: result.affectedRows,
                        fileName: fileName
                    });
                });
            });
        });
    }
  }  /*
   async addSessionToFormation(id_formation, sessionData, file) {
        try {
            // Validation des champs obligatoires
            if (!sessionData.theme || !sessionData.id_formateur) {
                throw new Error("Tous les champs obligatoires doivent être remplis");
            }

            const fileName = file ? file.filename : null;
            
            const result = await new Promise((resolve, reject) => {
                db.query(
                    `INSERT INTO session 
                    (id_theme, nb_participant, etat, type_session, lieu, id_formation, id_formateur, fiche_prg) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        sessionData.id_theme,
                        sessionData.nb_participants || null,
                        sessionData.etat || 'A Réaliser',
                        sessionData.type_session || null,
                        sessionData.lieu || null,
                        id_formation,
                        sessionData.id_formateur,
                        fileName
                    ],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });

            return result;
        } catch (error) {
            // Nettoyage des fichiers en cas d'erreur
            if (file && file.path) {
                try {
                    const filePath = path.join(__dirname, '../../uploads', file.filename);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                } catch (cleanupError) {
                    console.error('Erreur lors du nettoyage:', cleanupError);
                }
            }
            throw error;
        }}*/

    /* getSessionsByFormation(id_formation) {
        return new Promise((resolve, reject) => {
            db.query(
                'SELECT * FROM session WHERE id_formation = ?',
                [id_formation],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
        });}
     
*/
module.exports = new FormationAdminRepository();