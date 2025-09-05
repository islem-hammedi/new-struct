const express = require('express');
const router = express.Router();
const avisFormateurC = require('../../Controllers/User/AvisFormateurController');
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'formateur') {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentification échouée' });
  }
};

router.use(authMiddleware);

router.get('/themes', avisFormateurC.getThemesByFormateur);

router.post('/evaluation', avisFormateurC.submitEvaluation);

module.exports = router; 