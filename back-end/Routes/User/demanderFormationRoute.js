const express = require('express');
const router = express.Router();
const DemandeFormationUserController = require('../../Controllers/User/demanderFormationUserController');

const controller = new DemandeFormationUserController();

router.post('/', (req, res) => controller.createDemandeFormation(req, res));

module.exports = router;