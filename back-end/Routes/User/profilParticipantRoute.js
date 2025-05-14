const express = require('express');
const router = express.Router();
const ProfilParticipantController = require('../../Controllers/User/profilParticipantUserController');

const controller = new ProfilParticipantController();

router.get('/:id', (req, res) => controller.getParticipantProfile(req, res));
router.put('/:id', (req, res) => controller.updateParticipantProfile(req, res));

module.exports = router;