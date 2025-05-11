const formationAdminRepository = require('../../repositories/admin/formationRepository');
const path = require('path');
const fs = require('fs');

class FormationAdminService {
    async getFormationsWithSessions() {
        try {
            const results = await formationAdminRepository.getAllFormationsWithSessions();
            
            // Structurer les résultats en regroupant les sessions sous leur formation
            const formationsMap = new Map();
            results.forEach((row) => {
                if (!formationsMap.has(row.id_formation)) {
                    formationsMap.set(row.id_formation, {
                        domaine: row.domaine,
                        id_formation: row.id_formation,
                        sessions: [],
                    });
                }
                if (row.id_session) {
                    formationsMap.get(row.id_formation).sessions.push({
                        id_session: row.id_session,
                        theme: row.theme,
                    code: row.code,
                    nb_participants: row.nb_participants,
                    lieu: row.lieu,
                    etat: row.etat,
                    genre: row.genre,
                    mode: row.mode,
                    type_session: row.type_session,
                    id_formateur: row.id_formateur,
                    formateur: row.formateur,
                    fiche_prg: row.fiche_prg,
                    cours_session: row.cours_session,
                    date_debut: row.date_debut,
                    date_fin: row.date_fin  });
                }
            });
            
            return Array.from(formationsMap.values());
        } catch (error) {
            throw error;
        }
    }

    async createFormationWithSessions(domaine, sessions, files) {
        try {
            // Validation
            if (!domaine) {
                throw new Error("Le domaine est obligatoire");
            }

            if (!sessions || !Array.isArray(sessions) || sessions.length === 0) {
                throw new Error('Au moins une session est requise');
            }

            // Validation des champs obligatoires
            sessions.forEach((session, index) => {
                if (!session.theme || !session.id_formateur) {
                    throw new Error(`Session ${index + 1}: Le thème et le formateur sont obligatoires`);
                }
                
                if (!files?.[index] && session.requireFile) {
                    throw new Error(`Session ${index + 1}: Le fichier programme est obligatoire`);
                }
            });

            // Appel au repository
            const result = await formationAdminRepository.addFormationWithSessions(
                domaine, 
                sessions, 
                files || []
            );

            return {
                success: true,
                message: 'Formation créée avec succès',
                data: result
            };
        } catch (error) {
            // Nettoyage des fichiers en cas d'erreur
            if (files) {
                this.cleanupFiles(files);
            }
            
            return {
                success: false,
                message: error.message,
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    }

    cleanupFiles(files) {
        files.forEach(file => {
            if (file?.filename) {
                const filePath = path.join(__dirname, '../../uploads', file.filename);
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (err) {
                        console.error('Erreur lors de la suppression du fichier:', filePath, err);
                    }
                }
            }
        });
    }

    async addSessionToFormation(id_formation, sessionData, file) {
        try {
            // Validation
            if (!id_formation) {
                throw new Error("L'ID de formation est obligatoire");
            }
            
            if (!sessionData.theme || !sessionData.id_formateur) {
                throw new Error("Le thème et le formateur sont obligatoires");
            }

            const fileName = file ? file.filename : null;
            return await formationAdminRepository.addSessionToFormation(
                id_formation,
                {
                    ...sessionData,
                    fiche_prg: fileName
                }
            );
        } catch (error) {
            // Nettoyage du fichier en cas d'erreur
            if (file) {
                this.cleanupFile(file);
            }
            throw error;
        }
    }

    cleanupFiles(files) {
        files.forEach(file => {
            this.cleanupFile(file);
        });
    }

    cleanupFile(file) {
        try {
            if (file?.filename) {
                const filePath = path.join(__dirname, '../../uploads', file.filename);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
        } catch (cleanupError) {
            console.error('Error cleaning up file:', cleanupError);
        }
    }

    async deleteSession(sessionId) {
        try {
            if (!sessionId || isNaN(sessionId)) {
                throw new Error("ID de session invalide");
            }
    
            const deleteResult = await formationAdminRepository.deleteSession(sessionId);
    
            // Suppression physique du fichier
            if (deleteResult.fileName) {
                const filePath = path.join(__dirname, '../../uploads', deleteResult.fileName);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
    
            return {
                success: true,
                message: `Session ${sessionId} supprimée avec succès`,
                deletedCount: deleteResult.deletedCount
            };
        } catch (error) {
            console.error(`Erreur suppression session ${sessionId}:`, error);
            return {
                success: false,
                message: error.message.includes("non trouvée") 
                    ? "La session spécifiée n'existe pas"
                    : "Erreur lors de la suppression de la session",
                error: process.env.NODE_ENV === 'development' ? error.stack : undefined
            };
        }
    }
}


module.exports = new FormationAdminService();