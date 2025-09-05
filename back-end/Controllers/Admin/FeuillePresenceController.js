


const FeuillePresenceService = require('../../services/admin/FeuillePresenceService');
const { validationResult } = require('express-validator'); // Import manquant

class FeuillePresenceController {
    async getSessionDetails(req, res) {
        try {
            const { idSession } = req.params;
            const data = await FeuillePresenceService.getSessionDetails(idSession);
            
            res.json({
                success: true,
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
    async getAllSessions(req, res) {
      try {
          const sessions = await FeuillePresenceService.getAllSessions();
          
          console.log('Controller sending sessions:', sessions);
          
          if (!sessions.length) {
              return res.status(200).json({
                  success: true,
                  data: [],
                  message: 'Aucune session trouvée'
              });
          }
          
          res.json({
              success: true,
              data: sessions,
              message: 'Sessions récupérées avec succès'
          });
          
      } catch (error) {
          console.error('Controller Error:', error);
          res.status(500).json({
              success: false,
              message: 'Erreur lors de la récupération des sessions',
              error: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
      }
  }

async addParticipantAndInsertPresence(req, res) {
    try {
        if (!req.body) {
            return res.status(400).json({ 
                success: false,
                error: "Données manquantes" 
            });
        }

        const { 
            participants = [], 
            creditImpôt = false,
            droitTirage = '',
            modeFormation = '',
            coOrganisateurs = '',
            entreprise_beneficiaire = '',
            id_session
        } = req.body;

       
        if (!Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({ 
                success: false,
                error: "Participants invalides" 
            });
        }

        const result = await FeuillePresenceService.createFeuillePresenceWithParticipants({
            participants,
            creditImpôt,
            droitTirage,
            modeFormation,
            coOrganisateurs,
            entreprise_beneficiaire,
            id_session
        });

        return res.status(201).json({
            success: true,
            data: {
                id_feuille_presence: result.id_feuille_presence,
                results: result.results, 
                message: result.message
            }
        });

    } catch (error) {
        console.error('Erreur:', error);
        return res.status(500).json({
            success: false,
            error: 'Erreur serveur',
            message: error.message
        });
    }
}
}

module.exports = new FeuillePresenceController();