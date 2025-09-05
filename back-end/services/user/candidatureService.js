const candidatureRepository = require('./candidatureRepository');

class CandidatureService {
  async createCandidature(formData, cvFile) {
    // Validate required fields
    const requiredFields = ['nom_complet', 'mail', 'tel', 'domaines_competence'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.mail)) {
      throw new Error('Invalid email format');
    }

    // Validate CV file
    if (!cvFile) {
      throw new Error('CV (PDF) is required');
    }

    if (cvFile.mimetype !== 'application/pdf') {
      throw new Error('CV must be a PDF file');
    }

    const candidatureData = {
      ...formData,
      cv: cvFile
    };

    return await candidatureRepository.createCandidature(candidatureData);
  }

  async getAllCandidatures() {
    return await candidatureRepository.getAllCandidatures();
  }
}

module.exports = new CandidatureService();