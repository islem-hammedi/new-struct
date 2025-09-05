
const DemanderFormationAdminService = require('../../services/admin/demandeFormationPersonalisee');

const getAllDemandesWithParticipants = async (req, res) => {
    try {
        const demandes = await DemanderFormationAdminService.getAllDemandesWithParticipants();
        res.status(200).json(demandes);
    } catch (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des demandes." });
    }
};

module.exports = {
    getAllDemandesWithParticipants
};