const referenceRepository = require("../../repositories/user/referenceRepository");

const getReferences = async (secteur) => {
  try {
    
    if (secteur) {
      const result = await referenceRepository.getReferencesBySecteur(secteur);
      return result;
    } else {
      const result = await referenceRepository.getAllReferences();
      return result;
    }
  } catch (error) {
    console.error('❌ Service error:', error);
    throw error;
  }};

module.exports = {
  getReferences,
};