{/*const mysql = require ("mysql")
require('dotenv').config();

const db = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});



db.connect((err) => {
    if (err) {
      console.error('Erreur de connexion à la base de données :', err);
    } else {
      console.log('Connecté à la base de données MySQL');
    }
  });

module.exports = db;*/}





















const mysql = require ("mysql")
require('dotenv').config();

const db = mysql.createConnection({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});



db.connect((err) => {
    if (err) {
      console.error('Erreur de connexion à la base de données :', err);
    } else {
      console.log('Connecté à la base de données MySQL');
    }
  });

module.exports = db;