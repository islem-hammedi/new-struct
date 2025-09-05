const statsService = require('../../services/admin/statService');

class StatsController {
  async getAdminStats(req, res) {
    try {
      const stats = await statsService.getAdminStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching admin statistics'
      });
    }
  }

  getEvaluations = async (req, res) => {
   try {
    const filters = {
      dateRange: req.query.startDate && req.query.endDate ? {
        start: new Date(req.query.startDate),
        end: new Date(req.query.endDate)
      } : null,
      formateur: req.query.formateur || null,
      theme: req.query.theme || null,
      minRating: req.query.minRating ? parseInt(req.query.minRating) : 0
    };

    console.log('Filtres appliqués:', filters);

    const evaluations = await statsService.getSessionEvaluations(filters);
    
    res.json({ 
      success: true, 
      data: evaluations,
      meta: {
        count: evaluations.length,
        filtersApplied: filters
      }
    });
  } catch (error) {
    console.error('Error in getEvaluations:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};
  async getSessionEvaluation(req, res) {
    try {
    const { sessionId } = req.params;
    const filters = buildFilters(req.query);
    
    const evaluations = await statsService.getSessionEvaluations({
      ...filters,
      id_session: sessionId
    });

    if (evaluations.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Session not found or no evaluations available' 
      });
    }

    res.json({ 
      success: true, 
      data: evaluations[0] 
    });
  } catch (error) {
    console.error('Error fetching session evaluation:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

  async getEvaluationStats(req, res) {
    try {
    const stats = await statsService.getEvaluationStats();
    res.json({ 
      success: true, 
      data: stats 
    });
  } catch (error) {
    console.error('Error fetching evaluation stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
  }
};

  buildFilters(query) {
    const { startDate, endDate, formateur, theme, minRating } = query;
    const filters = {};

    if (startDate && endDate) {
      filters.dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      };
    }

    if (formateur) filters.formateur = formateur;
    if (theme) filters.theme = theme;
    if (minRating) filters.minRating = parseInt(minRating);

    return filters;
  }

  async getMoyenneNotes(req, res) {
    try {
      const data = await statsService.getMoyenneNotesParSession();
      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des moyennes'
      });
    }
  }

  async getThemeComments(req, res) {
    try {
      const { id } = req.params;
      
      const result = await statsService.getThemeComments(id);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      console.error('Error in ThemeController:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
 async getSessionStatusStats(req, res) {
  try {
    const result = await statsService.getSessionStatusStats();
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);
  } catch (error) {
    console.error('Error in SessionController:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}
}

module.exports = new StatsController();