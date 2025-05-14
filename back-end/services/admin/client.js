const clientRepository = require('../../repositories/admin/client');

const getClientsPersonnes = async () => {
  return await clientRepository.getClientsPersonnes();
};

const getClientsEntreprises = async () => {
  return await clientRepository.getClientsEntreprises();
};

const getParticipantsByEntreprise = async (entrepriseName) => {
  return await clientRepository.getParticipantsByEntreprise(entrepriseName);
};

const badgeParticipant = async (id_participant, badge) => {
  // Validation du badge
  if (badge !== 'normal' && badge !== 'special') {
    throw new Error("Le badge doit être soit 'normal' soit 'special'");
  }

  const result = await clientRepository.updateBadgeParticipant(id_participant, badge);

  if (result.affectedRows === 0) {
    throw new Error("Participant non trouvé");
  }

  return {
    success: true,
    message: "Badge mis à jour avec succès",
    data: { id_participant, badge }
  };
};

module.exports = {
  getClientsPersonnes,
  getClientsEntreprises,
  getParticipantsByEntreprise,
  badgeParticipant
};