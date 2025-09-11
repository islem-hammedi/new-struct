const db = require('../../connect');  


const domaineAdminService = require('../../services/admin/domaineAdminService');

const domaineAdminController = {
 getDomains: async (req, res) => {
  try {
    const domaines = await domaineAdminService.getAllDomaines();

    if (domaines.length > 0) {
      res.status(200).json(domaines);
    } else {
      res.status(200).json([]); 
    }
  } catch (error) {
    console.error('Erreur de récupération des données:', error);
    res.status(500).json({ message: 'Erreur de récupération des données' });
  }
},

getThemesByDomaine: async (req, res) => {
  try {
      const id_domaine = req.query.id_domaine;
      
      if (!id_domaine) {
          return res.status(400).json({ 
              success: false,
              message: 'Le paramètre id_domaine est requis'
          });
      }

      const themes = await domaineAdminService.getThemesByDomaine(id_domaine);
      
      res.json({
          success: true,
          themes: themes 
      });
      
  } catch (error) {
      console.error('Erreur:', error);
      res.status(500).json({ 
          success: false,
          error: error.message || 'Erreur serveur'
      });
  }
}
};


module.exports = domaineAdminController;
