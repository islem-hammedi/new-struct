// routes/participantRoutes.js
const express = require('express');
const router = express.Router();
const { getClientsPersonnes, getParticipantsByEntreprise, getClientsEntreprises,badgeParticipant } = require('../../Controllers/Admin/clientAdminController');

// Route pour obtenir la liste des clients de type "personne"
router.get('/clients-personnes', getClientsPersonnes);
router.get('/clients-entreprises', getClientsEntreprises);
router.put('/update-badge/:id_participant',badgeParticipant);
// Route pour obtenir les participants d'une entreprise spécifique
router.get('/clients-entreprises/:entrepriseName', getParticipantsByEntreprise);

module.exports = router;
