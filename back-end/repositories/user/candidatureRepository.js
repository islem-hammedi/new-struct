const db = require('../../connect');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const dbConfig = require('../config/database');

class CandidatureRepository {
  async saveCVFile(file) {
    if (!file) throw new Error('No CV file provided');
    
    const uploadDir = path.join(__dirname, '../../uploads/cv');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.promises.writeFile(filePath, file.buffer);
    return `/uploads/cv/${fileName}`;
  }

  async createCandidature(candidatureData) {
    try {
      let cvPath = '';
      if (candidatureData.cv) {
        cvPath = await this.saveCVFile(candidatureData.cv);
      }

      const [result] = await connection.execute(
        `INSERT INTO candidature_formateur 
        (nom_complet, tel, mail, adr, domaines_competence, cv, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          candidatureData.nom_complet,
          candidatureData.tel,
          candidatureData.mail,
          candidatureData.adr,
          candidatureData.domaines_competence,
          cvPath
        ]
      );
      return result;
    } catch (error) {
      console.error('Repository Error - createCandidature:', error);
      throw new Error('Error creating candidature');
    }
  }

  async getAllCandidatures() {
    const connection = await mysql.createConnection(dbConfig);
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM candidature_formateur ORDER BY created_at DESC'
      );
      return rows;
    } catch (error) {
      console.error('Repository Error - createCandidature:', error);
      throw new Error('Error creating candidature');
    }
  }
}

module.exports = new CandidatureRepository();