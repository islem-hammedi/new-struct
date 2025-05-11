const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { getEvents, createEvent, deleteEvent } = require('../../Controllers/Admin/EventAdminController');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
  
    if (!token) {
      return res.status(401).json({ error: 'Aucun token fourni' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
  
      if (!decoded.nom_admin) {
        return res.status(403).json({ error: 'Le token ne contient pas nom_admin' });
      }
  
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Erreur de vérification du token:', error);
      return res.status(401).json({ error: 'Token invalide' });
    }
  };
  
  

router.get('/get', getEvents);
router.post('/create', createEvent);
router.delete('/:id', verifyToken, deleteEvent);

module.exports = router;