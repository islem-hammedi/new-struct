const express = require('express');
const router = express.Router();
const { getAllDemandesWithParticipants } = require('../../Controllers/Admin/DemanderFormationAdminController');

router.get('/',getAllDemandesWithParticipants);
module.exports = router;