

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