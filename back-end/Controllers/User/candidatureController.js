const candidatureService = require('./candidatureService');

class CandidatureController {
  async createCandidature(req, res) {
    try {
      const formData = req.body;
      const cvFile = req.file;

      if (!cvFile) {
        return res.status(400).json({ 
          success: false, 
          message: 'CV (PDF) is required' 
        });
      }

      const result = await candidatureService.createCandidature(formData, cvFile);
      
      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error submitting application'
      });
    }
  }

  async getAllCandidatures(req, res) {
    try {
      const candidatures = await candidatureService.getAllCandidatures();
      
      res.status(200).json({
        success: true,
        data: candidatures
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error fetching applications'
      });
    }
  }
}

module.exports = new CandidatureController();