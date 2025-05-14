const express = require('express');
const router = express.Router();
const profilFormateurUserController = require('../../Controllers/user/profilFormateurUserController');
const jwt = require('jsonwebtoken');

const controller = new profilFormateurUserController();

const multer = require("multer");
const path = require("path");

// Configuration de stockage pour multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Assure-toi que ce dossier existe
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Générer un nom de fichier unique
  },
});

const uploads = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB par fichier
}).fields([
  { name: "photo", maxCount: 1 },      // 1 seule photo
  { name: "cv", maxCount: 1 },         // 1 seul CV
  { name: "fichePrg", maxCount: 10 },
  { name: "ficheAvis", maxCount: 20},  
  { name: "fichiers", maxCount: 20}  

]);

// Exemple de route pour servir les fichiers en accès public
router.get('/uploads/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Erreur lors de l\'envoi du fichier :', err);
      res.status(404).send('Fichier non trouvé');
    }
  });
});

router.get('/apiUser/formations-a-realiser/:id_formateur', (req, res) => controller.getUpcomingSessions(req, res));

router.get('/apiUser/historique-formations/:id_formateur', (req, res) => controller.getHistoricalSessions(req, res));

router.get('/apiUser/formateur/details/:id_formateur', (req, res) => controller.getProfile(req, res));
router.put('/apiUser/formateur/details/:id', (req, res) => controller.changePassword(req, res));
router.post('/apiUser/modification', uploads, (req, res) => 
  controller.sendModificationRequest(req, res));
router.get('/apiUser/modification/response', (req, res) => controller.handleModificationResponse(req, res));

// Middleware authenticateToken
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
          return res.status(403).json({ error: 'Token invalide' });
      }

      // Ajoutez toutes les informations utilisateur nécessaires
      req.user = {
          id: decoded.id,
          nom_complet: decoded.nom_complet,
          email: decoded.email
          // Ajoutez d'autres champs si nécessaire
      };
      
      next();
  });
};
  router.get('/api/calendrier', authenticateToken,  (req, res) => controller.getEvents(req, res));
  
  router.post('/api/calendrier', (req, res) => controller.createEvent(req, res));
  
  router.delete('/api/calendrier/:id_event', authenticateToken, (req, res) => controller.deleteEvent(req, res));
  
module.exports = router;