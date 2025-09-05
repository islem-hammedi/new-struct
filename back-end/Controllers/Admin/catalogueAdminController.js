


const db = require('../../connect');
const CatalogueService = require('../../services/admin/catalogue');

const getCatalogue = async (req, res) => {
  try {
    const catalogues = await CatalogueService.getCatalogue();
    res.json(catalogues);
  } catch (error) {
    console.error("Error fetching catalogue:", error);
    res.status(500).json({ error: error.message });
  }
};

const getFormateursBySession = async (req, res) => {
  const { id_theme } = req.params;

  try {
    const result = await CatalogueService.getFormateursBySession(id_theme);
    res.json(result);
  } catch (error) {
    console.error("Error fetching formateurs by session:", error);
    res.status(500).json({ 
      success: false,
      error: error.message,
    });
  }
};

const addThemeToDomain = async (req, res) => {
  const { domaineName, abbreviation, themes } = req.body;
  try {
    const result = await CatalogueService.addThemeToDomain(domaineName, abbreviation, themes);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding theme to domain:", error);
    res.status(500).json({
      error: error.message,
      details: error.stack,
    });
  }};

const deleteDomain = async (req, res) => {
  const { id_formation } = req.params;
  try {
    const result = await CatalogueService.deleteDomain(id_formation);
    res.json(result);
  } catch (error) {
    console.error("Error deleting domain:", error);
    res.status(500).json({ error: error.message });
  }
};

const deleteTheme = async (req, res) => {
  const { id_domaine, id_theme } = req.params;
  try {
    const result = await CatalogueService.deleteTheme(id_domaine, id_theme);
    res.json(result);
  } catch (error) {
    console.error("Error deleting theme:", error);
    res.status(500).json({ error: error.message });
  }
};




const updateTheme = async (req, res) => {
  try {
    const { id_theme } = req.params;
    const { formateursToAdd, formateursToRemove } = req.body;

    const result = await CatalogueService.updateTheme(id_theme, formateursToAdd, formateursToRemove);
    res.json(result);
  } catch (error) {
    console.error("Erreur backend complète:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Erreur serveur lors de la mise à jour"
    });
  }
};

module.exports = {
  getCatalogue,
  getFormateursBySession,
  addThemeToDomain,
  deleteDomain,
  deleteTheme,
  updateTheme,
};