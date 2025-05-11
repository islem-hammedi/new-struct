class DemandeFormation {
    constructor({
      id_demande,
      id_participant,
      theme,
      formateur,
      niveau,
      mode,
      domaine,
      nombreParticipants,
      description,
      genre,
      createdAt
    }) {
      this.id_demande = id_demande;
      this.id_participant = id_participant;
      this.formateur = formateur;
      this.niveau = niveau;
      this.domaine = domaine;
      this.theme = theme;
      this.mode = mode;
      this.nombreParticipants = nombreParticipants;
      this.description = description;
      this.	genre = 	genre;
      this.	createdAt = 	createdAt;
    }
  }
  
  module.exports = DemandeFormation;