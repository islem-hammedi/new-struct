{/*const demandeFormationRepository = require('../../repositories/admin/demandeFormationAdminRepository');

class DemandeFormationService {
  async getAllDemandes() {
    try {
      return await demandeFormationRepository.getAll();
    } catch (error) {
      console.error('Erreur dans DemandeFormationService:', error);
      throw new Error('Échec de la récupération des demandes');
    }
  }
}

// Exportez bien une instance
module.exports = new DemandeFormationService();*/}





const DemanderFormationAdminRepository = require('../../repositories/admin/demandeFormationAdminRepository');

const getAllDemandesWithParticipants = async () => {
    return await DemanderFormationAdminRepository.getAllDemandesWithParticipants();
};

module.exports = {
    getAllDemandesWithParticipants
};