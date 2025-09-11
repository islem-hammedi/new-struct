const FeuillePresenceRepository = require('../../repositories/admin/FeuillePresenceRepository');

class FeuillePresenceService {

  async saveFeuillePresence(data) {
    try {
      const feuillePresenceId = await FeuillePresenceRepository.createFeuillePresence({
        id_session: data.id_session,
        credit_impot: data.credit_impot,
        droit_tirage: data.droit_tirage,
        mode_formation: data.mode_formation,
        co_organisateurs: data.co_organisateurs,
        horaire_debut: data.horaire_debut,
        horaire_fin: data.horaire_fin,
        pause_debut: data.pause_debut,
        pause_fin: data.pause_fin,
        entreprise_beneficiaire: data.entreprise_beneficiaire
      });

      console.log('Feuille de présence créée avec ID:', feuillePresenceId);

      const participantResults = [];

      for (const participant of data.participants) {
        try {
          let participantId = await FeuillePresenceRepository.findOrCreateParticipant({
            CIN: participant.CIN,
            nomComplet: participant.nomComplet,
            mail: participant.mail,
            telephone: participant.telephone || null,
            direction_service: participant.directionService || null
          });

          await FeuillePresenceRepository.createFeuillePresenceParticipant({
            id_presence: feuillePresenceId,
            id_participant: participantId,
            id_session: data.id_session,
            emargement: JSON.stringify(participant.emargements || {})
          });

          participantResults.push({
            CIN: participant.CIN,
            id_participant: participantId,
            status: 'success'
          });

          console.log(`✅ Participant ${participant.CIN} traité avec succès`);

        } catch (participantError) {
          console.error(`❌ Erreur pour le participant ${participant.CIN}:`, participantError);
          participantResults.push({
            CIN: participant.CIN,
            status: 'error',
            error: participantError.message
          });
        }
      }

      return {
        feuillePresenceId,
        participantResults
      };

    } catch (error) {
      console.error('❌ Erreur dans saveFeuillePresence service:', error);
      throw new Error(`Erreur lors de la sauvegarde de la feuille de présence: ${error.message}`);
    }
  }
}

module.exports = new FeuillePresenceService();