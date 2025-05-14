const express = require('express');
const router = express.Router();
const FormateurCandidatureController = require('../../Controllers/User/FormateurCandidatureController');
const multer = require('multer');
const path = require('path');
const fs = require('fs')
// Configuration de multer pour le stockage temporaire
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, '../../uploads');
      // Créer le dossier s'il n'existe pas
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Génère un nom de fichier unique avec extension
      const uniqueName = Date.now() + path.extname(file.originalname);
      cb(null, uniqueName); // Ex: "56458487956.pdf"
    }
  });
  
  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      if (path.extname(file.originalname).toLowerCase() !== '.pdf') {
        return cb(new Error('Seuls les fichiers PDF sont acceptés'));
      }
      cb(null, true);
    }
  });
// Routes
router.post(
    '/',
    upload.fields([
      { name: 'cv', maxCount: 1 },
      { name: 'certificats', maxCount: 1 }
    ]),
    FormateurCandidatureController.submitCandidature
  );

  router.get('/accepted', FormateurCandidatureController.getAcceptedFormateurs);
  router.get('/', FormateurCandidatureController.getDemandes);
  router.post('/:id/traiter', FormateurCandidatureController.traiterDemande);
module.exports = router;