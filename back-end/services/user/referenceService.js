const referenceRepository = require("../../repositories/user/referenceRepository");

const getReferences = async (secteur) => {
  try {
    //console.log('🔵 Service getReferences called with secteur:', secteur);
    
    if (secteur) {
      const result = await referenceRepository.getReferencesBySecteur(secteur);
      //console.log('Repository result with secteur:', result);
      return result;
    } else {
      const result = await referenceRepository.getAllReferences();
      //console.log('Repository result all:', result);
      return result;
    }
  } catch (error) {
    console.error('❌ Service error:', error);
    throw error;
  }};

module.exports = {
  getReferences,
};