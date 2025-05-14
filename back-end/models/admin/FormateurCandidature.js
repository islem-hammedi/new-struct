class FormateurCandidature {
    constructor(data) {
      // Identifiants
      this.id = data.id || null;
      
      // Informations personnelles
      this.nom = data.nom;
      this.telephone = data.telephone;
      this.email = data.email;
      
      // Compétences
      this.domaine = data.domaine;
      this.themes = data.themes;
      this.motivation = data.motivation;
      
      // Fichiers
      this.cv_path = data.cv_path || null;
      this.certificats_path = data.certificats_path || null;
      this.status = 'pending' ;
      
    }
  
    validate() {
      // Validation des champs obligatoires
      if (!this.nom) {
        throw new Error('Le nom complet est requis');
      }
  
      if (!this.telephone) {
        throw new Error('Le téléphone est requis');
      }
  
      if (!this.email) {
        throw new Error('L\'email est requis');
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
        throw new Error('L\'email n\'est pas valide');
      }
  
      if (!this.domaine) {
        throw new Error('Le domaine de compétence est requis');
      }
  
      if (!this.themes) {
        throw new Error('Les thèmes à enseigner sont requis');
      }
  
      if (!this.motivation) {
        throw new Error('La motivation est requise');
      }
  
      if (!this.cv_path) {
        throw new Error('Le CV est obligatoire');
      }
  
      // Validation des types
      if (this.cv_path && typeof this.cv_path !== 'string') {
        throw new Error('Le chemin du CV doit être une chaîne de caractères');
      }
  
      if (this.certificats_path && typeof this.certificats_path !== 'string') {
        throw new Error('Le chemin des certificats doit être une chaîne de caractères');
      }
    }
  
    toJSON() {
      return {
        id: this.id,
        nom: this.nom,
        telephone: this.telephone,
        email: this.email,
        domaine: this.domaine,
        themes: this.themes,
        motivation: this.motivation,
        cv_path: this.cv_path,
        certificats_path: this.certificats_path,
        created_at: this.created_at,
        status  :this.status 
      };
    }
  }
  
  module.exports = FormateurCandidature;