const ProfilParticipantUserRepository = require('../../repositories/user/profilParticipantUserRepository');

class ProfilParticipantUserService {
    constructor() {
        this.repository = new ProfilParticipantUserRepository();
    }

    async getParticipantProfile(id_participant) {
        try {
            return await this.repository.getParticipantProfile(id_participant);
        } catch (error) {
            console.error("Service Error - getParticipantProfile:", error);
            throw error;
        }
    }

    async updateParticipantProfile(id_participant, updateData) {
        try {
            // Validation des entrées
            if (!id_participant || isNaN(Number(id_participant))) {
                throw new Error('ID participant invalide');
            }
    
            // Normalisation des données
            const cleanData = {
                ...updateData,
                telephone: updateData.telephone || null,
                adresse: updateData.adresse || null,
                CIN: updateData.CIN || null
            };
    
            // Appel au repository
            const result = await this.repository.updateParticipantProfile(
                Number(id_participant),
                cleanData
            );
    
            return {
                success: result.success,
                message: result.message,
                affectedRows: result.affectedRows
            };
        } catch (error) {
            console.error('Service Error:', error);
            throw new Error(error.message.includes('requis') ? 
                'Validation error: ' + error.message : 
                'Database error: ' + error.message);
        }
    }
}

module.exports = ProfilParticipantUserService;