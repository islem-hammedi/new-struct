const referenceService = require("../../services/user/referenceService");

const getReferences = async (req, res) => {
  try {
    console.log(' getReferences called');
    const secteur = req.query.secteur || null;
    console.log('Secteur:', secteur);
    const references = await referenceService.getReferences(secteur);
    console.log('References found:', references.length);
    res.json(references);
  } catch (err) {
    console.error('Error in getReferences:', err.message);
    console.error(err.stack);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

module.exports = {
  getReferences,
};