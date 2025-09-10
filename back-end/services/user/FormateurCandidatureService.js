const FormateurCandidatureRepository = require('../../repositories/user/FormateurCandidatureRepository');

class FormateurCandidatureService {
    constructor() {
        this.repository = new FormateurCandidatureRepository();
    }
    
    async submitCandidature(data) {
        const requiredFields = ['nom', 'telephone', 'email', 'domaine', 'themes', 'motivation', 'cv_path'];
        const missingFields = requiredFields.filter(field => !data[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Les champs suivants sont obligatoires: ${missingFields.join(', ')}`);
        }
        
        return await this.repository.createCandidature(data);
    }












    async getAllCandidatures () {
      try {
        
       
            const result = await this.repository.getAll();
          return result;
        
      } catch (error) {
        console.error('Service error dans getAllCandidatures:', error);
        throw error;
      }};
    
  
}

module.exports = FormateurCandidatureService;