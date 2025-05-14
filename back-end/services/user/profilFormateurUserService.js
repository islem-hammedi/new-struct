const ProfilFormateurUserRepository = require('../../repositories/user/profilFormateurUserRepository');
const Formateur = require('../../models/admin/formateur');
const Event = require('../../models/admin/evenement');
const bcrypt = require('bcrypt');

class ProfilFormateurUserService {
    constructor() {
        this.repository = new ProfilFormateurUserRepository();
    }

    /*async getFormateurDetails(id_formateur) {
        try {
            
            return await this.repository.getFormateurDetails(id_formateur);

        } catch (error) {
            console.error('Service Error - getFormateurDetails:', error);
            throw error;
        }
    }

    async getFormationsARealiser(id_formateur) {
        try {
            if (!id_formateur) {
                throw new Error('ID formateur requis');
            }

            const sessions = await this.repository.getFormationsARealiser(id_formateur);
            
            if (sessions.length === 0) {
                throw new Error('Aucune formation à réaliser trouvée');
            }

            return sessions;

        } catch (error) {
            console.error('Service Error - getFormationsARealiser:', error);
            throw error;
        }
    }

    async getHistoriqueFormations(id_formateur) {
        try {
            if (!id_formateur) {
                throw new Error('ID formateur requis');
            }

            const sessions = await this.repository.getHistoriqueFormations(id_formateur);
            
            if (sessions.length === 0) {
                throw new Error('Aucune formation historique trouvée');
            }

            return sessions;

        } catch (error) {
            console.error('Service Error - getHistoriqueFormations:', error);
            throw error;
        }
    }

    async updatePassword(id_formateur, oldPassword, newPassword) {
        try {
            if (!id_formateur || !oldPassword || !newPassword) {
                throw new Error('Tous les champs sont requis');
            }

            await this.repository.updatePassword(id_formateur, oldPassword, newPassword);
            return { success: true, message: 'Mot de passe mis à jour avec succès' };

        } catch (error) {
            console.error('Service Error - updatePassword:', error);
            throw error;
        }
    }*/
        async getFormateurDetails(id_formateur) {
            try {
                const formateur = await this.repository.getById(id_formateur);
                if (!formateur) {
                    throw new Error('Formateur not found');
                }
                return formateur;
            } catch (err) {
                console.error('FormateurService Error - getFormateurDetails:', err);
                throw err;
            }
        }
    
        async getUpcomingSessions(id_formateur) {
            try {
                return await this.repository.getSessionsByStatus(id_formateur, 'A Realisé');
            } catch (err) {
                console.error('FormateurService Error - getUpcomingSessions:', err);
                throw err;
            }
        }
    
        async getHistoricalSessions(id_formateur) {
            try {
                return await this.repository.getSessionsByStatus(id_formateur, 'Déja Realisé');
            } catch (err) {
                console.error('FormateurService Error - getHistoricalSessions:', err);
                throw err;
            }
        }
    
        async updatePassword(id_formateur, oldPassword, newPassword) {
            try {
              // Validation des entrées
              if (!id_formateur || !oldPassword || !newPassword) {
                throw new Error('Tous les champs sont requis');
              }
        
              // Récupération du mot de passe stocké
              const storedPassword = await this.repository.verifyPassword(id_formateur);
              if (!storedPassword) {
                throw new Error('Formateur non trouvé');
              }
        
              // Vérification de l'ancien mot de passe
              const isMatch = await bcrypt.compare(oldPassword, storedPassword);
              if (!isMatch) {
                throw new Error('Mot de passe actuel incorrect');
              }
        
              // Hash du nouveau mot de passe
              const hashedPassword = await bcrypt.hash(newPassword, 10);
              
              // Mise à jour en base de données
              const updated = await this.repository.updatePassword(id_formateur, hashedPassword);
              if (!updated) {
                throw new Error('Échec de la mise à jour du mot de passe');
              }
        
              return true;
            } catch (error) {
              console.error('Service Error - updatePassword:', error);
              throw error;
            }
          }

        async getEvents() {
            try {
              return await this.repository.getAllEvents();
            } catch (error) {
              console.error('Service Error - getEvents:', error);
              throw new Error('Failed to fetch events');
            }
          }
        
          async createEvent(eventData) {
            try {
              if (!eventData.event || !eventData.date || !eventData.created_by) {
                throw new Error('Missing required fields');
              }
        
              return await this.repository.createEvent(
                eventData.event,
                eventData.date,
                eventData.created_by
              );
            } catch (error) {
              console.error('Service Error - createEvent:', error);
              throw new Error(`Failed to create event: ${error.message}`);
            }
          }
        
          // Service
async deleteEvent(id_event, nomComplet) {
    try {
        if (!nomComplet) {
            throw new Error('Le nom du créateur est requis');
        }

        
        const success = await this.repository.deleteEvent(id_event, nomComplet);
        
        if (!success) {
            const exists = await this.repository.eventExists(id_event);
            throw new Error(exists ? 'Non autorisé' : 'Événement non trouvé');
        }
        
        return { success: true };
    } catch (error) {
        console.error('Erreur service:', { 
            error: error.message,
            id_event,
            nomComplet
        });
        throw error;
    }
}
    async sendModificationRequest(requestData) {
        try {
            // Validation des données
            const requiredFields = ['telephone', 'nouveauxDonnes', 'nomFormateur', 'email'];
            for (const field of requiredFields) {
                if (!requestData[field]) {
                    throw new Error(`Le champ ${field} est requis`);
                }
            }

            return await this.repository.sendModificationRequest(requestData);

        } catch (error) {
            console.error('Service Error - sendModificationRequest:', error);
            
            // Enrichir l'erreur pour le controller
            const enrichedError = new Error(error.message);
            enrichedError.statusCode = error.message.includes('requis') ? 400 : 500;
            throw enrichedError;
        }
    }
    async handleModificationResponse(token, decision, email) {
        try {
            if (!token || !decision || !email) {
                throw new Error('Paramètres manquants');
            }

            if (!['accept', 'reject'].includes(decision)) {
                throw new Error('Décision invalide');
            }

            return await this.repository.handleModificationResponse(token, decision, email);

        } catch (error) {
            console.error('Service Error - handleModificationResponse:', error);
            
            // Enrichir l'erreur pour le controller
            error.statusCode = error.message.includes('Paramètres') ? 400 : 500;
            throw error;
        }
    }

}

module.exports = ProfilFormateurUserService;