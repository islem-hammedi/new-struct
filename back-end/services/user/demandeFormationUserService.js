const DemandeFormationUserRepository = require('../../repositories/user/demandeFormationUserRepository');
const DemandeFormation = require('../../models/admin/demande_formation_personalisee');

class DemandeFormationUserService {
    constructor() {
        this.repository = new DemandeFormationUserRepository();
    }

   async createDemandeFormation(demandeData) {
  const requiredFields = ['domaine','theme', 'niveau','nombreParticipants', 'mode'];
  const missingFields = requiredFields.filter(field => !demandeData[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Les champs suivants sont obligatoires: ${missingFields.join(', ')}`);
  }
  if (demandeData.nombreParticipants && isNaN(demandeData.nombreParticipants)) {
    throw new Error('Le nombre de participants doit être un nombre valide');
  }
  return await this.repository.createDemandeFormation(demandeData);
}
}

module.exports = DemandeFormationUserService;