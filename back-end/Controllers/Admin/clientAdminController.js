{/*const db = require('../../connect');

const getClientsPersonnes = (req, res) => {
  const query = `
    SELECT p.*, participation.id_session, t.theme,t.code
    FROM participant p
    join participation 
    on p.id_participant= participation.id_participant
    JOIN session s 
    on participation.id_session=s.id_session
    LEFT JOIN theme t 
    on t.id_theme=s.id_theme
    WHERE id_entreprise IS NULL; `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des clients personnes:", err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    res.json(results);
  });
};
const getClientsEntreprises = (req, res) => {
    const query = `
   SELECT p.*, participation.id_session,
    t.theme,t.code,e.*
    FROM participant p
    join participation 
    on p.id_participant= participation.id_participant
    JOIN session s 
    on participation.id_session=s.id_session
    LEFT JOIN theme t 
    on t.id_theme=s.id_theme
    JOIN entreprise e on e.id_entreprise=p.id_entreprise
    WHERE p.id_entreprise IS NOT NULL; 

    `;
    
    db.query(query, (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des clients entreprises:", err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json(results);
    });
  };
  
  const getParticipantsByEntreprise = (req, res) => {
    const { entrepriseName } = req.params;
    const query = `
       SELECT p.*, participation.id_session,
    t.theme,t.code,e.*
    FROM participant p
    join participation 
    on p.id_participant= participation.id_participant
    JOIN session s 
    on participation.id_session=s.id_session
    LEFT JOIN theme t 
    on t.id_theme=s.id_theme
    JOIN entreprise e on e.id_entreprise=p.id_entreprise
  
WHERE 
   e.nom_entreprise = ?
GROUP BY 
    p.nom_complet, p.telephone, p.mail, p.adresse;

    `;
    
    db.query(query, [entrepriseName], (err, results) => {
      if (err) {
        console.error("Erreur lors de la récupération des participants:", err);
        return res.status(500).json({ error: 'Erreur serveur' });
      }
      res.json(results);
    });
  };
    


  
// Mettre à jour le badge d'un participant
const badgeParticipant = async (req, res) => {
  try {
    const { id_participant } = req.params;
    const { badge } = req.body;

    // Validation du badge
    if (badge !== 'normal' && badge !== 'special') {
      return res.status(400).json({ 
        success: false,
        message: "Le badge doit être soit 'normal' soit 'special'" 
      });
    }

    const sql = 'UPDATE participant SET badge = ? WHERE id_participant = ?';
    const result = await new Promise((resolve, reject) => {
      db.query(sql, [badge, id_participant], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Participant non trouvé" 
      });
    }

    res.status(200).json({ 
      success: true,
      message: "Badge mis à jour avec succès",
      data: { id_participant, badge }
    });

  } catch (error) {
    console.error("Erreur lors de la mise à jour du badge:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur lors de la mise à jour du badge",
      error: error.message 
    });
  }
};













module.exports = {
  getClientsPersonnes,
  getClientsEntreprises,
  getParticipantsByEntreprise,badgeParticipant
};
*/}

const clientService = require('../../services/admin/client');

const getClientsPersonnes = async (req, res) => {
  try {
    const results = await clientService.getClientsPersonnes();
    res.json(results);
  } catch (error) {
    console.error("Erreur lors de la récupération des clients personnes:", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getClientsEntreprises = async (req, res) => {
  try {
    const results = await clientService.getClientsEntreprises();
    res.json(results);
  } catch (error) {
    console.error("Erreur lors de la récupération des clients entreprises:", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const getParticipantsByEntreprise = async (req, res) => {
  try {
    const { entrepriseName } = req.params;
    const results = await clientService.getParticipantsByEntreprise(entrepriseName);
    res.json(results);
  } catch (error) {
    console.error("Erreur lors de la récupération des participants:", error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const badgeParticipant = async (req, res) => {
  try {
    const { id_participant } = req.params;
    const { badge } = req.body;
    const result = await clientService.badgeParticipant(id_participant, badge);
    res.status(200).json(result);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du badge:", error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur lors de la mise à jour du badge", 
      error: error.message 
    });
  }
};

module.exports = {
  getClientsPersonnes,
  getClientsEntreprises,
  getParticipantsByEntreprise,
  badgeParticipant
};