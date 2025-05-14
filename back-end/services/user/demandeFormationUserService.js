const DemandeFormationUserRepository = require('../../repositories/user/demandeFormationUserRepository');
const DemandeFormation = require('../../models/admin/demande_formation_personalisee');

class DemandeFormationUserService {
    constructor() {
        this.repository = new DemandeFormationUserRepository();
    }

    async createDemandeFormation(demandeData) {
        try {
            // Validation des champs obligatoires
            if (!demandeData.domaine || !demandeData.theme ) {
                throw new Error('Les champs domaine, theme sont obligatoires');
            }

            // Création de la demande
            const nouvelleDemande = await this.repository.createDemandeFormation(demandeData);
            
            return nouvelleDemande;

        } catch (error) {
            console.error('Service Error - createDemandeFormation:', error);
            throw error;
        }
    }
}

module.exports = DemandeFormationUserService;