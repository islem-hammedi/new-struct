class candidature_formateur {
    constructor({
      nom_complet,
      mail,
      tel,
      domaines_competence,
      adr,
      cv,
    }) {
      this.nom_complet = nom_complet;
      this.mail = mail;
      this.adr = adr;
      this.tel = tel;
        this.domaines_competence = domaines_competence;
        this.cv = cv;

    }
  }
  
  module.exports = candidature_formateur;