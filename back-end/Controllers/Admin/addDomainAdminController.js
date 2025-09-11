
    const domainService = require('../../services/admin/addDomainService');

    class DomainController {
      async addDomain(req, res) {
        try {
          const { domaineName, abbreviation, themes } = req.body;
          
          if (!domaineName || !themes || !Array.isArray(themes)) {
            return res.status(400).json({ 
              error: 'Données invalides: domaineName et themes (array) sont obligatoires' 
            });
          }
    
          const result = await domainService.addDomain({
            domaineName,
            abbreviation,
            themes
          });
    
          res.status(201).json({
            message: 'Domaine et thèmes créés avec succès',
            id_domaine: result.id_domaine,
            themes: result.themes
          });
        } catch (error) {
          console.error("Erreur dans addDomain:", error);
          res.status(500).json({ 
            error: 'Erreur lors de la création',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }
      }
    }
    
    module.exports = new DomainController();