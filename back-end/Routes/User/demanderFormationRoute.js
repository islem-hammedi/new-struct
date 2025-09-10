const express = require('express');
const router = express.Router();
const DemandeFormationUserController = require('../../Controllers/User/demanderFormationUserController');

const controller = new DemandeFormationUserController();

router.post('/', (req, res) =>{console.log("Headers reçus:", req.headers);
    console.log("Body reçu:", req.body); controller.createDemandeFormation(req, res)});

module.exports = router;