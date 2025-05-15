const express = require("express");
const router = express.Router();

const {
 getCatalogue,updateTheme,getFormateursBySession,addThemeToDomain } = require("../../Controllers/Admin/catalogueAdminController");
const{addDomain}=require("../../Controllers/Admin/addDomainAdminController");
const {deleteTheme} = require("../../Controllers/Admin/catalogueAdminController");
router.get('/',getCatalogue)
router.get('/:id_theme', getFormateursBySession);
//router.put('/updateDomain/:id',updateTheme)
router.post('/addDomain',addDomain)
router.delete('/domaine/:id_domaine/theme/:id_theme',deleteTheme)
router.post('/addThemesToDomain', addThemeToDomain);
router.put('/themes/:id_theme/formateurs',updateTheme);
module.exports = router;
