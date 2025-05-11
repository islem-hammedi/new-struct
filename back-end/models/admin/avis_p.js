class Avis {
  constructor(data) {
    this.id_avis = data.id_avis;
    this.id_session = data.id_session;
    this.id_participant = data.id_participant;
    this.commentaire = data.commentaire;
    this.note = data.note;
    this.date_creation = data.date_creation;
    this.adaptation_programme_vie_pro = this.convertEvaluationToNote(data.adaptation_programme_vie_pro);
    this.moyens_pedagogiques_utilises =  this.convertEvaluationToNote(data.moyens_pedagogiques_utilises);
    this.convenance_horaires_formation =  this.convertEvaluationToNote(data.convenance_horaires_formation);
    this.apports_niveau_professionnel =  this.convertEvaluationToNote(data.apports_niveau_professionnel);
    this.qualite_documentation_distribuee =  this.convertEvaluationToNote(data.qualite_documentation_distribuee);
    this.maitrise_globale_sujets_presentes =  this.convertEvaluationToNote(data.maitrise_globale_sujets_presentes);
    this.traitement_exemples_travail =  this.convertEvaluationToNote(data.traitement_exemples_travail);
    this.animations_seances =  this.convertEvaluationToNote(data.animations_seances);
    this.homogeneite_groupe =  this.convertEvaluationToNote(data.homogeneite_groupe);
    this.satisfaction_attentes =  this.convertEvaluationToNote(data.satisfaction_attentes);
    this.duree_formation = data.duree_formation;
    this.nom_complet = data.nom_complet;
    this.nature_participant = data.nature_participant;
    this.nom_entreprise = data.nom_entreprise;
  }
  convertEvaluationToNote(evaluation) {
    switch(evaluation) {
      case 'Insuffisant': return 1;
      case 'Peu satisfaisant': return 2;
      case 'Satisfaisant': return 3;
      case 'Très satisfaisant': return 4;
      case 'Excellent': return 5;
      default: return 0;
    }
  }

  convertEvaluationDureeToNote(evaluation) {
    switch(evaluation) {
      case 'Courte': return 1;
      case 'Longue': return 2;
      case 'Convenable': return 3;
      default: return 0;
    }
  }
}

module.exports = Avis;