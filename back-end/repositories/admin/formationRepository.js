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
                if (!domaine || !sessions || !Array.isArray(sessions)) {
                    throw new Error("Données de formation invalides");
                }
    
                const domainQuery = 'SELECT id_domaine FROM domaine WHERE domaine = ? LIMIT 1';
                const domainResult = await this.query(domainQuery, [domaine]);
                
                if (!domainResult || domainResult.length === 0) {
                    throw new Error(`Domaine "${domaine}" introuvable`);
                }
                
                const id_domaine = domainResult[0].id_domaine;
    
                // 3. Démarrer la transaction
                await this.query('START TRANSACTION');
    
                // 4. Insérer la formation
                const formationResult = await this.query(
                    'INSERT INTO formation (id_domaine) VALUES (?)', 
                    [id_domaine]
                );
                const id_formation = formationResult.insertId;
    
                // 5. Traiter chaque session
                const sessionResults = [];
                for (let i = 0; i < sessions.length; i++) {
                    const session = sessions[i];
                    
                    // Validation des données de session
                    if (!session.theme || !session.id_formateur) {
                        throw new Error(`Session ${i + 1} incomplète`);
                    }
    
                    // Récupérer l'ID du thème
                    const themeResult = await this.query(
                        'SELECT id_theme FROM theme WHERE theme = ? LIMIT 1',
                        [session.theme]
                    );
                    
                    if (!themeResult || themeResult.length === 0) {
                        throw new Error(`Thème "${session.theme}" introuvable`);
                    }
                    
                    const id_theme = themeResult[0].id_theme;
    
                    // Gestion des fichiers
                    const ficheProgrammeFile = files['fiche_programme']?.[0];
                    const coursSessionFile = files['cours_session']?.[0];
                    // Insérer la session
                    const sessionResult = await this.query(
                        `INSERT INTO session (
                            id_theme, etat, mode, lieu, id_formation,
                            id_formateur, fiche_prg, cours_session, type_session,
                            nb_participant, genre, createdAt
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            id_theme,
                            session.etat || 'planifiée',
                            session.mode ,
                            session.lieu || null,
                            id_formation,
                            session.id_formateur,
                            ficheProgrammeFile?.filename || null,
                            coursSessionFile?.filename || null,
                             session.type_session ,
                            session.nb_participants || 0,
                            session.genre,
                           
                            new Date()
                        ]
                    );
    
                    sessionResults.push({
                        id_session: sessionResult.insertId,
                        ...session
                    });
                }
    
                await this.query('COMMIT');
                resolve({
                    success: true,
                    id_formation,
                    sessions: sessionResults
                });
            } catch (error) {
                await this.query('ROLLBACK');
                console.error('Erreur addFormationWithSessions:', error);
                reject({
                    success: false,
                    message: error.message
                });
            }
        });
    }
    
    // Méthode utilitaire pour exécuter les requêtes (inchangée)
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


    async deleteSession(sessionId, formationId) {
        return new Promise((resolve, reject) => {
            // 1. Vérifier d'abord si la session existe
            const checkQuery = 'SELECT id_session, fiche_prg FROM session WHERE id_session = ? AND id_formation = ?';
            db.query(checkQuery, [sessionId, formationId], (err, result) => {
                if (err) return reject(err);
                
                if (result.length === 0) {
                    return reject(new Error("Session non trouvée"));
                }
                
                const fileName = result[0]?.fiche_prg;
    
                // 2. Supprimer la session - CORRECTION: Ajouter formationId dans le tableau des paramètres
                const deleteQuery =' DELETE FROM session WHERE id_session = ? AND id_formation = ? ';
                db.query(deleteQuery, [sessionId, formationId], (err, result) => { // Pass both parameters here
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
    async performUpdate(sessionId, formationId, sessionData, file) {
        console.log("Début de performUpdate");

        try {
            // 1. Vérifier que la session existe et appartient à la formation
            const checkQuery = 'SELECT id_session FROM session WHERE id_session = ? AND id_formation = ?';
            const checkResult = await new Promise((resolve, reject) => {
                db.query(checkQuery, [sessionId, formationId], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });
    
            if (!checkResult || checkResult.length === 0) {
                throw new Error("Session non trouvée ou n'appartient pas à cette formation");
            }
    
            // 2. Obtenir l'ID du thème si nécessaire
                const themeQuery = 'SELECT id_theme FROM theme WHERE theme = ?';
                const themeResult = await new Promise((resolve, reject) => {
                    db.query(themeQuery, [sessionData.theme], (err, results) => {
                        if (err) return reject(err);
                        resolve(results);
                    });
                });
    
                if (!themeResult || themeResult.length === 0) {
                    throw new Error(`Thème "${sessionData.theme}" introuvable`);
                }
                const id_theme = themeResult[0].id_theme;
            
    
            const updateData = {
                etat: sessionData.etat ,
                type_session: sessionData.type_session,
                lieu: sessionData.lieu ,
                id_formateur: sessionData.id_formateur,
                id_theme: id_theme, // Ajout de l'ID du thème
                mode: sessionData.mode ,
            nb_participant: sessionData.nb_participant || 0,
            genre: sessionData.genre,
                createdAt: new Date()
            };
    
            if (file) {
                if (file.fiche_programme) {
                    updateData.fiche_prg = file.fiche_programme.filename;
                }
                if (file.cours_session) {
                    updateData.cours_session = file.cours_session.filename;
                }
            }
    
            const updateQuery = `
                UPDATE session SET ?
                WHERE id_session = ? AND id_formation = ?
            `;
            
            const updateResult = await new Promise((resolve, reject) => {
                db.query(updateQuery, [updateData, sessionId, formationId], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });
    
            if (updateResult.affectedRows === 0) {
                throw new Error("Aucune modification effectuée");
            }
    
            return {
                success: true,
                affectedRows: updateResult.affectedRows
            };
        } catch (error) {
            console.error("Erreur dans performUpdate:", error);
            throw error;
        }
    }
} 
module.exports = new FormationAdminRepository();