const CalendrierUserRepository = require('../../repositories/user/CalendrierUserRepository');

class CalendrierUserService {
    constructor() {
        this.repository = new CalendrierUserRepository();
    }

    async getCalendrier() {
        try {
            return await this.repository.getCalendrier();
        } catch (error) {
            console.error("Service Error - getCalendrier:", error);
            throw error;
        }
    }

    async getDetailCalendrier(id) {
        try {
            if (!id) {
                throw new Error('ID de session manquant');
            }
            return await this.repository.getDetailCalendrier(id);
        } catch (error) {
            console.error("Service Error - getDetailCalendrier:", error);
            throw error;
        }
    }
}

module.exports = CalendrierUserService;