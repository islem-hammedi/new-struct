const express = require('express');
const router = express.Router();
const CalendrierFormationController = require('../../Controllers/User/CalendrierFormationController');

// Créer une instance du contrôleur
const controller = new CalendrierFormationController();

// Route pour obtenir le calendrier complet
router.get("/", (req, res) => controller.getCalendrier(req, res));

// Route pour obtenir les détails d'une session spécifique
router.get("/:id", (req, res) => controller.getDetailCalendrier(req, res));

module.exports = router;