
const db = require('../../connect');

class DomaineAdminRepository {
getAllDomaines() {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT domaine, id_domaine FROM domaine';

    db.query(sql, (err, results) => {
      if (err) return reject(err);
      resolve(results); // Retourne un tableau d'objets { domaine, id_domaine }
    });
  });
}

    getThemesByDomaine(id_domaine) {  
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT t.theme
                FROM theme t
                JOIN domaine d ON d.id_domaine = t.id_domaine
                WHERE d.id_domaine = ?
            `;
            
            db.query(sql, [Number(id_domaine)], (err, results) => {
                if (err) return reject(err);
                resolve(results);
                console.log('id_domaine:', id_domaine);
console.log('SQL Results:', results);
            });
        });
    }
    async create(nom_domaine) {
    const result = await db.query(
      'INSERT INTO domaine (domaine) VALUES (?)', 
      [nom_domaine]
    );
    return new Domaine({ id_domaine: result.insertId, nom_domaine });
  }

  async findAll() {
    const rows = await db.query('SELECT * FROM domaine');
    return rows.map(row => new Domaine(row));
  }
}

module.exports = new DomaineAdminRepository();