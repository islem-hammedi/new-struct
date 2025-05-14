const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT ;

const corsOptions = {
  origin: process.env.APP_URL , // Autoriser uniquement le frontend
  credentials: true, // Autoriser les cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes HTTP autorisées
  allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
};

app.use(cors(corsOptions)); // Utilisation du middleware CORS
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname,  "uploads"), {
  setHeaders: (res, path, stat) => {
    res.set("Access-Control-Allow-Origin", "*");
  }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Pour lire les formulaires

// Importation des routes admin
const formateurRoutes = require('./Routes/Admin/formateursRoute');
const formationRoutes = require('./Routes/Admin/formationRouter');
const adminRoutes = require('./Routes/Admin/adminRoutes');
const authRoutes = require('./Routes/Admin/authRoutes');
const accesRoutes = require('./Routes/Admin/accesRoutes');
const calendrierRoutes = require('./Routes/Admin/calendrierEventRoute');
const clientRoutes = require('./Routes/Admin/clientRoutes');
const chartRoutes = require('./Routes/Admin/chartRoutes');
const demanderFormationRoutes = require('./Routes/Admin/DemanderFormationRoute');
const calendrierFormationRoutes = require('./Routes/Admin/calendrierFormationRoutes');
const feuillePresenceRoutes = require('./Routes/Admin/FeuillePresenceRoutes');
const avisP = require('./Routes/Admin/avisParticipantRoutes');
const avisF= require('./Routes/Admin/avisFormateurRoutes');
const calForm = require('./Routes/Admin/calendrierFormationRoutes');
const catalogueR= require('./Routes/Admin/catalogueRoutes');
// Importation des routes utilisateur

const formateurRoute = require('./Routes/User/formateursRoute'); // Using require for consistency
const catalogueRoute = require('./Routes/User/CatalogueRouter');
const contactRoute = require('./Routes/User/contactRoute');
const profilFormateurRoute = require('./Routes/User/profilFormateurRoute');
const profilParticipantRoute = require('./Routes/User/profilParticipantRoute');
const authRoute = require('./Routes/User/authRoute');
const AvisParticipantRoute = require('./Routes/User/AvisParticipantRoute');
const demanderFormationRoute = require('./Routes/User/demanderFormationRoute');
const AvisFormateurRoute = require('./Routes/User/AvisFormateurRoute');
const CalendrierFormationRoute = require('./Routes/User/CalendrierFormationRoute');
const formateurCandidatureRoutes = require('./Routes/User/formateurCandidatureRoutes');
// Routes admin

app.use('/apiAdmin/catalogue',catalogueR);
app.use('/apiAdmin', formateurRoutes);
app.use('/apiAdmin/formations', formationRoutes);
app.use('/apiAdmin/admin', adminRoutes);
app.use('/apiAdmin/auth', authRoutes);
app.use('',accesRoutes);
app.use('/apiAdmin/calendrierEvent', calendrierRoutes);
app.use('/apiAdmin',clientRoutes);
app.use('/apiAdmin', chartRoutes);
app.use('/apiAdmin/demanderFormation',demanderFormationRoutes);
app.use('/apiAdmin',calendrierFormationRoutes);
app.use('/apiAdmin', feuillePresenceRoutes);
app.use('/apiAdmin/avis',avisP);
app.use('/apiAdmin/avis',avisF);
app.use('/apiAdmin',calForm);
// Routes utilisateur
app.use('/apiUser/formateurs', formateurRoute);
app.use('/apiUser/formations',catalogueRoute);
app.use('/apiUser', contactRoute);
app.use('',profilFormateurRoute);
app.use("/apiUser/participants", profilParticipantRoute);
app.use('/apiUser',authRoute);
app.use('/apiUser', AvisParticipantRoute);
app.use('/apiUser', AvisFormateurRoute);
app.use('/apiUser/demanderFormation',demanderFormationRoute);
app.use('/apiUser/calendrierFormation',CalendrierFormationRoute);
app.use('/apiUser/formateur-candidatures', formateurCandidatureRoutes);


app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});