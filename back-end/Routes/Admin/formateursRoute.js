const express = require('express');
const path = require('path');
const multer = require('multer');

const {
  getFormateurs,
  getFormateurById,
  addFormateur,
  updateFormateur,
  deleteFormateur,
  getDomaineThemes
  
} = require('../../Controllers/Admin/formateursAdminController');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../..', 'uploads'));  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploads = multer({
  storage: storage,
  limits: { fileSize: 30 * 1024 * 1024 }, 
}).fields([
  { name: "cv", maxCount: 1 },        
  { name: "fiche_programme", maxCount: 10 }, 
  { name: "cours_session", maxCount: 10 }
]);


router.post('/formateurs', uploads, addFormateur);
router.get('/domaine-themes',getDomaineThemes);
router.get('/formateurs', getFormateurs);
router.get('/formateurs/:id', getFormateurById);
router.put('/formateurs/:id', uploads, updateFormateur);
router.delete('/formateurs/:id', deleteFormateur);

module.exports = router;
