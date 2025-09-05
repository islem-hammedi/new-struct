const AddReferenceService = require('../../services/admin/addReferenceService');

class AddReferenceController {
    constructor() {
        this.service = new AddReferenceService();
    }
    async addReference(req, res) {
        try {
            const { nom, lien, secteur } = req.body;
            const logoFile = req.file;

            console.log('=== DEBUG CONTROLLER ===');
            console.log('Nom:', nom);
            console.log('Lien:', lien);
            console.log('Secteur:', secteur);
            console.log('File received:', !!logoFile);

            if (!nom || !lien || !secteur) {
                return res.status(400).json({
                    success: false,
                    message: 'Le nom, le lien et le secteur sont obligatoires'
                });
            }

            if (nom === undefined || lien === undefined || secteur === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Données manquantes dans la requête'
                });
            }

            const result = await this.service.addReference(nom, lien, logoFile, secteur);

            res.status(201).json({
                success: true,
                message: 'Référence ajoutée avec succès',
                data: result.reference
            });

        } catch (error) {
            console.error('❌ Error in addReferenceController:', error);
            if (error.message.includes('obligatoires')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            
            const statusCode = error.message.includes('existe déjà') ? 409 : 500;
            
            res.status(statusCode).json({
                success: false,
                message: error.message || 'Erreur lors de l\'ajout de la référence'
            });
        }
    }
}

module.exports = AddReferenceController;