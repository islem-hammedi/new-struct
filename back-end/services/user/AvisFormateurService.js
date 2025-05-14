const AvisFormateurRepository = require('../../repositories/user/AvisFormateurRepository');

class AvisFormateurService {

  constructor() {
    this.AvisFormateurRepository = new AvisFormateurRepository();
}

   async getThemesByFormateur(idFormateur) {
    try {
      if (!idFormateur) {
        throw new Error('ID formateur requis');
      }
      return await this.AvisFormateurRepository.getThemesByFormateur(idFormateur);
    } catch (error) {
      throw error;
    }
  }

   async getFeuillePresence(id_presence) {
    try {
      const results = await this.AvisFormateurRepository.getFeuillePresence(id_presence);
      
      if (results.length === 0) {
        throw new Error('Aucune donnée trouvée pour cette présence');
      }

      const presenceInfo = {
        id_presence: results[0].id_presence,
        entreprise_beneficiaire: results[0].entreprise_beneficiaire,
        date_debut: results[0].date_debut,
        date_fin: results[0].date_fin,
        id_calendrier: results[0].id_calendrier,
        participants: results
          .filter(row => row.id_participant)
          .map(row => ({
            id_participant: row.id_participant,
            nom_complet: row.nom_complet
          })),
      };

      return presenceInfo;
    } catch (error) {
      throw error;
    }
  }

   async getParticipantsByPresence(id_presence) {
    try {
      if (!id_presence) {
        throw new Error('ID de présence requis');
      }
      return await this.AvisFormateurRepository.getParticipantsByPresence(id_presence);
    } catch (error) {
      throw error;
    }
  }

   async submitEvaluation(evaluations, id_presence, id_formateur, organisme_formation) {
    try {
      if (!id_presence || !id_formateur  || !evaluations) {
        throw new Error('Données manquantes');
      }

      // Insertion dans avis_formateur
      const avisResult = await this.AvisFormateurRepository.insertAvisFormateur(
        id_formateur, 
        id_presence, 
        organisme_formation
      );

      const id_avis = avisResult.insertId;
      const participantIds = Object.keys(evaluations).map(Number);

      // Préparation des détails d'évaluation
      const avisDetails = participantIds.map(id => ({
        id_avis,
        id_participant: id,
        ...evaluations[id]
      }));

      // Insertion des détails (en une seule opération)
      await this.AvisFormateurRepository.insertAvisDetails(avisDetails);

      return { success: true, message: 'Évaluation enregistrée avec succès' };
    } catch (error) {
      console.error('Erreur dans AvisFormateurService:', error);
      throw error;
    }
  }
}
module.exports = AvisFormateurService;