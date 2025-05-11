const express = require('express');
const router = express.Router();
const domaineAdminController = require('../../Controllers/Admin/domaineAdminController');
router.get('/domaine/Domains', domaineAdminController.getDomains);
router.get('/themes', domaineAdminController.getThemesByDomaine);
module.exports = router;