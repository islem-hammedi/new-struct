const FormateurCandidatureService = require('../../services/user/FormateurCandidatureService');
const path = require('path');

class FormateurCandidatureController {
    constructor() {
        this.service = new FormateurCandidatureService();
    }

    async submitCandidature(req, res) {
        try {
            const { body, files } = req;
            
            if (!files || !files.cv || !files.cv[0]) {
                return res.status(400).json({
                    success: false,
                    message: 'Le fichier CV est obligatoire'
                });
            }

            const data = {
                nom: body.nom,
                telephone: body.telephone,
                email: body.email,
                domaine: body.domaine,
                themes: body.themes,
                motivation: body.motivation,
                cv_path: files.cv[0].filename      };

            const submitCandidature = await this.service.submitCandidature(data);
            
            res.status(201).json({
                success: true,
                message: 'Candidature enregistrée avec succès',
                data: submitCandidature
            });

        } catch (error) {
            console.error('Controller Error - createCandidature:', error);
                        
            if (error.message.includes('obligatoires')) {
                res.status(400).json({
                    success: false,
                    message: error.message
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la création de la candidature'
                });
            }
        }
    }









   async getDemandes(req, res) {
        try {
            console.log('Début de getDemandes');
            
            const demandes = await this.service.getAllCandidatures();
            console.log('Demandes récupérées:', demandes);
            
            if (!demandes || demandes.length === 0) {
                console.warn('Aucune demande trouvée');
                return res.status(404).json({ 
                    success: false,
                    message: 'Aucune demande trouvée' 
                });
            }
            
            res.status(200).json({
                success: true,
                data: demandes,
                count: demandes.length
            });
            
        } catch (error) {
            console.error('Erreur dans getDemandes:', error);
            res.status(500).json({ 
                success: false,
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }
}
module.exports = FormateurCandidatureController;