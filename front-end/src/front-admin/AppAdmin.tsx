import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import Chart from './pages/Chart';
import Formations from './pages/formation/Formations';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NewAdmin from './pages/NewAdmin';
import AddFormateur from './pages/formateur/AddFormateur';
import ProfilFormateur from './pages/formateur/ProfilFormateur';
import DefaultLayout from './layout/DefaultLayout';
import Formateurs from './pages/formateur/Formateurs';
import AddFormation from './pages/formation/AddFormation';
import UpdateFormation from './pages/formation/UpdateFormation';
import GroupManagement from './pages/Management/groupManagement';
import Calendrier from './pages/Calendrier/CalendrierEvent';
import { useAuth } from './hooks/useAuthAdmin';
import ClientsPersonne from './pages/Client/ClientsPersonne';
import ClientsEntreprise from './pages/Client/ClientsEntreprise';
import DemandesDeFormation from './pages/formation/DemandesDeFormation ';
import FeuillePresence from './pages/Fiches/FeuillePresence';
import ShowCalendrierformation from './pages/Calendrier/ShowCalendrierFormation';
import CatalogueListAdmin from './pages/catalogue/catalogue';
import AddReferenceForm from './pages/addReference';
const AppAdmin= () => {
  const { loading } = useAuth(); // Utiliser le hook useAuth pour récupérer l'utilisateur et l'état de connexion

  if (loading) {
    return <Loader />;
  }
  return (
        <DefaultLayout>
          <Routes>
             <Route
                      path="/profile"
                      element={
                        //<>
                          //<PageTitle title="Profile | SacAdmin" />
                          <Profile />
                        //</>
                      }
                    />         
                       
            
            
                    <Route
                      path="/chart"
                      element={
                        //<>
                          //<PageTitle title="Basic Chart | SacAdmin" />
                          <Chart />
                        //</>
                      }
                    />
                <Route
                  path="/Cataloguelist"
                  element={
                    <>
                      <PageTitle title="Catalogue Dashboard | SacAdmin" />
                      <CatalogueListAdmin />
                    </>
                  }
                />
                    <Route
                      path="/NewAdmin"
                      element={
                        //<>
                          //<PageTitle title="New Admin | SacAdmin" />
                          <NewAdmin />
                        //</>
                      }
                    />
                    <Route
                  path="/ajout_formateur"
                  element={
                    //<>
                      //<PageTitle title="Add Formateur | SacAdmin" />
                      <AddFormateur />
                    //</>
                  }
                />
                <Route
                  path="/modifier_formateur/${id}"
                  element={
                    //<>
                      //<PageTitle title="modifier Formateur | SacAdmin" />
                      <ProfilFormateur />
                    //</>
                  }
                />
                  
                <Route
                  path="/modifier_formation"
                  element={
                    //<>
                      //<PageTitle title="Add Formateur | SacAdmin" />
                      <UpdateFormation />
                    //</>
                  }
                />
                <Route
                  path="/DemandeFormation"
                  element={
                    //<>
                      //<PageTitle title="Demandes de formations Dashboard | SacAdmin" />
                      <DemandesDeFormation />
                    //</>
                  }
                />

                <Route
                  path="/Gestion_de_groupe"
                  element={
                    //<>
                      //<PageTitle title="Gestion de groupe| SacAdmin" />
                      <GroupManagement />
                    //</>
                  }
                />
                
                
                <Route
                  path="/Formations"
                  element={
                    //<>
                      //<PageTitle title="Formations Dashboard | SacAdmin" />
                      <Formations />
                    //</>
                  }
                />
                
                
                <Route
                  path="/Formateurs"
                  element={
                    //<>
                      //<PageTitle title="Formateurs | SacAdmin" />
                      <Formateurs />
                    //</>
                  }
                />
                <Route
                  path="/Formateurs/:id"
                  element={
                    //<>
                      //<PageTitle title="Formateurs | SacAdmin" />
                      <Formateurs />
                    //</>
                  }
                />
                
                <Route
                  path="/formateur/:id"
                  element={
                    //<>
                      //<PageTitle title="Profil Formateur | SacAdmin" />
                      <ProfilFormateur />
                    //</>
                  }
                />
                <Route
                      path="/profile"
                      element={
                        //<>
                          //<PageTitle title="Profile | SacAdmin" />
                          <Profile />
                        //</>
                      }
                    />
                    <Route
                      path="/parametre"
                      element={
                        //<>
                          //<PageTitle title="paramétre | SacAdmin" />
                          <Settings />
                        //</>
                      }
                    />
                    
                <Route
                  path="/client/entreprise"
                  element={
                    //<>
                      //<PageTitle title="Form Elements | SacAdmin" />
                      <ClientsEntreprise />
                    //</>
                  }
                />
                <Route
                  path="/client/personne"
                  element={
                  //  <>
                     // <PageTitle title="Form Layout | TailAdmin" />
                      <ClientsPersonne />
                    //</>
                  }
                />
                <Route
                      path="/Calendrier-Event"
                      element={
                      //  <>
                          <Calendrier />
                        //</>
                      }
                    />
                    <Route
                      path="/Calendrier-Formation"
                      element={
                      //  <>
                        //  <PageTitle title="Calendrier | SacAdmin" />
                        <ShowCalendrierformation />
                        //</>
                      }
                    />
                    <Route
                      path="/FeuillePresence"
                     element={
                        <>
                       <PageTitle title="Calendrier | SacAdmin" />
                        <FeuillePresence/>
                       </>
                    }
                    />
  <Route
    path="/addreference"
    element={
    <>
    <PageTitle title="Reference Dashboard | SacAdmin" />
    <AddReferenceForm />
    </>
     }
    />
                <Route
                  path="/*"
                  element={
                    //<>
                      //<PageTitle title="Form Layout | TailAdmin" />
                      <SignIn />
                    //</>
                  }
                />
              
          </Routes>
        </DefaultLayout>
        
      );
    }
      


export default AppAdmin;
