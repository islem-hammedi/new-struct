/*const express = require('express');
const router = express.Router();
const { 
    getSessionDetails,
    
 } = require('../../Controllers/Admin/FeuillePresenceController');

router.get('/sessionDetails',getSessionDetails);
router.get('/calendrierDetails',getCalendrier);
router.post('/feuillePresence',addParticipantAndInsertPresence);

module.exports = router;*/

const express = require('express');
const router = express.Router();
const FeuillePresenceController = require('../../Controllers/Admin/FeuillePresenceController');
const { check } = require('express-validator');


// Récupérer les détails d'une session
router.get('/session/:idSession', FeuillePresenceController.getSessionDetails);
router.get('/sessions', FeuillePresenceController.getAllSessions);

// Enregistrer les présences
//router.post('/participations', FeuillePresenceController.savePresences);

router.post('/participations', FeuillePresenceController.addParticipantAndInsertPresence);

module.exports = router;