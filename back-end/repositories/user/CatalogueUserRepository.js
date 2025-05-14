const db = require('../../connect');
const Domaine = require('../../models/admin/domaine');
const Theme = require('../../models/admin/Theme');
const nodemailer = require('nodemailer');

class CatalogueUserRepository {
    constructor() {
        this.initTables().catch(err => {
            console.error('Erreur lors de l\'initialisation des tables:', err);
        });

        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER || 'khadijabenabdelkader1206@gmail.com',
                pass: process.env.EMAIL_PASS || 'qqij aava gtxv hpdz'
            }
        });
    }

    async initTables() {
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS domaine (
                    id_domaine INT AUTO_INCREMENT PRIMARY KEY,
                    nom_domaine VARCHAR(255) NOT NULL UNIQUE
                )`);
            console.log('✅ Table domaine initialisée');

            await db.query(`
                CREATE TABLE IF NOT EXISTS theme (
                    id_theme INT AUTO_INCREMENT PRIMARY KEY,
                    nom_theme VARCHAR(255) NOT NULL,
                    code VARCHAR(50),
                    id_domaine INT,
                    FOREIGN KEY (id_domaine) REFERENCES domaine(id_domaine)
                )`);
            console.log('✅ Table theme initialisée');

            await db.query(`
                CREATE TABLE IF NOT EXISTS formations (
    id_formation INT AUTO_INCREMENT PRIMARY KEY,
    id_domaine INT NOT NULL,
    FOREIGN KEY (id_domaine) REFERENCES domaine(id_domaine)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`);
            console.log('✅ Table formations initialisée');

            await db.query(`
                CREATE TABLE IF NOT EXISTS session_formation (
    id_session INT AUTO_INCREMENT PRIMARY KEY,
    date_debut DATETIME NOT NULL,
    date_fin DATETIME NOT NULL,
    lieu VARCHAR(255) NOT NULL,
    id_formation INT NOT NULL,
    id_formateur INT NOT NULL,
    id_theme INT NOT NULL,
    fiche_prg VARCHAR(255),
    cours_session VARCHAR(255),
    mode VARCHAR(50) NOT NULL,
    duree INT NOT NULL COMMENT 'Durée en heures',
    etat VARCHAR(50) NOT NULL DEFAULT 'planifiée',
    type_session VARCHAR(50) NOT NULL,
    nb_participant INT DEFAULT 0,
    FOREIGN KEY (id_formation) REFERENCES formations(id_formation),
    FOREIGN KEY (id_formateur) REFERENCES formateur(id_formateur),
    FOREIGN KEY (id_theme) REFERENCES theme(id_theme)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`);
            console.log('✅ Table session_formation  initialisée');

            await db.query(`
                CREATE TABLE IF NOT EXISTS seance (
    id_seance INT AUTO_INCREMENT PRIMARY KEY,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    pause_debut TIME,
    pause_fin TIME,
    id_session INT NOT NULL,
    FOREIGN KEY (id_session) REFERENCES session_formation(id_session)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`);
            console.log('✅ Table seance initialisée');

            
        } catch (error) {
            console.error('❌ Erreur initialisation tables:', error);
            throw error;
        }
    }

    async getDomains() {
        try {
            const results = await db.query('SELECT DISTINCT nom_domaine FROM domaine');
            return results.map(row => new Domaine({ nom_domaine: row.nom_domaine }));
        } catch (err) {
            console.error('Erreur de récupération des domaines:', err);
            throw err;
        }
    }

    async getFormations() {
        try {
            // Exécution de la requête
            const queryResult = await db.query(`
                SELECT 
                    d.nom_domaine AS domaine,
                    f.id_formation,
                    s.id_session,
                    t.nom_theme AS theme,
                    t.code
                FROM 
                    formations f
                JOIN 
                    domaine d ON f.id_domaine = d.id_domaine
                LEFT JOIN 
                    session_formation s ON f.id_formation = s.id_formation
                LEFT JOIN 
                    formateur fm ON s.id_formateur = fm.id_formateur
                LEFT JOIN
                    theme t ON s.id_theme = t.id_theme
                ORDER BY 
                    d.nom_domaine, f.id_formation
            `);
    
            // Debug: Affiche la structure complète du résultat
            console.log('Query result structure:', {
                type: typeof queryResult,
                isArray: Array.isArray(queryResult),
                keys: queryResult ? Object.keys(queryResult) : null,
                sample: queryResult && Array.isArray(queryResult) ? queryResult[0] : queryResult
            });
    
            // Extraction des résultats selon le format retourné
            let results;
            if (Array.isArray(queryResult)) {
                // Cas 1: Résultat direct sous forme de tableau
                results = queryResult;
            } else if (queryResult && Array.isArray(queryResult.rows)) {
                // Cas 2: Format { rows } (utilisé par certains drivers)
                results = queryResult.rows;
            } else if (queryResult && Array.isArray(queryResult[0])) {
                // Cas 3: Format [rows, fields] (mysql2 avec connection.query)
                results = queryResult[0];
            } else if (queryResult && typeof queryResult === 'object') {
                // Cas 4: Résultat unique sous forme d'objet
                results = [queryResult];
            } else {
                throw new Error(`Format de résultat non supporté: ${typeof queryResult}`);
            }
    
            // Vérification finale
            if (!Array.isArray(results)) {
                throw new Error(`Les résultats ne sont pas dans un tableau: ${typeof results}`);
            }
    
            console.log('Extracted results:', results);
    
            // Traitement des résultats
            const formationsMap = new Map();
            
            for (const row of results) {
                if (!row) continue;
                
                if (!formationsMap.has(row.id_formation)) {
                    formationsMap.set(row.id_formation, {
                        domaine: row.domaine,
                        id_formation: row.id_formation,
                        sessions: []
                    });
                }
                
                if (row.id_session) {
                    formationsMap.get(row.id_formation).sessions.push({
                        id_session: row.id_session,
                        theme: row.theme,
                        code: row.code
                    });
                }
            }
            
            return Array.from(formationsMap.values());
        } catch (err) {
            console.error("Erreur dans getFormations:", {
                message: err.message,
                stack: err.stack,
                query: err.sql || "Non disponible"
            });
            throw new Error("Échec de récupération des formations");
        }
    }
    async getSessions() {
        try {
            const results = await db.query(`
                SELECT 
                    s.id_session, s.theme, s.code, s.etat,
                    f.nom_complet AS formateur, fr.domaine, s.id_fiche_prg
                FROM session s
                JOIN formateur f ON s.id_formateur = f.id_formateur
                JOIN formation fr ON s.id_formation = fr.id_formation
            `);
            
            if (!Array.isArray(results)) {
                throw new Error('Les résultats de la requête ne sont pas un tableau');
            }

            return results.map(row => new Theme({
                id_theme: row.id_session,
                nom_theme: row.theme,
                code: row.code,
                id_domaine: row.domaine
            }));
        } catch (err) {
            console.error('Erreur lors de la récupération des sessions:', err);
            throw err;
        }
    }

    async getFichePrg(id_fichePrg) {
        try {
            const results = await db.query(
                'SELECT chemin FROM fiche_prg WHERE id_fichePrg = ?',
                [id_fichePrg]
            );
            
            if (!Array.isArray(results)) {
                throw new Error('Les résultats de la requête ne sont pas un tableau');
            }

            if (results.length === 0) {
                throw new Error("Fiche programme non trouvée");
            }
            return { 
                chemin: `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${results[0].chemin}`
            };
        } catch (err) {
            console.error("Erreur lors de la récupération de la fiche programme:", err);
            throw err;
        }
    }

    async sendEmail(subject, body, email) {
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER || 'khadijabenabdelkader1206@gmail.com',
                to: email,
                subject: subject,
                text: body
            };
            await this.transporter.sendMail(mailOptions);
        } catch (err) {
            console.error("Erreur lors de l'envoi de l'email:", err);
            throw err;
        }
    }
}

module.exports = CatalogueUserRepository;