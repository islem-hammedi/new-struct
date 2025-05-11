
class seance {
    constructor({
      id_seance,
      id_session,
      pause_debut,
      pause_fin,
      heure_debut,
      heure_fin,
     
    }) {
      this.id_session = id_session;
      this.pause_debut = new Date(pause_debut);
      this.pause_fin = new Date(pause_fin);
      this.heure_debut = heure_debut;
      this.id_seance = id_seance;
      this.heure_fin = heure_fin;
    }
  }
  
  module.exports = seance;