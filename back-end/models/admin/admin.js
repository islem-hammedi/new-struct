class admin {
    constructor(id_admin,nom_admin,email_admin,mdp_admin,telephone,poste,id_acces) {
      this.id_admin = id_admin;
      this.nom_admin = nom_admin;
      this.email_admin = email_admin;
      this.mdp_admin = mdp_admin;
      this.telephone = telephone;
      this.poste = poste;
      this.id_acces = id_acces;

    }
  }
  
  module.exports = admin;