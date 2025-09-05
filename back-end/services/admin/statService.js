const statsRepository = require('../../repositories/admin/statCartRepository');
class StatsService {
  async getAdminStats() {
    try {
      return await statsRepository.getAdminStats();
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw error;
    }
  }
 async getSessionEvaluations(filters = {}) {
    const sessions = await statsRepository.getSessionsWithAvis(filters);
    
    return sessions.map(session => {
      const evaluations = session.avis || [];
      const noteMoyenne = evaluations.length > 0 
        ? evaluations.reduce((sum, a) => sum + a.note, 0) / evaluations.length
        : 0;

      return {
        sessionId: session.id_session,
        sessionLabel: this.formatSessionLabel(session),
        noteMoyenne: parseFloat(noteMoyenne.toFixed(2)),
        nbAvis: evaluations.length,
        criteres: this.calculateCriteriaAverages(evaluations),
        sessionDetails: {
          date_debut: session.date_debut,
          date_fin: session.date_fin,
          formateur: session.id_formateur,
          theme: session.id_theme
        }
      };
    });
  }

  calculateCriteriaAverages(avis) {
    const criteres = [
      'adaptation_programme_vie_pro',
      'moyens_pedagogiques_utilises',
      'convenance_horaires_formation',
      'apports_niveau_professionnel',
      'qualite_documentation_distribuee',
      'maitrise_globale_sujets_presentes',
      'traitement_exemples_travail',
      'animations_seances',
      'homogeneite_groupe',
      'satisfaction_attentes',
      'duree_formation'
    ];

    const result = {};
    const validAvis = avis.filter(a => a.criteres);

    criteres.forEach(critere => {
      const values = validAvis.map(a => a.criteres[critere]).filter(v => v !== undefined);
      result[critere] = values.length > 0 
        ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2))
        : 0;
    });

    return result;
  }

  formatSessionLabel(session) {
    const dateStr = new Date(session.date_debut).toISOString().split('T')[0];
    return `Session ${session.id_session} (${dateStr})`;
  }

  async getEvaluationStats() {
    return statsRepository.getEvaluationStats();
  }

   getMoyenneNotesParSession() {
    return new Promise((resolve, reject) => {
      statsRepository.getMoyenneNotesParSession()
        .then(data => {
          // Formatage supplémentaire si nécessaire
          const result = data.map(item => ({
            sessionId: item.id_session,
            formateur: item.formateur,
            theme: item.theme,
            moyenne: item.moyenne_notes,
            nombreAvis: item.nombre_avis,
            details: {
              min: item.note_min,
              max: item.note_max
            }
          }));
          resolve(result);
        })
        .catch(error => {
          console.error('Service error:', error);
          reject(error);
        });
    });
  }
async getThemeComments(themeId) {
    try {
      if (!themeId) {
        throw new Error('Theme ID is required');
      }

      const themeData = await statsRepository.getCommentsByTheme(themeId);
      
      return {
        success: true,
        data: {
          ...themeData,
          comments: themeData.comments.map(comment => ({
            ...comment,
            stars: this.convertNoteToStars(comment.note)
          })),
          averageStars: this.convertNoteToStars(themeData.averageRating)
        }
      };
    } catch (error) {
      console.error('Error in ThemeService:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  convertNoteToStars(note) {
    const fullStars = Math.floor(note);
    const hasHalfStar = note % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return {
      full: fullStars,
      half: hasHalfStar ? 1 : 0,
      empty: emptyStars
    };
  }
 
  async getSessionStatusStats() {
  try {
    const stats = await statsRepository.getSessionStatusStats();
    
    // Formatage pour le frontend
    const labels = ['Déjà Réalisé', 'À Réaliser'];
    const data = [stats.completed.percentage, stats.pending.percentage];
    const counts = [stats.completed.count, stats.pending.count];
    
    return {
      success: true,
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: ['#4BC0C0', '#36A2EB'], // Couleurs inversées pour correspondre à l'ordre des labels
          borderColor: ['#26A69A', '#1E88E5'],
          borderWidth: 1
        }],
        counts,
        total: stats.total
      }
    };
  } catch (error) {
    console.error('Error in SessionService:', error);
    return {
      success: false,
      message: error.message
    };
  }
}
}

module.exports = new StatsService();