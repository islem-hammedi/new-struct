const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const { 
    getFormationsARealiser, 
    getHistoriqueFormations, 
    getFormateurDetails,
    updatePassword,
    getEvents, createEvent, deleteEvent
} = require('../Controllers/Admin/profilFormateurController');

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); 
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
}).fields([
  { name: "photo", maxCount: 1 },    
  { name: "cv", maxCount: 1 },       
  { name: "fiche_programme", maxCount: 10 },
  { name: "ficheAvis", maxCount: 20}  
]);

router.get('apiUser/formations-a-realiser/:id_formateur', getFormationsARealiser);

router.get('apiUser/historique-formations/:id_formateur', getHistoriqueFormations);

router.get('apiUser/formateur/details/:id_formateur', getFormateurDetails);
router.put('apiUser/formateur/details/:id_formateur', updatePassword);

const authenticateToken = (req, res, next) => {
    console.log("Token reçu dans la requête :", req.headers.authorization);
  
    if (!req.headers.authorization) {
      return res.status(401).json({ error: "Token manquant" });
    }
  
    const token = req.headers.authorization.split(" ")[1]; // Vérifie que le format est "Bearer TOKEN"
    if (!token) {
      return res.status(401).json({ error: "Token invalide ou mal formaté" });
    }
  
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
      if (err) {
        return res.status(401).json({ error: "Token invalide ou expiré" });
      }
      req.user = user;
      next();
    });
  };
  
  router.get('/calendrier/', authenticateToken, getEvents);
  router.post('/calendrier/', createEvent);
  router.delete('/calendrier/:id', authenticateToken, deleteEvent);
  
module.exports = router;
