const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');





const CalendrierFormationController = require('../../Controllers/User/CalendrierFormationController');
const controller = new CalendrierFormationController();

router.get("/", (req, res) => controller.getCalendrier(req, res));
router.get("/:id", (req, res) => controller.getDetailCalendrier(req, res));



module.exports = router;