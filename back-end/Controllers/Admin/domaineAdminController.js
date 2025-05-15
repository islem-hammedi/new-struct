const db = require('../../connect');  

{/*const getDomains = (req, res) => {
    const sql = 'SELECT DISTINCT domaine FROM formation;'

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erreur de récupération des données:', err);
            return res.status(500).send('Erreur de récupération des données');  // Renvoi d'un message d'erreur en texte brut
        }

        if (results.length > 0) {
            const data = results.map(row => row.domaine).join('\n');  
            res.type('text/plain').send(data); 
        } else {
            res.type('text/plain').send('Aucune donnée disponible !');  
        }
    });
};*/}

const domaineAdminService = require('../../services/admin/domaineAdminService');

const domaineAdminController = {
 getDomains: async (req, res) => {
  try {
    const domaines = await domaineAdminService.getAllDomaines();

    if (domaines.length > 0) {
      // Renvoie les données sous forme de JSON structuré
      res.status(200).json(domaines);
    } else {
      res.status(200).json([]); // Renvoie un tableau vide si aucune donnée
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
          themes: themes // Assurez-vous que c'est bien un tableau
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
