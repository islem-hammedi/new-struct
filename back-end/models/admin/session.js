
class Session {
    constructor({
      id_session,
      id_formation,
      id_formateur,
      id_theme,
      date_debut,
      date_fin,
      lieu,
      fiche_prg,
      cours_session,
      mode,
      duree,
      genre,
      etat,
      type_session,
      nb_participant,
    }) {
      this.id_session = id_session;
      this.date_debut = new Date(date_debut);
      this.date_fin = new Date(date_fin);
      this.lieu = lieu;
      this.genre = genre;
      this.id_formation = id_formation;
      this.id_formateur = id_formateur;
      this.id_theme = id_theme;
      this.fiche_prg = fiche_prg;
      this.cours_session = cours_session;
      this.mode = mode;
      this.duree = duree;
      this.etat = etat;
      this.type_session = type_session;
      this.nb_participant = nb_participant;
    }
  }
  
  module.exports = Session;
