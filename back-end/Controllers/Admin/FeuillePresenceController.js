const FeuillePresenceService = require('../../services/admin/FeuillePresenceService');

class FeuillePresenceController {
  
  async saveFeuillePresence(req, res) {
    try {
      console.log(' Données reçues:', JSON.stringify(req.body, null, 2));
      
      const {
        id_session,
        participants,
        creditImpôt,
        droitTirage,
        modeFormation,
        coOrganisateurs,
        horaire_debut,
        horaire_fin,
        pause_debut,
        pause_fin,
        entreprise_beneficiaire
      } = req.body;

      if (!id_session) {
        return res.status(400).json({
          success: false,
          error: "L'ID de session est requis"
        });
      }

      if (!participants || !Array.isArray(participants) || participants.length === 0) {
        return res.status(400).json({
          success: false,
          error: "Les participants sont requis"
        });
      }

      for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        if (!participant.CIN || !participant.nomComplet) {
          return res.status(400).json({
            success: false,
            error: `Le participant ${i + 1} doit avoir un CIN et un nom complet`
          });
        }
      }

      const result = await FeuillePresenceService.saveFeuillePresence({
        id_session,
        participants,
        credit_impot: creditImpôt || false,
        droit_tirage: droitTirage || '',
        mode_formation: modeFormation || '',
        co_organisateurs: coOrganisateurs || '',
        horaire_debut: horaire_debut || '08:30',
        horaire_fin: horaire_fin || '17:00',
        pause_debut: pause_debut || '12:00',
        pause_fin: pause_fin || '13:30',
        entreprise_beneficiaire: entreprise_beneficiaire || ''
      });

      return res.status(201).json({
        success: true,
        data: {
          message: "Feuille de présence enregistrée avec succès",
          feuillePresenceId: result.feuillePresenceId,
          results: result.participantResults
        }
      });

    } catch (error) {
      console.error(' Erreur dans saveFeuillePresence:', error);
      return res.status(500).json({
        success: false,
        error: error.message || "Erreur interne du serveur",
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}

module.exports = new FeuillePresenceController();