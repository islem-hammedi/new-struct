const db = require('../../connect');
const Participant = require('../../models/admin/participant');
class FeuillePresenceRepository {
     /*constructor() {
        this.initTable();
      }
      
     async initTable() {
        try {
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS participation (
                id_participation INT PRIMARY KEY auto increment NOT NULL,
                    id_session INT NOT NULL,
                    id_participant INT NOT NULL,
                    credit_impot VARCHAR(255) NULL,
                    emargement TEXT NULL,
                    droit_triage VARCHAR(255) NULL,
                   
                    FOREIGN KEY (id_session) REFERENCES session(id_session),
                    FOREIGN KEY (id_participant) REFERENCES participant(id_participant)
                )`;
            
            await db.query(createTableQuery);
            console.log('Table participation initialisée avec succès');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de la table participation:', error);
            throw error;
        }
    }
*/
    // Récupérer les détails d'une session avec ses participants
    async getSessionDetails(idSession) {
        try {
            const query = `
                SELECT 
                    s.*, 
                    f.nom_complet AS formateur_nom, 
                    th.theme AS theme_nom,
                    s.lieu,
                    s.date_debut,
                    s.date_fin,
                    s.duree
                FROM session s
                JOIN formateur f ON s.id_formateur = f.id_formateur
                JOIN theme th ON s.id_theme = th.id_theme
                WHERE s.id_session = ?
            `;
            
            const rows = await new Promise((resolve, reject) => {
                db.query(query, [idSession], (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                });
            });

            return rows.length ? rows.map(row => new Participation(row)) : [];
            
        } catch (error) {
            console.error('Repository Error - getSessionDetails:', {
                message: error.message,
                stack: error.stack,
                sql: error.sql
            });
            throw new Error('Erreur lors de la récupération des détails de la session');
        }
    }
    
    async getAllSessionsWithDetails() {
        try {
            const query = `
                SELECT 
                    s.*, 
                    f.nom_complet AS formateur_nom, 
                    th.theme AS theme_nom,
                    s.lieu,
                    s.date_debut,
                    s.date_fin,
                    s.duree
                FROM session s
                JOIN formateur f ON s.id_formateur = f.id_formateur
                JOIN theme th ON s.id_theme = th.id_theme
                ORDER BY s.date_debut DESC
            `;
            
            const rows = await new Promise((resolve, reject) => {
                db.query(query, (error, results) => {
                    if (error) return reject(error);
                    resolve(results);
                });
            });

            return rows.length ? rows.map(row => new Participation(row)) : [];
            
        } catch (error) {
            console.error('Repository Error - getAllSessions:', {
                message: error.message,
                stack: error.stack,
                sql: error.sql
            });
            throw new Error('Erreur lors de la récupération des sessions');
        }
    }
    

    findByCIN(CIN) {
        return new Promise((resolve, reject) => {
            db.query('SELECT * FROM participant WHERE CIN = ?', [CIN], (err, rows) => {
                if (err) return reject(new Error(`Repository error: ${err.message}`));
                resolve(rows[0] ? new Participant(rows[0]) : null);
            });
        });
    }

    createParticipant(participantData) {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO participant SET ?', [participantData], (err, result) => {
                if (err) return reject(new Error(`Repository error: ${err.message}`));
                
                // Récupérer le participant créé
                this.findByCIN(participantData.CIN)
                    .then(resolve)
                    .catch(reject);
            });
        });
    }

    // Feuille de présence
    createFeuillePresence(feuilleData) {
        return new Promise((resolve, reject) => {
            db.query('INSERT INTO feuille_presence SET ?', [feuilleData], (err, result) => {
                if (err) return reject(new Error(`Repository error: ${err.message}`));
                resolve(result.insertId);
            });
        });
    }

    addParticipantToFeuille(participationData) {
        return new Promise((resolve, reject) => {
            db.query(
                `INSERT INTO feuille_presence_participants 
                (id_presence, id_participant, emargements, id_session) 
                VALUES (?, ?, ?, ?)`,
                [
                    participationData.id_presence,
                    participationData.id_participant,
                    JSON.stringify(participationData.emargements || {}),
                    participationData.id_session
                ],
                (err) => {
                    if (err) return reject(new Error(`Repository error: ${err.message}`));
                    resolve();
                }
            );
        });
    }
    
    // Sauvegarder plusieurs participations en une transaction
    /*async savePresences(id_session, participantsData) {
        const connection = await db.getConnection();
        const results = [];
        
        try {
            await connection.beginTransaction();
    
            // 1. Vérification session
            const session = await connection.query(
                'SELECT id_session FROM sessions WHERE id_session = ?', 
                [id_session]
            );
            if (!session.length) throw new Error('Session introuvable');
    
            // 2. Traitement participants
            for (const p of participantsData) {
                try {
                    if (!p.CIN || !p.nomPrenom) {
                        throw new Error('CIN et nom requis');
                    }
    
                    // 3. Gestion participant (existante ou nouveau)
                    let id_participant = p.id_participant || null;
                    
                    if (!id_participant) {
                        // Recherche par CIN
                        const existing = await connection.query(
                            'SELECT id_participant FROM participants WHERE CIN = ?',
                            [p.CIN]
                        );
    
                        if (existing.length) {
                            id_participant = existing[0].id_participant;
                        } else {
                            // Création nouveau
                            const insert = await connection.query(
                                `INSERT INTO participants 
                                (CIN, nom_complet, mail, telephone, id_entreprise) 
                                VALUES (?, ?, ?, ?, ?)`,
                                [p.CIN, p.nomPrenom, p.mail || null, p.telephone || null, null]
                            );
                            id_participant = insert.insertId;
                        }
                    }
    
                    // 4. Enregistrement participation
                    await connection.query(
                        `INSERT INTO participations 
                        (id_session, id_participant, emargement) 
                        VALUES (?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                            emargement = VALUES(emargement),
                            updated_at = NOW()`,
                        [id_session, id_participant, JSON.stringify(p.emargement || {})]
                    );
    
                    results.push({
                        CIN: p.CIN,
                        id_participant,
                        status: 'success'
                    });
    
                } catch (error) {
                    results.push({
                        CIN: p.CIN,
                        error: error.message,
                        status: 'failed'
                    });
                }
            }
    
            await connection.commit();
    
            return {
                success: true,
                data: {
                    results,
                    message: `Participants traités: ${results.filter(r => r.status === 'success').length} succès`
                }
            };
    
        } catch (error) {
            await connection.rollback();
            return {
                success: false,
                error: error.message,
                data: { results }
            };
        } finally {
            connection.release();
        }
    }*/
}

module.exports = new FeuillePresenceRepository();