class Entreprise {
    constructor({
      id_entreprise,
      nom_entreprise,
      tel_entreprise,
      email_entreprise,
      adr_entreprise,
      matricule
    }) {
      this.id_entreprise = id_entreprise;
      this.nom_entreprise = nom_entreprise;
      this.tel_entreprise = tel_entreprise;
      this.email_entreprise = email_entreprise;
      this.adr_entreprise = adr_entreprise;
      this.matricule = matricule;
    }
  }
  
  module.exports = Entreprise;