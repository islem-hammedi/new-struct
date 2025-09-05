// Importation des modules
{/*const db = require('../../connect');

const DemanderFormation = (req, res) => {
  const query = 'SELECT * FROM demande_de_formation_personnalisee';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des données: ', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération des données' });
    }
    res.json(results);
  });
};

module.exports= {DemanderFormation};*/}

{/*
const db = require('../../connect');
const demandeFormationService = require('../../services/admin/demandeFormationPersonalisee'); // Déclaration UNIQUE

class DemandeFormationController {
  async DemanderFormation(req, res) {
    try {
      const query = 'SELECT * FROM demande_de_formation_personnalisee';
      db.query(query, (err, results) => {
        if (err) {
          console.error('Erreur lors de la récupération des données: ', err);
          return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(results);
      });
    } catch (error) {
      console.error('Erreur dans DemandeFormationController:', error);
      res.status(500).json({ 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}

module.exports = new DemandeFormationController();*/}















const DemanderFormationAdminService = require('../../services/admin/demandeFormationPersonalisee');

const getAllDemandesWithParticipants = async (req, res) => {
    try {
        const demandes = await DemanderFormationAdminService.getAllDemandesWithParticipants();
        res.status(200).json(demandes);
    } catch (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des demandes." });
    }
};

module.exports = {
    getAllDemandesWithParticipants
};