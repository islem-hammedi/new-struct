import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ui1 from "/ui1.jpg";
import Footer from './vues/Footer.tsx'; 
import Navbar from './vues/Navbar.tsx';
import Catalogue from './vues/Navbar/Catalogue.tsx';
import Calendrier from './vues/Navbar/CalendrierFormation.tsx'
import AddFormateur from './vues/Navbar/AddFormateur.tsx';
import Domaine from "./vues/Navbar/domaine.tsx";
import Presentation from "./vues/Navbar/Presentation.tsx";
import ProfilFormateur from "./vues/ProfilFormateur/ProfilFormateur.tsx";
import ProfilParticipant from "./vues/ProfilParticipant/ProfilParticipant.tsx";
import AvisParticipant from "./vues/Navbar/AvisParticipant.tsx";
import AvisFormateur from "./vues/Navbar/AvisFormateur.tsx";
import DemanderFormation from "./vues/Navbar/DemanderFormation.tsx";
import Contact from "./vues/Footer.tsx";
import { AuthProvider } from "./vues/Context/AuthProviderUser";
import ResetPasswordPage from "./vues/ResetPasswordPage.tsx";
import References from "./vues/Navbar/references.tsx";
import FormateurCandidatureForm from "./vues/Navbar/Candidature.tsx"
const AppUser = () => {
  
  return (
    
      <>
      <AuthProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={
              <div className="relative top-20">
                
                <div className="relative z-10">
                  <>
                  <Presentation />
                 {/* <Domaine />*/}
                  </>
                </div>
              </div>
            } />
            
            <Route path="/Catalogue" element={<Catalogue />} />
            <Route path="/Calendrier" element={<Calendrier />} />
            <Route path="/ajout_formateur" element={<AddFormateur />} />
            <Route path="/profil_formateur" element={<ProfilFormateur />} />
            <Route path="/profil_participant" element={<ProfilParticipant />} />
            <Route path="/avis_formation" element={<AvisParticipant />} />
            <Route path="/avis_formateur" element={<AvisFormateur />} />
            <Route path="/demander_formation" element={<DemanderFormation />} />
            <Route path="/Contact" element={<Contact />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/references" element={<References />} />
            <Route path="/formateur-candidature" element={<FormateurCandidatureForm />} />
          </Routes>
          <hr />
          <Footer />
          </AuthProvider>
      </>
  );
};

export default AppUser;