const ProfilFormateurUserService = require('../../services/user/profilFormateurUserService');

class ProfilFormateurUserController {
    constructor() {
        this.service = new ProfilFormateurUserService();
    }

    /*async getFormateurDetails(req, res) {
      try {
          // Extraction correcte de l'ID depuis les paramètres de route
          const { id_formateur } = req.params;
          
          if (!id_formateur) {
              return res.status(400).json({ error: 'ID formateur requis' });
          }
  
          const formateur = await this.service.getFormateurDetails(id_formateur);
          res.json(formateur);
  
      } catch (error) {
          console.error('Controller Error - getFormateurDetails:', error);
          
          if (error.message.includes('non trouvé')) {
              res.status(404).json({ error: error.message });
          } else {
              res.status(500).json({ error: 'Erreur serveur' });
          }
      }
  }

    async getFormationsARealiser(req, res) {
        try {
            const { id_formateur } = req.params.id;
            const sessions = await this.service.getFormationsARealiser(id_formateur);
            
            res.json(sessions);

        } catch (error) {
            console.error('Controller Error - getFormationsARealiser:', error);
            
            if (error.message.includes('Aucune formation')) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erreur serveur' });
            }
        }
    }

    async getHistoriqueFormations(req, res) {
        try {
            const { id_formateur } = req.params.id;
            const sessions = await this.service.getHistoriqueFormations(id_formateur);
            
            res.json(sessions);

        } catch (error) {
            console.error('Controller Error - getHistoriqueFormations:', error);
            
            if (error.message.includes('Aucune formation')) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erreur serveur' });
            }
        }
    }

    async updatePassword(req, res) {
        try {
            const { id_formateur } = req.params.id;
            const { old_password, new_password } = req.body;
            
            const result = await this.service.updatePassword(id_formateur, old_password, new_password);
            res.json(result);

        } catch (error) {
            console.error('Controller Error - updatePassword:', error);
            
            if (error.message.includes('incorrect')) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'Erreur serveur' });
            }
        }
    }*/

        async getProfile(req, res) {
            try {
                const { id_formateur } = req.params; // Assuming auth middleware adds user info
                const formateur = await this.service.getFormateurDetails(id_formateur);
                res.json(formateur);
            } catch (err) {
                console.error('FormateurController Error - getProfile:', err);
                res.status(err.message === 'Formateur not found' ? 404 : 500).json({
                    message: err.message || 'Error fetching formateur profile'
                });
            }
        }
    
        async getUpcomingSessions(req, res) {
            try {
                const { id_formateur } = req.params;
                const sessions = await this.service.getUpcomingSessions(id_formateur);
                res.json(sessions);
            } catch (err) {
                console.error('FormateurController Error - getUpcomingSessions:', err);
                res.status(500).json({ message: 'Error fetching upcoming sessions' });
            }
        }
    
        async getHistoricalSessions(req, res) {
            try {
                const { id_formateur } = req.params;
                const sessions = await this.service.getHistoricalSessions(id_formateur);
                res.json(sessions);
            } catch (err) {
                console.error('FormateurController Error - getHistoricalSessions:', err);
                res.status(500).json({ message: 'Error fetching historical sessions' });
            }
        }
    
        async changePassword(req, res) {
            try {
              const { id } = req.params;
              const { oldPassword, newPassword } = req.body;
          
              // Validation des entrées
              if (!oldPassword || !newPassword) {
                return res.status(400).json({ 
                  error: 'Ancien et nouveau mot de passe requis' 
                });
              }
          
              if (newPassword.length < 8) {
                return res.status(400).json({ 
                  error: 'Le mot de passe doit contenir au moins 8 caractères' 
                });
              }
          
              const updated = await this.service.updatePassword(
                id, 
                oldPassword, 
                newPassword
              );
          
              if (!updated) {
                return res.status(400).json({ 
                  error: 'Échec de la mise à jour du mot de passe' 
                });
              }
          
              res.json({ 
                success: true,
                message: 'Mot de passe mis à jour avec succès' 
              });
          
            } catch (err) {
              console.error('Controller Error:', err);
              
              const status = err.message.includes('incorrect') ? 400 : 500;
              res.status(status).json({ 
                error: err.message || 'Erreur serveur' 
              });
            }
          }
        async getEvents(req, res) {
            try {
              const events = await this.service.getEvents();
              res.status(200).json(events);
            } catch (error) {
              console.error('Controller Error - getEvents:', error);
              res.status(500).json({ error: error.message });
            }
          }
        
          async createEvent(req, res) {
            try {
              const { event, date, created_by } = req.body;
              
              if (!event || !date || !created_by) {
                return res.status(400).json({ error: 'Title, date and created_by are required' });
              }
        
              const newEvent = await this.service.createEvent({ event, date, created_by });
              res.status(201).json(newEvent);
            } catch (error) {
              console.error('Controller Error - createEvent:', error);
              res.status(500).json({ error: error.message });
            }
          }
        
         // Controller
// Controller
async deleteEvent(req, res) {
  try {
    // Extraction CORRECTE de id_event
    const id_event = req.params.id_event;

    if (!id_event) {
      return res.status(400).json({ error: 'ID manquant' });
    }

    if (!req.user?.nom_complet) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const success = await this.service.deleteEvent(
      id_event,
      req.user.nom_complet
    );

    if (!success) {
      return res.status(404).json({ error: 'Événement non trouvé ou non autorisé' });
    }

    res.status(200).json({ message: 'Événement supprimé' });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: error.message });
  }

}
        
    async sendModificationRequest(req, res) {
      try {
          const requestData = {
              ...req.body,
              fichiers: req.files?.fichiers
          };
          
          const result = await this.service.sendModificationRequest(requestData);
          res.status(200).json(result);

      } catch (error) {
          console.error('Controller Error - sendModificationRequest:', error);
          
          const statusCode = error.statusCode || 500;
          res.status(statusCode).json({
              success: false,
              error: error.message,
              details: process.env.NODE_ENV === 'development' ? error.stack : undefined
          });
      }
  }
  async handleModificationResponse(req, res) {
    try {
        const { token, decision, email } = req.query;
        
        const result = await this.service.handleModificationResponse(token, decision, email);

        res.send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: ${decision === 'accept' ? 'green' : 'red'}">
                        Demande ${decision === 'accept' ? 'acceptée' : 'rejetée'} avec succès
                    </h1>
                    <p>Une notification a été envoyée au formateur.</p>
                </body>
            </html>
        `);

    } catch (error) {
        console.error('Controller Error - handleModificationResponse:', error);
        
        const statusCode = error.statusCode || 500;
        res.status(statusCode).send(`
            <html>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: red">Erreur</h1>
                    <p>${error.message}</p>
                </body>
            </html>
        `);
    }
}
}

module.exports = ProfilFormateurUserController;