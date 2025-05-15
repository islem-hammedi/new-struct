const CatalogueService = require('../../services/User/CatalogueUserService');

class CatalogueUserController {
  constructor() {
    this.catalogueService = new CatalogueService();
}

    async getDomains(req, res) {
        try {
            const domains = await this.catalogueService.getDomains();
            if (domains.length > 0) {
                const data = domains.map(domain => domain.nom_domaine).join('\n');
                return res.type('text/plain').send(data);
            }
            return res.type('text/plain').send('Aucune donnée disponible !');
        } catch (error) {
            console.error('Erreur de récupération des données:', error);
            return res.status(500).send('Erreur de récupération des données');
        }
    }

    async getFormation(req, res) {
        try {
            const formations = await this.catalogueService.getFormations();
            return res.json(formations);
        } catch (error) {
            console.error("Error fetching formations:", error);
            return res.status(500).json({ error: error.message });
        }
    }

    async getSession(req, res) {
        try {
            const sessions = await this.catalogueService.getSessions();
            return res.json(sessions);
        } catch (error) {
            console.error('Erreur lors de la récupération des sessions: ', error);
            return res.status(500).json({ message: 'Erreur lors de la récupération des sessions' });
        }
    }

    async getfichePrg(req, res) {
        try {
            const { id_fichePrg } = req.params;
            const fiche = await this.catalogueService.getFichePrg(id_fichePrg);
            return res.json(fiche);
        } catch (error) {
            console.error("Erreur lors de la récupération de la fiche programme:", error);
            if (error.message === "Fiche programme non trouvée") {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ message: "Erreur serveur" });
        }
    }

    async sendMail(req, res) {
        try {
            const { subject, body, email } = req.body;
            console.log("Données reçues : ", req.body);

            await this.catalogueService.sendEmail(subject, body, email);
            console.log("Email envoyé avec succès.");
            return res.status(200).send('Email envoyé avec succès');
        } catch (error) {
            console.error("Erreur lors de l'envoi de l'email:", error);
            if (error.message === 'Subject, body et email sont requis') {
                return res.status(400).send(error.message);
            }
            return res.status(500).send('Erreur lors de l\'envoi de l\'email: ' + error.toString());
        }
    }

    async getFormateursByTheme(req, res) {
        try {
            const { id_theme } = req.params;
            const formateurs = await this.catalogueService.getFormateursByTheme(id_theme);
            res.json(formateurs);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = CatalogueUserController;