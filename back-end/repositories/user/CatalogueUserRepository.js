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
                user: process.env.EMAIL_USER || 'isslem.hammedi@gmail.com',
                pass: process.env.EMAIL_PASS || 'qqij aava gtxv hpdz'
            }
        });
    }

    async initTables() {
        try {
            await db.query(`
                CREATE TABLE IF NOT EXISTS domaine (
                    id_domaine INT AUTO_INCREMENT PRIMARY KEY,
                    domaine VARCHAR(255) NOT NULL UNIQUE
                )`);
            //console.log('✅ Table domaine initialisée');

            await db.query(`
                CREATE TABLE IF NOT EXISTS theme (
                    id_theme INT AUTO_INCREMENT PRIMARY KEY,
                    theme VARCHAR(255) NOT NULL,
                    code VARCHAR(50),
                    id_domaine INT,
                    FOREIGN KEY (id_domaine) REFERENCES domaine(id_domaine)
                )`);
            //console.log('✅ Table theme initialisée');

            await db.query(`
                CREATE TABLE IF NOT EXISTS formation (
    id_formation INT AUTO_INCREMENT PRIMARY KEY,
    id_domaine INT NOT NULL,
    FOREIGN KEY (id_domaine) REFERENCES domaine(id_domaine)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`);
            //console.log('✅ Table formations initialisée');

            await db.query(`
                CREATE TABLE IF NOT EXISTS session (
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
    FOREIGN KEY (id_formation) REFERENCES formation(id_formation),
    FOREIGN KEY (id_formateur) REFERENCES formateur(id_formateur),
    FOREIGN KEY (id_theme) REFERENCES theme(id_theme)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`);
            //console.log('✅ Table session_formation  initialisée');

            await db.query(`
                CREATE TABLE IF NOT EXISTS seance_session (
    id_seance INT AUTO_INCREMENT PRIMARY KEY,
    heure_debut TIME NOT NULL,
    heure_fin TIME NOT NULL,
    pause_debut TIME,
    pause_fin TIME,
    id_session INT NOT NULL,
    FOREIGN KEY (id_session) REFERENCES session(id_session)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
`);
            //console.log('✅ Table seance initialisée');

            
        } catch (error) {
            console.error('❌ Erreur initialisation tables:', error);
            throw error;
        }
    }

    async getDomains() {
        try {
            const results = await db.query('SELECT DISTINCT domaine FROM domaine');
            return results.map(row => new Domaine({ nom_domaine: row.nom_domaine }));
        } catch (err) {
            console.error('Erreur de récupération des domaines:', err);
            throw err;
        }
    }

    async getFormations() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    d.id_domaine,
                    d.domaine AS domaine,
                    t.id_theme,
                    t.theme AS theme,
                    t.code
                FROM 
                    domaine d
                LEFT JOIN 
                    theme t ON t.id_domaine = d.id_domaine
               
                WHERE
                    t.id_theme IS NOT NULL
                GROUP BY
                    d.id_domaine, t.id_theme
                ORDER BY 
                    d.domaine, t.theme
            `;
    
            db.query(query, (error, results) => {
                if (error) return reject(error);
    
                try {
                    // Construire une structure Domaine → [Thèmes...]
                    const domainesMap = new Map();
    
                    results.forEach(row => {
                        if (!domainesMap.has(row.id_domaine)) {
                            domainesMap.set(row.id_domaine, {
                                id_domaine: row.id_domaine,
                                domaine: row.domaine,
                                themes: []
                            });
                        }
    
                        const domaine = domainesMap.get(row.id_domaine);
    
                        domaine.themes.push({
                            id_theme: row.id_theme,
                            theme: row.theme,
                            code: row.code
                        });
                    });
    
                    resolve(Array.from(domainesMap.values()));
                } catch (err) {
                    reject(err);
                }
            });
        });
    }
    
    async getSessions() {
        try {
            const results = await db.query(`
                SELECT 
                    s.id_session, t.theme, t.code, s.etat,
                    f.nom_complet AS formateur, d.domaine, s.fiche_prg
                FROM session s
                join theme t on s.id_theme=t.id_theme
                JOIN formateur f ON s.id_formateur = f.id_formateur
                JOIN formation fr ON s.id_formation = fr.id_formation
                                JOIN domaine d ON d.id_domaine = fr.id_domaine

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

    async getFormateursByTheme(id_theme) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    f.id_formateur,
                    f.nom_complet,
                    f.cv,
                    f.tarif_journalier,
                    s.fiche_prg,
                    s.cours_session,
                    s.mode,
                    s.duree
                FROM 
                    formateur f
                JOIN 
                    session s ON f.id_formateur = s.id_formateur
                JOIN 
                    theme t ON s.id_theme = t.id_theme
                WHERE 
                    t.id_theme = ? 
                    AND (
                        f.themes_a_enseigner LIKE CONCAT('%{"id_theme":', t.id_theme, '%')
                        OR f.themes_a_enseigner LIKE CONCAT('%"id_theme":', t.id_theme, '%')
                    )
            `;
            
            db.query(query, [id_theme], (error, results) => {
                if (error) {
                    console.error('Erreur lors de la récupération des formateurs:', error);
                    return reject(new Error('Erreur de base de données'));
                }
                
                // Vérification que results est bien un tableau
                if (!Array.isArray(results)) {
                    console.error('Les résultats ne sont pas un tableau:', results);
                    return reject(new Error('Format de données incorrect'));
                }
                
                resolve(results);
            });
        });
    }
}

module.exports = CatalogueUserRepository;