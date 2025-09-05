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
  origin: process.env.APP_URL , 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions)); 
app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname,  "uploads"), {
  setHeaders: (res, path, stat) => {
    res.set("Access-Control-Allow-Origin", "*");
  }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

// Importation des routes admin
const formateurARoutes = require('./Routes/Admin/formateursRoute');
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
const domaine= require('./Routes/Admin/domaineRoutes');
const reference = require('./Routes/Admin/referenceRoutes');
// Importation des routes utilisateur

const formateurRoute = require('./Routes/User/formateursRoute'); 
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
const referenceRoute = require('./Routes/User/referenceUserRoutes');






app.use('/apiUser', referenceRoute);

// Ajoutez ceci APRÈS le logging mais AVANT app.use('/apiAdmin/...')
app.get('/apiUser/getReferences', (req, res) => {
  console.log('✅ Route test appelée directement');
  res.json([{ id: 1, nom: 'Test', logo: 'test.png', secteur: 'test' }]);
});
// Routes admin

app.use('/apiAdmin/catalogue',catalogueR);
app.use('/apiAdmin', formateurARoutes);
app.use('/apiAdmin/formations', formationRoutes);
app.use('/apiAdmin/admin', adminRoutes);
app.use('/apiAdmin/auth', authRoutes);
app.use('/apiAdmin',accesRoutes);
app.use('/apiAdmin/calendrierEvent', calendrierRoutes);
app.use('/apiAdmin',clientRoutes);
app.use('/apiAdmin', chartRoutes);
app.use('/apiAdmin',domaine);
app.use('/apiAdmin/demanderFormation',demanderFormationRoutes);
app.use('/apiAdmin',calendrierFormationRoutes);
app.use('/apiAdmin', feuillePresenceRoutes);
app.use('/apiAdmin/avis',avisP);
app.use('/apiAdmin/avis',avisF);
app.use('/apiAdmin',calForm);
app.use('/apiAdmin',reference);
//app.use('/apiAdmin', chartRoutes);

// Routes utilisateur
app.use('/apiUser/formateurs', formateurRoute);
app.use('/apiUser/formations',catalogueRoute);
app.use('/apiUser', contactRoute);
app.use('/apiUser',profilFormateurRoute);
app.use("/apiUser/participants", profilParticipantRoute);
app.use('/apiUser/auth',authRoute);
app.use('/apiUser', AvisParticipantRoute);
app.use('/apiUser', AvisFormateurRoute);
app.use('/apiUser/demanderFormation',demanderFormationRoute);
app.use('/apiUser/calendrierFormation',CalendrierFormationRoute);
app.use('/apiUser/formateur-candidatures', formateurCandidatureRoutes);
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});






