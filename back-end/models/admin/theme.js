class Theme {
    constructor({
      id_theme,
      nom_theme,
      code,
      id_domaine,
    }) {
      this.id_theme = id_theme;
      this.nom_theme = nom_theme;
      this.code = code;
      this.id_domaine = id_domaine;
    }
  }
  
  module.exports = Theme;