{class Formateur {
    constructor({
      id_formateur,
      nom_complet,
      mail,
      adr,
      domaine_de_competences,
      tarif_journalier,
      nb_formations,
      tel,
      cv,
      mdp_formateur,
      niveau_etude,
      nb_experience,
      nomBanque,
      RIB,
      retour_sacConsulting,
      CIN,
      themes_a_enseigner,
   
    }) {
      this.id_formateur = id_formateur;
      this.nom_complet = nom_complet;
      this.mail = mail;
      this.themes_a_enseigner = typeof themes_a_enseigner === 'string' 
        ? JSON.parse(themes_a_enseigner) 
        : themes_a_enseigner;
        this.adr=adr;
        this.domaine_de_competences=domaine_de_competences;
        this.tarif_journalier=tarif_journalier;
        this.nb_formations=nb_formations;
        this.tel=tel;
        this.cv=cv;
        this.mdp_formateur=mdp_formateur;
        this.niveau_etude=niveau_etude;
        this.nb_experience=nb_experience;
        this.nomBanque=nomBanque;
        this.RIB=RIB;
        this.retour_sacConsulting=retour_sacConsulting;
        this.CIN=CIN;
        
    }
  }
  module.exports = Formateur;}