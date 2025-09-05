

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