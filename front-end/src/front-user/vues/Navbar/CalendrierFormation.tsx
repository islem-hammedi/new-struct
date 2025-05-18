{/*import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useAuth } from "../Hooks/useAuthUser";
import axios from "axios";
import { message } from "antd";
import PDFViewer from '../Viewer/PDFViewer';

interface Session {
  id_session: number;
  id_theme: number;
  lieu: string;
  id_formateur: number;
  id_formation: number;
  type_session: string;
  theme: string;
  domaine: string;
  date_debut: Date;
  date_fin: Date;
  duree: number;
  code?: string;
  nom_complet?: string;
  fiche_prg?: string;
  cv?: string;
}

interface Participant {
  id_participant: number;
  badge: string;
}

interface MonthData {
  monthName: string;
  sessions: Session[];
}

interface CalendarData {
  [key: number]: MonthData;
}

const CalendrierFormation = () => {
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allMonths = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const displayedMonths = allMonths.slice(currentMonthIndex, currentMonthIndex + 6);

  // Chargement des données utilisateur
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setUserLoading(true);
        const storedUser = localStorage.getItem("user");
        const userData = JSON.parse(storedUser || '{}');
        
        const participantResponse = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/apiUser/participants/${userData.id}`,
          { headers: { Authorization: `Bearer ${userData.token}` } }
        );
        
        setParticipant({
          id_participant: participantResponse.data.id_participant,
          badge: participantResponse.data.badge || participantResponse.data.Badge || null
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données utilisateur:", error);
        setError("Impossible de charger les données utilisateur");
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Chargement des sessions
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const sessionsResponse = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/apiAdmin/SessionCalendrier`
        );

        const sessionsByMonth: CalendarData = {};
        
        sessionsResponse.data.forEach((domaine: any) => {
          domaine.sessions.forEach((session: any) => {
            if (session.date_debut) {
              const dateDebut = new Date(session.date_debut);
              const month = dateDebut.getMonth();
              
              if (!sessionsByMonth[month]) {
                sessionsByMonth[month] = {
                  monthName: allMonths[month],
                  sessions: []
                };
              }
              
              sessionsByMonth[month].sessions.push({
                id_session: session.id_session,
                id_theme: session.id_theme,
                lieu: session.lieu,
                id_formateur: session.id_formateur,
                id_formation: session.id_formation,
                type_session: session.type_session,
                theme: session.theme || `Session ${session.id_session}`,
                domaine: domaine.domaine,
                date_debut: new Date(session.date_debut),
                date_fin: new Date(session.date_fin),
                duree: session.duree,
                code: session.code,
                nom_complet: session.nom_complet,
                fiche_prg: session.fiche_prg,
                cv: session.cv // Ajout du CV du formateur
              });
            }
          });
        });

        setCalendarData(sessionsByMonth);
      } catch (error) {
        console.error("Erreur lors du chargement des sessions:", error);
        setError("Impossible de charger les sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleMonthNavigation = (direction: 'prev' | 'next') => {
    setCurrentMonthIndex(prev => 
      direction === 'prev' ? Math.max(0, prev - 1) : Math.min(6, prev + 1)
    );
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
  };

  const closeModal = () => {
    setSelectedSession(null);
  };

  const downloadPDF = () => {
    const input = document.getElementById('calendrier-table');
    if (input) {
      html2canvas(input).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape');
        pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
        pdf.save('calendrier-formations.pdf');
      });
    }
  };

  const formatDateRange = (start: Date, end: Date) => {
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
  };

  const getMonthFromDate = (date: Date) => {
    return date.getMonth();
  };

  const groupSessionsByDomaine = () => {
    const sessionsByDomaine: Record<string, Session[]> = {};
    
    Object.values(calendarData).forEach(monthData => {
      monthData.sessions.forEach(session => {
        if (!sessionsByDomaine[session.domaine]) {
          sessionsByDomaine[session.domaine] = [];
        }
        sessionsByDomaine[session.domaine].push(session);
      });
    });
    
    return sessionsByDomaine;
  };

  if (userLoading || loading) return <div className="text-center py-10">Chargement en cours...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="p-5 pt-20 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-teal-700 text-center mb-8">Calendrier des Formations</h1>
        
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => handleMonthNavigation('prev')}
            disabled={currentMonthIndex === 0}
            className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Mois Précédent
          </button>
          <button
            onClick={() => handleMonthNavigation('next')}
            disabled={currentMonthIndex + 6 >= allMonths.length}
            className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Mois Suivant
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table id="calendrier-table" className="min-w-full">
            <thead>
              <tr className="bg-gray-200 text-gray-500 text-center">
                <th className="p-4">Domaine</th>
                <th className="p-4">Thème</th>
                <th className="p-4">Durée</th>
                <th className="p-4">Type</th>
                {displayedMonths.map((month, index) => (
                  <th key={index} className="p-4 text-center">{month}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupSessionsByDomaine()).map(([domaine, sessions]) => (
                <React.Fragment key={domaine}>
                  {sessions.map((session, idx) => (
                    <tr 
                      key={session.id_session} 
                      className={`border-t hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      {idx === 0 && (
                        <td rowSpan={sessions.length} className="p-4 font-semibold align-top w-20">
                          {domaine}
                        </td>
                      )}
                      <td className="p-4">
                        <button 
                          onClick={() => handleSessionClick(session)}
                          className="text-teal-600 hover:text-teal-800 hover:underline w-67" 
                        >
                          {session.theme}
                        </button>
                      </td>
                      <td className="p-4 text-center">{session.duree} jours</td>
                      <td className="p-4 text-center">{session.type_session}</td>
                      
                      {displayedMonths.map((_, monthIdx) => {
                        const monthIndex = currentMonthIndex + monthIdx;
                        const startMonth = getMonthFromDate(session.date_debut);
                        const endMonth = getMonthFromDate(session.date_fin);
                        
                        const isInMonth = startMonth === monthIndex || 
                                        endMonth === monthIndex || 
                                        (startMonth < monthIndex && endMonth > monthIndex);
                        
                        return (
                          <td key={monthIdx} className="p-4 text-center">
                            {isInMonth ? (
                              <span className="inline-block px-2 py-1 bg-teal-100 text-teal-800 rounded">
                                {formatDateRange(session.date_debut, session.date_fin)}
                              </span>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={downloadPDF}
            className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Télécharger le calendrier
          </button>
        </div>

        {selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-teal-700">Détails de la session</h2>
                  <button 
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Détails formation</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Thème:</span> {selectedSession.theme}</p>
                      <p><span className="font-medium">Code:</span> {selectedSession.code}</p>
                      <p><span className="font-medium">Formateur:</span> {selectedSession.nom_complet}</p>
                      <p><span className="font-medium">Type:</span> {selectedSession.type_session}</p>
                      <p><span className="font-medium">Lieu:</span> {selectedSession.lieu}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Dates</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Début:</span> {selectedSession.date_debut.toLocaleDateString()}</p>
                      <p><span className="font-medium">Fin:</span> {selectedSession.date_fin.toLocaleDateString()}</p>
                      <p><span className="font-medium">Durée:</span> {selectedSession.duree} jours</p>
                    </div>
                  </div>
                </div>

                {selectedSession.fiche_prg && participant?.badge === "special" && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-700 mb-3">Fiche programme</h3>
                    <div className="border rounded-lg overflow-hidden" style={{ height: "500px" }}>
                      <PDFViewer 
                        fileUrl={`${import.meta.env.VITE_APP_API_URL}/uploads/${selectedSession.fiche_prg}`} 
                      />
                    </div>
                  </div>
                )}

                {selectedSession.cv && participant?.badge === "special" && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-700 mb-3">CV du Formateur</h3>
                    <div className="border rounded-lg overflow-hidden" style={{ height: "500px" }}>
                      <PDFViewer 
                        fileUrl={`${import.meta.env.VITE_APP_API_URL}/uploads/${selectedSession.cv}`} 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendrierFormation;*/}



