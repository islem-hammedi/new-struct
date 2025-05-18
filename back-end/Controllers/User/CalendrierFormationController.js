const CalendrierUserService = require('../../services/User/CalendrierUserService');

class CalendrierUserController {
    constructor() {
        this.service = new CalendrierUserService();
    }

    async getCalendrier(req, res) {
        try {
            const calendrier = await this.service.getCalendrier();
            res.json(calendrier);
        } catch (error) {
            console.error("Controller Error - getCalendrier:", error);
            res.status(500).json({ error: "Erreur serveur" });
        }
    }

    async getDetailCalendrier(req, res) {
        try {
            const { id } = req.params;
            const details = await this.service.getDetailCalendrier(id);
            res.json(details);
        } catch (error) {
            console.error("Controller Error - getDetailCalendrier:", error);
            if (error.message === 'ID de session manquant') {
                res.status(400).json({ message: error.message });
            } else if (error.message === 'Session non trouvée') {
                res.status(404).json({ message: error.message });
            } else {
                res.status(500).json({ message: "Erreur serveur" });
            }
        }
    }
}

module.exports = CalendrierUserController;