const domaineAdminRepository = require('../../repositories/admin/domaineAdminRepository');

class DomaineAdminService {
    async getAllDomaines() {
        try {
            const results = await domaineAdminRepository.getAllDomaines();
            return results.map(row => row.domaine);
        } catch (error) {
            throw error;
        }
    }

    async getThemesByDomaine(id_domaine) {  // Renommez le paramètre
        try {
            if (!id_domaine) {
                throw new Error('Paramètre "id_domaine" manquant');
            }
    
            // Convertir en nombre si nécessaire
            const id = Number(id_domaine) || id_domaine;
            
            const results = await domaineAdminRepository.getThemesByDomaine(id);
            return results.map(row => row.theme);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new DomaineAdminService();