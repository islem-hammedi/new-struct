const AddReferenceRepository = require('../../repositories/admin/addReferenceRepository');
const path = require('path');
const fs = require('fs');

class AddReferenceService {
    constructor() {
        this.repository = new AddReferenceRepository();
    }

    async addReference(nom, lien, logoFile,secteur) {
        try {
            if (!nom || !lien || !secteur) {
                throw new Error('Le nom, le secteur et le lien sont obligatoires');
            }

            let logoPath = 'default_logo.png';

            // Gestion du fichier logo
            if (logoFile) {
                console.log('Fichier reçu dans le service:', logoFile);
                
                const uploadsDir = path.join(__dirname, '../../../uploads/references');
                
                // Créer le dossier s'il n'existe pas
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }

                const fileExtension = path.extname(logoFile.originalname);
                const fileName = `ref_${Date.now()}${fileExtension}`;
                logoPath = `uploads/references/${fileName}`;

                // Chemin complet pour sauvegarder
                const fullPath = path.join(__dirname, '../../../', logoPath);
                
                // Vérifier le type de stockage et sauvegarder accordingly
                if (logoFile.buffer) {
                    // Multer memoryStorage
                    fs.writeFileSync(fullPath, logoFile.buffer);
                } else if (logoFile.path) {
                    // Multer diskStorage - copier le fichier
                    fs.copyFileSync(logoFile.path, fullPath);
                } else {
                    console.log('⚠️ Format de fichier non reconnu, utilisation valeur par défaut');
                    logoPath = 'default_logo.png';
                }
                
                console.log('✅ Fichier sauvegardé:', fullPath);
            }

            // Créer la référence dans la base de données
            const reference = await this.repository.createReference(nom, lien, logoPath,secteur);

            return {
                success: true,
                reference: reference
            };

        } catch (error) {
            console.error('Error in addReferenceService:', error);
            throw error;
        }
    }
}

module.exports = AddReferenceService;