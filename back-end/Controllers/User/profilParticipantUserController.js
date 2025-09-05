const ProfilParticipantUserService = require('../../services/user/profilParticipantUserService');

class ProfilParticipantUserController {
    constructor() {
        this.service = new ProfilParticipantUserService();
    }

    async getParticipantProfile(req, res) {
        try {
            const id_participant = req.params.id;
            console.log(`Tentative de récupération du participant ${id_participant}`); // Debug
            
            if (!id_participant || isNaN(id_participant)) {
                return res.status(400).json({ 
                    error: "ID participant invalide",
                    received: id_participant
                });
            }
    
            const profile = await this.service.getParticipantProfile(id_participant);
            
            if (!profile) {
                return res.status(404).json({ 
                    message: "Participant non trouvé",
                    id: id_participant
                });
            }
    
            res.status(200).json(profile);
        } catch (error) {
            console.error("Erreur détaillée dans le controller:", {
                error: error,
                params: req.params,
                stack: error.stack
            });
            
            if (error.message === 'Participant non trouvé') {
                res.status(404).json({ 
                    message: error.message,
                    id: req.params.id
                });
            } else {
                res.status(500).json({ 
                    error: "Erreur serveur",
                    details: error.message
                });
            }
        }
    }
    async updateParticipantProfile(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
    
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({
                    success: false,
                    message: 'ID participant invalide'
                });
            }
    
            const result = await this.service.updateParticipantProfile(id, updateData);
    
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Participant non trouvé'
                });
            }
    
            return res.json({
                success: true,
                message: result.message
            });
        } catch (error) {
            console.error('Controller Error:', error);
            
            const status = error.message.includes('Validation error') ? 400 : 500;
            return res.status(status).json({
                success: false,
                message: error.message
            });
        }
    } 
}

module.exports = ProfilParticipantUserController;