{/*const db = require('../../connect');

const DemanderFormation = async(req, res) => {
  
  const { domaine, theme, formateur, niveau, genreFormation, nombreParticipants,description, user_info} = req.body;
  const id_participant = user_info?.id_participant; 
  
  if (!domaine || !theme) {
    return res.status(400).json({ message: 'Les champs obligatoires sont manquants.' });
  }
  const query = `INSERT INTO demande_de_formation_personnalisee (domaine, theme, formateur, niveau, nombreParticipants, description, genre ,id_participant) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(query, [domaine, theme, formateur, niveau, nombreParticipants, description ,genreFormation ,id_participant], (err, result) => {
    if (err) {
      console.error('Erreur lors de l\'insertion dans la base de données: ', err);
      return res.status(500).json({ message: 'Erreur du serveur lors de l\'insertion.' });
    }
    return res.status(200).json({ message: 'Demande de formation enregistrée avec succès.' });
  });
};

module.exports = {
  DemanderFormation
};*/}




const DemandeFormationUserService = require('../../services/user/demandeFormationUserService');

class DemandeFormationUserController {
    constructor() {
        this.service = new DemandeFormationUserService();
    }

    async createDemandeFormation(req, res) {
        try {
            const demandeData = req.body;
            const demandeCree = await this.service.createDemandeFormation(demandeData);
            res.status(201).json({
                success: true,
                message: 'Demande de formation enregistrée avec succès',
                data: demandeCree
            });

        } catch (error) {
            console.error('Controller Error - createDemandeFormation:', error);
            
            if (error.message.includes('obligatoires')) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la création de la demande de formation'
                });
            }
        }
    }
}

module.exports = DemandeFormationUserController;