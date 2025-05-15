const CatalogueRepository = require('../../repositories/User/CatalogueUserRepository');

class CatalogueUserService {
    constructor() {
        this.catalogueRepository = new CatalogueRepository();
    }
    
    async getDomains() {
        return this.catalogueRepository.getDomains();
    }

    async getFormations() {
        console.log("Service method called"); // Debug log
        try {
            const results = await this.catalogueRepository.getFormations();
            console.log("Service results:", results.length); // Debug log
            return results;
        } catch (error) {
            console.error("Service Error Details:", error); // Detailed log
            throw error;
        }
    }

    async getSessions() {
        return this.catalogueRepository.getSessions();
    }

    async getFichePrg(id_fichePrg) {
        if (!id_fichePrg) {
            throw new Error('ID de fiche programme requis');
        }
        return this.catalogueRepository.getFichePrg(id_fichePrg);
    }

    async sendEmail(subject, body, email) {
        if (!subject || !body || !email) {
            throw new Error('Subject, body et email sont requis');
        }
        return this.catalogueRepository.sendEmail(subject, body, email);
    }

    async getFormateursByTheme(id_theme) {
        try {
            if (!id_theme) {
                throw new Error('ID du thème requis');
            }
            return await this.catalogueRepository.getFormateursByTheme(id_theme);
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CatalogueUserService;