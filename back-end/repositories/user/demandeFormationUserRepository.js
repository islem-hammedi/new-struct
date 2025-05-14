const db = require('../../connect');
const DemandeFormation = require('../../models/admin/demande_formation_personalisee');

class DemandeFormationUserRepository {
    constructor() {
        this.initializeTable();
    }

    async initializeTable() {
        try {
            const createTableQuery = `
                CREATE TABLE IF NOT EXISTS demande_de_formation_personnalise (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    domaine VARCHAR(255) NOT NULL,
                    theme VARCHAR(255) NOT NULL,
                    formateur VARCHAR(255),
                    niveau VARCHAR(100),
                    nombreParticipants INT,
                    details TEXT,
                    mode VARCHAR(100) NOT NULL,
                    id_participant INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (id_participant) REFERENCES participants(id_participant)
                )`;
            
            await db.query(createTableQuery);
            console.log('Table demande_de_formation_personnalisee initialisée ou vérifiée');
        } catch (err) {
            console.error('Erreur lors de l\'initialisation de la table:', err);
            throw err;
        }
    }

    async createDemandeFormation(demandeData) {
        try {
            const query = `
                INSERT INTO demande_de_formation_personnalise 
                (domaine, theme, formateur, niveau, nombreParticipants, details, mode, id_participant)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const result = await db.query(query, [
                demandeData.domaine,
                demandeData.theme,
                demandeData.formateur || null,
                demandeData.niveau || null,
                demandeData.nombreParticipants || null,
                demandeData.details || null,
                demandeData.mode,
                demandeData.id_participant || null
            ]);

            return new DemandeFormation({
                id: result.insertId,
                ...demandeData
            });

        } catch (err) {
            console.error('Repository Error - createDemandeFormation:', err);
            throw err;
        }
    }

    
}

module.exports = DemandeFormationUserRepository;