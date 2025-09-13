


const bcrypt = require('bcrypt');
const FormateurService = require('../../services/admin/formateur');

const getFormateurs = async (req, res) => {
  try {
    const formateurs = await FormateurService.getAllFormateurs();
    return res.json(formateurs);
  } catch (err) {
    console.error("Error fetching formateurs:", err);
    return res.status(500).json({ error: err.message });
  }
};

const getFormateurById = async (req, res) => {
  const { id } = req.params;
  try {
    const formateur = await FormateurService.getFormateurById(id);
    return res.json(formateur);
  } catch (err) {
    console.error("Error fetching formateur:", err);
    if (err.message === 'Formateur not found') {
      return res.status(404).json({ message: err.message });
    }
    return res.status(500).json({ error: err.message });
  }
};

const updateFormateur = async (req, res) => {
  const id = req.params.id;
  const updates = req.body; 
  let cv = null;

  if (req.files?.cv) {
    cv = req.files.cv[0].filename;
  }

  try {
    const result = await FormateurService.updateFormateur(id, updates, cv);
    res.json(result);
    console.log('updates',updates);
  } catch (err) {
    console.error('Erreur lors de la mise à jour du formateur:', err);
    res.status(500).json({ error: err.message });
  }
};

const deleteFormateur = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await FormateurService.deleteFormateur(id);
    res.json(result);
  } catch (err) {
    console.error('Erreur lors de la suppression du formateur:', err);
    res.status(500).json({ error: err.message });
  }
};

const addFormateur = async (req, res) => {
  const data = req.body;
  const cv = req.files?.cv ? req.files.cv[0].filename : undefined;

  if (!data.nom_complet || !data.mail || !data.mdp_formateur) {
    return res
      .status(400)
      .json({ error: "Les champs 'nom_complet', 'mail' et 'mdp_formateur' sont obligatoires." });
  }

  try {
    const hashedPassword = await bcrypt.hash(data.mdp_formateur, 10);
    const result = await FormateurService.addFormateur(data, cv, hashedPassword);
    res.status(201).json(result);
  } catch (err) {
    console.error('Erreur lors de l\'ajout du formateur:', err);
    res.status(500).json({ error: err.message });
  }
};

const getDomaineThemes = async (req, res) => {
  try {
    const domainesThemes = await FormateurService.getDomaineThemes();
    res.json(domainesThemes);
  } catch (err) {
    console.error('Erreur lors de la récupération des domaines et thèmes:', err);
    res.status(500).send('Erreur lors de la récupération des domaines et thèmes');
  }
};


module.exports = {
  getFormateurs,
  getFormateurById,getDomaineThemes,addFormateur,updateFormateur,deleteFormateur
};