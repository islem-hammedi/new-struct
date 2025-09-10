const express = require('express');
const router = express.Router();
const FeuillePresenceController = require('../../Controllers/Admin/FeuillePresenceController');

// Middleware d'authentification (optionnel - ajustez selon vos besoins)
// const authMiddleware = require('../../middlewares/authMiddleware');

// Route pour sauvegarder une feuille de présence
// Cette route correspond à l'endpoint utilisé dans le frontend : /apiAdmin/participations
router.post('/participations', FeuillePresenceController.saveFeuillePresence);

// Routes additionnelles pour la gestion des feuilles de présence (optionnelles)

// Récupérer toutes les feuilles de présence
router.get('/feuilles-presence', async (req, res) => {
  try {
    const FeuillePresenceRepository = require('../../repositories/admin/FeuillePresenceRepository');
    const feuilles = await FeuillePresenceRepository.getAllFeuillesPresence();
    
    res.status(200).json({
      success: true,
      data: feuilles
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des feuilles de présence:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Récupérer une feuille de présence par ID
router.get('/feuilles-presence/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const FeuillePresenceRepository = require('../../repositories/admin/FeuillePresenceRepository');
    
    const feuille = await FeuillePresenceRepository.getFeuillePresenceById(id);
    const participants = await FeuillePresenceRepository.getParticipantsByFeuillePresence(id);
    
    if (!feuille) {
      return res.status(404).json({
        success: false,
        error: 'Feuille de présence non trouvée'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        feuille,
        participants
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la feuille de présence:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;