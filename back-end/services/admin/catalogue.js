const CatalogueRepository = require('../../repositories/admin/catalogue');

class CatalogueService {
 static async getCatalogue() {
    const results = await CatalogueRepository.fetchCatalogue();
    const domainesMap = new Map();

    results.forEach((row) => {
      if (!domainesMap.has(row.id_formation)) {
        domainesMap.set(row.id_formation, {
          id_formation: row.id_formation,
          domaine: row.domaine,
          sessions: [],
        });
      }

      const catalogue = domainesMap.get(row.id_formation);
      if (row.id_theme) {
        let session = catalogue.sessions.find((s) => s.id_theme === row.id_theme);

        if (!session) {
          session = {
            id_theme: row.id_theme,
            theme: row.theme,
            code: row.code,
            formateurs: [],
          };
          catalogue.sessions.push(session);
        }

        if (row.id_formateur) {
          try {
            const themesFormateur = row.themes_a_enseigner
              ? JSON.parse(row.themes_a_enseigner)
              : {};

            if (themesFormateur[row.theme]) {
              const formateur = {
                id_formateur: row.id_formateur,
                nom_complet: row.nom_complet,
                mail: row.mail,
                adr: row.adr,
                domaine_de_competences: row.domaine_de_competences,
                themes_a_enseigner: themesFormateur,
                tarif_journalier: row.tarif_journalier,
                tel: row.tel,
                cv: row.cv,
                niveau_etude: row.niveau_etude,
                nb_experience: row.nb_experience,
                rang: themesFormateur[row.theme],
              };

              if (!session.formateurs.some((f) => f.id_formateur === row.id_formateur)) {
                session.formateurs.push(formateur);
                session.formateurs.sort((a, b) => a.rang - b.rang);
              }
            }
          } catch (e) {
            console.error("Error parsing themes_a_enseigner:", e);
          }
        }
      }
    });

    return Array.from(domainesMap.values());
  }

  static async getFormateursBySession(id_theme) {
    const sessionResults = await CatalogueRepository.fetchThemeById(id_theme);
    if (!sessionResults || sessionResults.length === 0) {
      throw new Error(`Aucune theme trouvée pour l'ID ${id_theme}`);
    }

    const sessionTheme = sessionResults[0].theme;
    const formateurs = await CatalogueRepository.fetchFormateursByTheme(sessionTheme);

    const result = formateurs.map((formateur) => {
      let rang = 1;
      try {
        const themes = JSON.parse(formateur.themes_a_enseigner);
        rang = themes[sessionTheme];
      } catch (e) {
        console.error("Erreur parsing themes_a_enseigner:", e);
      }

      return {
        id_formateur: formateur.id_formateur,
        nom_complet: formateur.nom_complet,
        rang: rang,
      };
    });

    return {
      success: true,
      id_theme: parseInt(id_theme, 10),
      theme: sessionTheme,
      formateurs: result,
    };
  }


 static async addThemeToDomain(domaineName, abbreviation, themes) {
    return await CatalogueRepository.addThemeToDomain(domaineName, abbreviation, themes);
  }

  static async deleteDomain(id_formation) {
    return await CatalogueRepository.deleteDomain(id_formation);
  }

  static async deleteTheme(id_domaine, id_theme) {
    return await CatalogueRepository.deleteTheme(id_domaine, id_theme);
  }

  static async updateTheme(id_theme, formateursToAdd, formateursToRemove) {
    return await CatalogueRepository.updateTheme(id_theme, formateursToAdd, formateursToRemove);
  }
}

module.exports = CatalogueService;