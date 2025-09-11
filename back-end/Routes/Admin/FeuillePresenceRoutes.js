const express = require('express');
const router = express.Router();
const FeuillePresenceController = require('../../Controllers/Admin/FeuillePresenceController');
router.post('/participations', FeuillePresenceController.saveFeuillePresence);





module.exports = router;