{/*const db = require("../../connect"); 

const getAllReferences = async () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM reference ORDER BY created_at DESC", (error, results, fields) => {
      if (error) {
        console.error('Error in getAllReferences:', error);
        reject(error);
      } else {
        console.log('Query results:', results);
        resolve(results);
      }
    });
  });
};

const getReferencesBySecteur = async (secteur) => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM reference WHERE secteur = ?", [secteur], (error, results, fields) => {
      if (error) {
        console.error('Error in getReferencesBySecteur:', error);
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = {
  getAllReferences,
  getReferencesBySecteur,
};*/}
const db = require("../../connect"); 

const getAllReferences = async () => {
  const query = "SELECT * FROM reference ORDER BY created_at DESC";
  return new Promise((resolve, reject) => {
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error in getAllReferences:', error);
        return reject(error);
      }
      resolve(results);
    });
  });
};
const getReferencesBySecteur = async (secteur) => {
  const query = "SELECT * FROM reference WHERE secteur = ?";
  return new Promise((resolve, reject) => {
    db.query(query, [secteur], (error, results) => {
      if (error) {
        console.error('Error in getReferencesBySecteur:', error);
        return reject(error);
      }
      resolve(results);
    });
  }     );
};
module.exports = {
  getAllReferences,
  getReferencesBySecteur,
};