const express = require("express");
const router = express.Router();
const { login, register, requestPasswordReset ,resetPassword,changePassword} = require("../../Controllers/User/authUserController");
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
      return res.status(403).json({ message: 'Token manquant' });
    }
  
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Token invalide' });
      }
      
      req.user = decoded;
      next();
    });
  };
  

// Définition des routes d'authentification
router.post("/login", login);
router.post("/register", register);
router.post('/request-password-reset',requestPasswordReset);
router.post('/reset-password', resetPassword);
router.post('/change-password', verifyToken, changePassword);

module.exports = router; // ⚠️ S'assurer que le module est bien exporté