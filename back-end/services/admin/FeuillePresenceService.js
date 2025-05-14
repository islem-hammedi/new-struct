const FeuillePresenceRepository = require('../../repositories/admin/FeuillePresenceRepository');
const db = require('../../connect');
class FeuillePresenceService {
    async getSessionDetails(idSession) {
        try {
            if (!idSession) {
                throw new Error('ID session est requis');
            }
            
            return await FeuillePresenceRepository.getSessionDetails(idSession);
        } catch (error) {
            throw error;
        }
    }
    async getAllSessions() {
        try {
            const sessions = await FeuillePresenceRepository.getAllSessionsWithDetails();
            
            // Debug: Vérifiez ce qui est reçu du repository
            
            if (!Array.isArray(sessions)) {
                console.error('Expected array but got:', typeof sessions);
                return [];
            }
            
            return sessions.map(session => {
                // Ajoutez des vérifications pour chaque propriété
                return {
                    id_session: session.id_session || null,
                    theme_nom: session.theme_nom ,
                    formateur_nom: session.formateur_nom ,
                    date_debut: session.date_debut 
                        ? new Date(session.date_debut).toLocaleDateString('fr-FR') 
                        : 'Date inconnue',
                    date_fin: session.date_fin 
                        ? new Date(session.date_fin).toLocaleDateString('fr-FR') 
                        : 'Date inconnue',
                    lieu: session.lieu ,
                    duree: session.duree || 0
                };
            });
            
        } catch (error) {
            console.error('Service Error:', error);
            // Retourne un tableau vide en cas d'erreur
            return []; 
        }
    }
    async findOrCreateParticipant(participantData) {
        return new Promise(async (resolve, reject) => {
            let participant;
            try {
                // Recherche existant
                participant = await FeuillePresenceRepository.findByCIN(participantData.CIN);
                
                // Création si inexistant
                if (!participant) {
                    participant = await FeuillePresenceRepository.createParticipant({
                        CIN: participantData.CIN,
                        nom_complet: participantData.nomComplet,
                        mail: participantData.mail || null,
                        telephone: participantData.telephone || null,
                        id_entreprise: participantData.id_entreprise || null
                    });
                }
                
                if (!participant?.id_participant) {
                    throw new Error('Participant ID manquant');
                }
                
                resolve(participant);
            } catch (error) {
                reject(error);
            }
        });
    }

    async createFeuillePresenceWithParticipants(data) {
        return new Promise(async (resolve, reject) => {
            let connection;
            const results = [];
            
            try {
                // Démarrer transaction
                await new Promise((res, rej) => {
                    db.beginTransaction(err => {
                        if (err) return rej(err);
                        res();
                    });
                });
    
                // Créer feuille de présence
                const idPresence = await FeuillePresenceRepository.createFeuillePresence({
                    credit_impot: data.creditImpôt ? 1 : 0,
                    droit_tirage: data.droitTirage,
                    mode_formation: data.modeFormation,
                    co_organisateurs: data.coOrganisateurs,
                    entreprise_beneficiaire: data.entreprise_beneficiaire
                });
    
                // Traiter chaque participant
                for (const participant of data.participants) {
                    try {
                        const participantEntity = await this.findOrCreateParticipant(participant);
                        
                        await FeuillePresenceRepository.addParticipantToFeuille({
                            id_presence: idPresence,
                            id_participant: participantEntity.id_participant,
                            emargements: participant.emargements,
                            id_session: data.id_session
                        });
    
                        results.push({
                            CIN: participant.CIN,
                            id_participant: participantEntity.id_participant,
                            status: 'success'
                        });
                    } catch (error) {
                        results.push({
                            CIN: participant.CIN,
                            error: error.message,
                            status: 'failed'
                        });
                    }
                }
    
                // Commit transaction
                await new Promise((res, rej) => {
                    db.commit(err => {
                        if (err) return rej(err);
                        res();
                    });
                });
    
                resolve({
                    id_feuille_presence: idPresence,
                    results, // <-- Ajout des résultats
                    message: "Feuille de présence créée avec succès"
                });
    
            } catch (error) {
                // Rollback en cas d'erreur
                if (connection) {
                    await new Promise(res => db.rollback(() => res()));
                }
                reject(error);
            }
        });
    }
    
    /*async savePresences(idSession, presences) {
        try {
            if (!idSession || !presences || !Array.isArray(presences)) {
                throw new Error('Données invalides');
            }
            
            const results = [];
            for (const presence of presences) {
                if (!presence.idParticipant) continue;
                
                const result = await FeuillePresenceRepository.savePresences(
                    idSession,
                    presence.idParticipant,
                    {
                        present: presence.present || false,
                        evaluation: presence.evaluation || null,
                        commentaires: presence.commentaires || null
                    }
                );
                results.push(result);
            }
            
            return { success: true, results };
        } catch (error) {
            throw error;
        }
    }*/
        
}

module.exports = new FeuillePresenceService();