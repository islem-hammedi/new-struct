class participant {
    constructor({
      id_participant,
      nom_complet,
      mail,
      pwd,
      telephone,
      adresse,
      badge,
      CIN,
      id_entreprise,
      direction_servie,
    }) {
      this.id_participant = id_participant;
      this.nom_complet = nom_complet;
      this.mail = mail;
      this.CIN = CIN;
      this.pwd = pwd;
      this.telephone = telephone;
      this.adresse = adresse;
      this.badge = badge;
      this.direction_servie = direction_servie;

      this.id_entreprise = id_entreprise;
    }
  }
  
  module.exports = participant;