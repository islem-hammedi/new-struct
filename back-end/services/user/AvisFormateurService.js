const AvisFormateurRepository = require('../../repositories/user/AvisFormateurRepository');

class AvisFormateurService {
  async getThemesByFormateur(formateurId) {
    try {
      if (!formateurId) throw new Error('ID formateur requis');
      return await AvisFormateurRepository.getThemesByFormateur(formateurId);
    } catch (error) {
      console.error('Erreur dans getThemesByFormateur:', error);
      throw error;
    }
  }

  async submitEvaluation(evaluations, id_presence, id_formateur, id_participant) {
    try {
      if (!id_presence || !id_formateur || !evaluations || !id_participant) {
        throw new Error('Données manquantes pour l\'évaluation');
      }

      // Validation des évaluations
      const requiredFields = [
        'connaissances_professionnelles',
        'connaissances_equipements',
          'comprehension_competences',
          'aptitude_appliquer_infos',
          'rapidite_execution',
          'qualite_travaux',
          'clarte_pertinence_resultats',
          'perfectionnement_connaissances',
          'respect_consignes_constructeur',
          'respect_normes_securite',
          'autonomie_travail',
          'participation',
          'assiduite_ponctualite',
          'initiative',
          'esprit_groupe',
          'observation',
      ];

      for (const field of requiredFields) {
        if (!evaluations[field]) {
          throw new Error(`Le critère ${field} est requis`);
        }
      }

      return await AvisFormateurRepository.insertAvisFormateur(
        id_formateur,
        id_presence,
        id_participant,
        evaluations
      );
    } catch (error) {
      console.error('Erreur dans submitEvaluation:', error);
      throw error;
    }
  }
}

module.exports = new AvisFormateurService();