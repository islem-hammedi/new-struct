const express = require('express');
const { stockerAvis,
    getSessions } = require('../../Controllers/User/AvisUserController');
const router = express.Router();

router.get('/sessions', getSessions);
router.post('/avisParticipant', stockerAvis);
module.exports = router;