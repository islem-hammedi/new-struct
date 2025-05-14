const express = require('express');
const router = express.Router();
const multer = require("multer");

const upload = multer({ dest: 'uploads/' });


const CatalogueController = require('../../controllers/User/CatalogueUserController');
const catalogueController = new CatalogueController(); // Instanciation du contrôleur
router.get('/Domains', (req, res) => catalogueController.getDomains(req, res));
router.get('/Form',  (req, res) => catalogueController.getFormation(req, res));
router.get('/sessions', (req, res) => catalogueController.getSession(req, res));
router.post('/send-email', (req, res) => catalogueController.sendMail(req, res));
router.get('/fiche/:id_fichePrg', (req, res) => catalogueController.getfichePrg(req, res));
module.exports = router;