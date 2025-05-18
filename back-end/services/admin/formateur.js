const FormateurRepository = require('../../repositories/admin/formateur');

class FormateurService {
  async getAllFormateurs() {
    try {
      const formateurs = await FormateurRepository.getAllFormateurs();
      const formateursWithDetails = await Promise.all(
        formateurs.map(async (formateur) => {
          const fichePrg = await FormateurRepository.getFichePrgByFormateurId(formateur.id_formateur);
          const coursSession = await FormateurRepository.getCoursSessionByFormateurId(formateur.id_formateur);
          return { ...formateur, fichePrg, coursSession };
        })
      );
      return formateursWithDetails;
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async getFormateurById(idFormateur) {
    try {
      const formateur = await FormateurRepository.getFormateurById(idFormateur);
      if (formateur.length === 0) {
        throw new Error('Formateur not found');
      }
      const fichePrg = await FormateurRepository.getFichePrgByFormateurId(idFormateur);
      const coursSession = await FormateurRepository.getCoursSessionByFormateurId(idFormateur);
      return { ...formateur[0], fichePrg, coursSession };
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async updateFormateur(id, updates, cv) {
    // Récupérer le formateur actuel pour vérifier l'existence et le CV actuel
    const currentFormateur = await FormateurRepository.getFormateurById(id);
    if (currentFormateur.length === 0) {
      throw new Error('Formateur non trouvé');
    }

    // Si aucun CV n'est fourni lors de la mise à jour, garder l'ancien CV
    if (!cv) {
      cv = currentFormateur[0].cv;
    } else {
      updates.cv = cv; // Ajoute le nouveau CV si présent
    }

    // Liste des seuls champs valides pour la table `formateur`
    const validFields = [
      'nom_complet', 'mail', 'adr', 'domaine_de_competences',
      'themes_a_enseigner', 'tarif_journalier', 'nb_formations',
      'tel', 'cv', 'mdp_formateur', 'niveau_etude',
      'nb_experience', 'horraire_jour', 'nom_banque',
      'RIB', 'domaine_assistance', 'retour_sacConsulting'
    ];

    updates = Object.keys(updates)
      .filter((key) => validFields.includes(key) && updates[key] !== undefined)
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(', ');

    if (!fields) {
      throw new Error('Aucun champ valide à mettre à jour');
    }

    const values = Object.values(updates);
    await FormateurRepository.updateFormateur(fields, values, id);

    return { message: 'Formateur mis à jour avec succès' };
  }

  async deleteFormateur(id) {
    const formateur = await FormateurRepository.getFormateurById(id);
    if (formateur.length === 0) {
      throw new Error('Formateur non trouvé');
    }

    if (formateur[0].cv) {
      const cvPath = path.join(__dirname, '../..', 'uploads', formateur[0].cv);
      fs.unlink(cvPath, (err) => {
        if (err) console.error("Erreur de suppression du CV:", err);
      });
    }

    await FormateurRepository.deleteFormateur(id);
    return { message: 'Formateur et fichiers associés supprimés avec succès' };
  }

  async addFormateur(data, cv, hashedPassword) {
    const insertData = [
      data.nom_complet, data.mail, data.adr, data.domaine_de_competences, data.themes_a_enseigner,
      data.tarif_journalier, data.nb_formations, data.tel, cv, hashedPassword, data.niveau_etude,
      data.nb_experience, data.horraire_jour, data.nom_banque, data.RIB, data.domaine_assistance,
      data.retour_sacConsulting,
    ];

    const result = await FormateurRepository.addFormateur(insertData);
    return { message: 'Formateur ajouté avec succès', id: result.insertId };
  }

  async getDomaineThemes() {
    const results = await FormateurRepository.getDomaineThemes();
    const domainesThemes = results.reduce((acc, item) => {
      if (!acc[item.domaine]) {
        acc[item.domaine] = [];
      }
      acc[item.domaine].push(item.theme);
      return acc;
    }, {});

    return domainesThemes;
  }}
module.exports = new FormateurService();