import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import PDFViewer from '../Viewer/PDFViewer';

interface Session {
  id_session: number;
  id_theme: number;
  lieu: string;
  id_formateur: number;
  id_formation: number;
  type_session: string;
  theme: string;
  domaine: string;
  date_debut: Date;
  date_fin: Date;
  duree: number;
  code?: string;
  mode: string;
  genre: string;
  nom_complet?: string;
  fiche_prg?: string;
  cv?: string;
}

interface MonthData {
  monthName: string;
  sessions: Session[];
}

interface CalendarData {
  [key: number]: MonthData;
}

interface Participant {
  id_participant: number;
  badge: string;
}
const CalendrierFormation = () => {
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   const [userLoading, setUserLoading] = useState(true);
  const [participant, setParticipant] = useState<Participant | null>(null);

  const allMonths = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const displayedMonths = allMonths.slice(currentMonthIndex, currentMonthIndex + 6);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const sessionsResponse = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/apiAdmin/SessionCalendrier`
        );

        const sessionsByMonth: CalendarData = {};
        
        sessionsResponse.data.forEach((domaine: any) => {
          domaine.sessions.forEach((session: any) => {
            if (session.date_debut) {
              const dateDebut = new Date(session.date_debut);
              const month = dateDebut.getMonth();
              
              if (!sessionsByMonth[month]) {
                sessionsByMonth[month] = {
                  monthName: allMonths[month],
                  sessions: []
                };
              }
              
              sessionsByMonth[month].sessions.push({
                id_session: session.id_session,
                id_theme: session.id_theme,
                lieu: session.lieu,
                id_formateur: session.id_formateur,
                id_formation: session.id_formation,
                type_session: session.type_session,
                theme: session.theme || `Session ${session.id_session}`,
                domaine: domaine.domaine,
                date_debut: new Date(session.date_debut),
                date_fin: new Date(session.date_fin),
                duree: session.duree,
                code: session.code,
                nom_complet: session.nom_complet,
                fiche_prg: session.fiche_prg,
                cv: session.cv,
                mode: session.mode,
                genre: session.genre
              });
            }
          });
        });

        setCalendarData(sessionsByMonth);
        console.log("rec",sessionsByMonth);
      } catch (error) {
        console.error("Erreur lors du chargement des sessions:", error);
        setError("Impossible de charger le calendrier des sessions");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setUserLoading(true);
        const storedUser = localStorage.getItem("user");
        if(!storedUser){return;}
        else{
        const userData = JSON.parse(storedUser || '{}');
        
        const participantResponse = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/apiUser/participants/${userData.id}`,
          { headers: { Authorization: `Bearer ${userData.token}` } }
        );
        
        setParticipant({
          id_participant: participantResponse.data.id_participant,
          badge: participantResponse.data.badge || participantResponse.data.Badge || null
        });}
      } catch (error) {
        console.error("Erreur lors du chargement des données utilisateur:", error);
        setError("Impossible de charger les données utilisateur");
      } finally {
        setUserLoading(false);
      }
    };

    fetchUserData();
  }, []);
  const handleMonthNavigation = (direction: 'prev' | 'next') => {
    setCurrentMonthIndex(prev => 
      direction === 'prev' ? Math.max(0, prev - 1) : Math.min(6, prev + 1)
    );
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
  };

  const closeModal = () => {
    setSelectedSession(null);
  };

  const downloadPDF = () => {
    const input = document.getElementById('calendrier-table');
    if (input) {
      html2canvas(input).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('landscape');
        pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
        pdf.save('calendrier-formations.pdf');
      });
    }
  };

  const formatDateRange = (start: Date, end: Date) => {
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
  };

  const getMonthFromDate = (date: Date) => {
    return date.getMonth();
  };

  const groupSessionsByDomaine = () => {
    const sessionsByDomaine: Record<string, Session[]> = {};
    
    Object.values(calendarData).forEach(monthData => {
      monthData.sessions.forEach(session => {
        if (!sessionsByDomaine[session.domaine]) {
          sessionsByDomaine[session.domaine] = [];
        }
        sessionsByDomaine[session.domaine].push(session);
      });
    });
    
    return sessionsByDomaine;
  };

  if (loading) return <div className="text-center py-10">Chargement du calendrier...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="p-5 pt-20 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-teal-700 text-center mb-8">Calendrier des Formations</h1>
        
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => handleMonthNavigation('prev')}
            disabled={currentMonthIndex === 0}
            className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Mois Précédent
          </button>
          <button
            onClick={() => handleMonthNavigation('next')}
            disabled={currentMonthIndex + 6 >= allMonths.length}
            className="px-4 py-2 bg-gray-200 text-gray-500 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            Mois Suivant
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table id="calendrier-table" className="min-w-full">
            <thead>
              <tr className="bg-gray-200 text-gray-500 text-center">
                <th className="p-4">Domaine</th>
                <th className="p-4">Thème</th>
                <th className="p-4">Durée</th>
                <th className="p-4">Type</th>
                {displayedMonths.map((month, index) => (
                  <th key={index} className="p-4 text-center">{month}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupSessionsByDomaine()).map(([domaine, sessions]) => (
                <React.Fragment key={domaine}>
                  {sessions.map((session, idx) => (
                    <tr 
                      key={session.id_session} 
                      className={`border-t hover:bg-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      {idx === 0 && (
                        <td rowSpan={sessions.length} className="p-4 font-semibold align-top w-20">
                          {domaine}
                        </td>
                      )}
                      <td className="p-4">
                        <button 
                          onClick={() => handleSessionClick(session)}
                          className="text-teal-600 hover:text-teal-800 hover:underline w-67" 
                        >
                          {session.theme}
                        </button>
                      </td>
                      <td className="p-4 text-center">{session.duree} jours</td>
                      <td className="p-4 text-center">{session.type_session}</td>
                      
                      {displayedMonths.map((_, monthIdx) => {
                        const monthIndex = currentMonthIndex + monthIdx;
                        const startMonth = getMonthFromDate(session.date_debut);
                        const endMonth = getMonthFromDate(session.date_fin);
                        
                        const isInMonth = startMonth === monthIndex || 
                                        endMonth === monthIndex || 
                                        (startMonth < monthIndex && endMonth > monthIndex);
                        
                        return (
                          <td key={monthIdx} className="p-4 text-center">
                            {isInMonth ? (
                              <span className="inline-block px-2 py-1 bg-teal-100 text-teal-800 rounded">
                                {formatDateRange(session.date_debut, session.date_fin)}
                              </span>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={downloadPDF}
            className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Télécharger le calendrier
          </button>
        </div>

        {selectedSession && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-teal-700">Détails de la session</h2>
                  <button 
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Détails formation</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Thème:</span> {selectedSession.theme}</p>
                      {selectedSession.code && <p><span className="font-medium">Code:</span> {selectedSession.code}</p>}
                      {selectedSession.nom_complet && <p><span className="font-medium">Formateur:</span> {selectedSession.nom_complet}</p>}
                      <p><span className="font-medium">Type:</span> {selectedSession.type_session}</p>
                      <p><span className="font-medium">Lieu:</span> {selectedSession.lieu}</p>
                      <p><span className="font-medium">Mode:</span> {selectedSession.mode}</p>
                      <p><span className="font-medium">Genre:</span> {selectedSession.genre}</p>


                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Dates</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Début:</span> {selectedSession.date_debut.toLocaleDateString()}</p>
                      <p><span className="font-medium">Fin:</span> {selectedSession.date_fin.toLocaleDateString()}</p>
                      <p><span className="font-medium">Durée:</span> {selectedSession.duree} jours</p>
                    </div>
                  </div>
                </div>


               {selectedSession.fiche_prg && participant && (
  <div className="mt-6">

      {localStorage.getItem("user") ? (
        participant?.badge === "special" ? (
            <div>
                <h3 className="font-semibold text-gray-700 mb-3">Fiche programme</h3>
          <div className="border rounded-lg overflow-hidden" style={{ height: "500px" }}>
            <PDFViewer 
              fileUrl={`${import.meta.env.VITE_APP_API_URL}/uploads/${selectedSession.fiche_prg}`} 
            />
          </div></div>
        ) : (
          <p className="text-orange-500"></p>
        )
      ) : (
        <p className="text-orange-500">Connectez-vous pour accéder à la fiche programme</p>
      )}
    </div>
 
)}

             {selectedSession.cv &&  participant &&(
  <div className="mt-6">
    <div className="text-sm text-gray-500 mb-2">
      {localStorage.getItem("user") ? (
        participant?.badge === "special" ? (
            <div>
                    <h3 className="font-semibold text-gray-700 mb-3">CV du Formateur</h3>

          <div className="border rounded-lg overflow-hidden" style={{ height: "500px" }}>
            <PDFViewer 
              fileUrl={`${import.meta.env.VITE_APP_API_URL}/uploads/${selectedSession.cv}`} 
            />
          </div></div>
        ) : (
          <p className="text-orange-500"></p>
        )
      ) : (
        <p className="text-orange-500">Connectez-vous pour accéder au CV du formateur</p>
      )}
    </div>
  </div>
)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendrierFormation;