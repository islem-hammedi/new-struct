
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import axios from "axios";
import PDFViewer from '../Viewer/PDFViewer';

interface EmailData {
  participantData:Participant;
  sessionData: Session;
}
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
  nom_complet: string;
  mail: string;
  telephone: string;
  id_entreprise: number;
}
interface Participation {
  id_session: number;
  participant: Participant;
  date: string; 
}

const PARTICIPATIONS_KEY = "participations";
function saveParticipation(participation: Participation) {
  const participations: Participation[] = JSON.parse(localStorage.getItem(PARTICIPATIONS_KEY) || "[]");
  participations.push(participation);
  localStorage.setItem(PARTICIPATIONS_KEY, JSON.stringify(participations));
}

const CalendrierFormation = () => {
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   const [userLoading, setUserLoading] = useState(true);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [message, setMessage] = useState<string | null>(null);
const [sendingEmail, setSendingEmail] = useState(false);
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
                duree: session.duree +1 ,
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
          badge: participantResponse.data.badge || participantResponse.data.Badge || null,
          nom_complet: participantResponse.data.nom_complet || participantResponse.data.nom || '',
          mail: participantResponse.data.mail || '',
          telephone: participantResponse.data.telephone || '',
          id_entreprise: participantResponse.data.entreprise || null
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
/////////////////////////////////////////////////////

const handleParticiper = async () => {
  if (!participant) {
    setMessage("Vous devez vous connecter pour participer.");
    return;
  }
  if (!selectedSession) return;

  try {
    const participations: Participation[] = JSON.parse(localStorage.getItem(PARTICIPATIONS_KEY) || "[]");
    const now = new Date();
    
    const already = participations.find((p) =>
      p.id_session === selectedSession.id_session &&
      p.participant.id_participant === participant.id_participant &&
      (now.getTime() - new Date(p.date).getTime()) / (1000 * 60 * 60 * 24) < 20
    );
    
    if (already) {
      setMessage("Vous avez déjà participé à cette session récemment.");
      return;
    }

    const newp: Participation = {
      id_session: selectedSession.id_session,
      participant,
      date: now.toISOString()
    };

    saveParticipation(newp);
    setMessage("Participation enregistrée !");

  
  } catch (error) {
    console.error("Erreur lors de la participation:", error);
    setMessage("Erreur lors de l'enregistrement.");
  }
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
    
 

    <div className="p-2 pt-4 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mt-2 flex justify-end">
          <button
            onClick={downloadPDF}
            className="px-4 py-2 border border-teal-500 text-teal-500 rounded-lg hover:bg-teal-500 hover:text-white transition-colors flex items-center text-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
            </svg>
            Télécharger le calendrier
          </button>
        </div>

        <h1 className="text-2xl font-bold text-teal-700 text-center mb-8">Calendrier des Formations</h1>
         <div className="flex flex-wrap justify-center items-center gap-4 p-6">
  
  
  
   
  
  
  <div className="flex items-center">
    <div className="flex flex-col items-center">
      <div className="w-28 h-28 rounded-full border-4 border-teal-600 bg-white flex flex-col items-center justify-center p-4 text-center">
        <span className="text-xs font-medium mb-1">Soyez à jour</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>
    </div>

   
  </div>

 
  <div className="flex items-center">
    <div className="flex flex-col items-center">
      <div className="w-28 h-28 rounded-full border-4 border-blue-300 bg-white flex flex-col items-center justify-center p-4 text-center">
        <span className="text-xs font-medium mb-1">Consultez détails session</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
      </div>
    </div>

   
    
  </div>

  <div className="flex items-center">
    <div className="flex flex-col items-center">
      <div className="w-28 h-28 rounded-full border-4 border-violet-400 bg-white flex flex-col items-center justify-center p-4 text-center">
        <span className="text-xs font-medium mb-1">Participez aux sessions</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
          <polyline points="16 6 12 2 8 6"></polyline>
          <line x1="12" y1="2" x2="12" y2="15"></line>
        </svg>
      </div>
    </div>

  
  </div>

  <div className="flex items-center">
    <div className="flex flex-col items-center">
      <div className="w-28 h-28 rounded-full border-4 border-teal-600 bg-white flex flex-col items-center justify-center p-4 text-center">
        <span className="text-xs font-medium mb-1">Attendez notre appel</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
      </div>
    </div>

  
  </div>

  <div className="flex flex-col items-center">
    <div className="w-28 h-28 rounded-full border-4 border-blue-300 bg-white flex flex-col items-center justify-center p-4 text-center">
      <span className="text-xs font-medium mb-1">Contactez-nous</span>
      <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    </div>
  </div>
</div>
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => handleMonthNavigation('prev')}
            disabled={currentMonthIndex === 0}
            className="px-4 py-2 bg-gray-400 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
          >
            Mois Précédent
          </button>
          <button
            onClick={() => handleMonthNavigation('next')}
            disabled={currentMonthIndex + 6 >= allMonths.length}
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
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
                <th className="p-4">Mode</th>
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
                      className={`border-t hover:bg-white ${idx % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'}`}
                    >
                      {idx === 0 && (
                        <td rowSpan={sessions.length} className="bg-gray-100 border-2 border-gray-300 text-gray-900 hover:bg-white w-60 py-3 px-8 rounded transition-colors duration-300 relative group">
                          {domaine}
                        </td>
                      )}
                     <td className="bg-gray-100 border-2 border-gray-300 text-gray-900 hover:bg-white w-60 py-3 px-3 rounded transition-colors duration-300 relative group">
              <button 
                onClick={() => handleSessionClick(session)}
                className="w-full h-full text-left flex items-center justify-between"
              >
                <div className="truncate flex-grow">{session.theme}</div>
                <svg 
                    xmlns="http://www.w3.org/2000/svg"  width="15" 
                    height="15" viewBox="0 0 24 24" fill="none" 
                    strokeWidth="2" strokeLinecap="round" 
                    strokeLinejoin="round" stroke="#14b8a6" 
                  >
                    <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/>
                    <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
                  </svg>
                  
                  
                  
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded">
                  <span className="text-sm font-medium">voir les détails</span>
                </div>
                
              </button>
            </td>

                      <td className="p-4 px-8 text-center border-2 border-gray-300 bg-gray-100">{session.duree} jours</td>
                      <td className="p-4 px-8 text-center border-2 border-gray-300 bg-gray-100">{session.type_session}</td>
                     <td className="p-4 px-8 text-center border-2 border-gray-300 bg-gray-100">{session.mode}</td>
                      {displayedMonths.map((_, monthIdx) => {
                        const monthIndex = currentMonthIndex + monthIdx;
                        const startMonth = getMonthFromDate(session.date_debut);
                        const endMonth = getMonthFromDate(session.date_fin);
                        
                        const isInMonth = startMonth === monthIndex || 
                                        endMonth === monthIndex || 
                                        (startMonth < monthIndex && endMonth > monthIndex);
                        
                        return (
                          <td key={monthIdx} className="p-4 text-center ">
                            {isInMonth ? (
                              <span className="inline-block w-40 py-6 px-3 bg-teal-100 text-teal-800 rounded">
                                {formatDateRange(session.date_debut, session.date_fin)}
                              </span>
                            ) : null}
                          </td> );
                      })}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

       

     {selectedSession && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-teal-700">Détails de la session</h2>
          <button 
            onClick={handleParticiper} 
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center disabled:opacity-50">
          Participer
          </button>

            <button  onClick={() => { setMessage('');  closeModal(); }} className="text-gray-500 hover:text-red-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
        </div>
        
         {message  && (
                <div className="mt-2 mb-2 text-center text-sm text-blue-600">{message}</div>
              )}
        <div className="flex justify-center">
      
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-6xl">
         
            <div className="bg-teal-300/20 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">Informations générales</h3>

              <div className="space-y-2 ">
                <p className="text-teal-900"><span className="font-medium ">Thème:</span> {selectedSession.theme}</p>
                {selectedSession.code && <p className="text-teal-900"><span className="font-medium">Code:</span> {selectedSession.code}</p>}
                {selectedSession.nom_complet && <p className="text-teal-900"><span className="font-medium">Formateur:</span> {selectedSession.nom_complet}</p>}
              </div>
            </div>
            <div className="bg-blue-400/20 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">Dates</h3>
              <div className="space-y-2 text-teal-900">
                <p><span className="font-medium">Début:</span> {selectedSession.date_debut.toLocaleDateString()}</p>
                <p><span className="font-medium">Fin:</span> {selectedSession.date_fin.toLocaleDateString()}</p>
                <p><span className="font-medium">Durée:</span> {selectedSession.duree} jours</p>
              </div>
            </div>

            <div className="bg-violet-500/20 p-6 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-3">Autres informations</h3>
              <div className="space-y-2">
                <p className="text-teal-900"><span className="font-medium">Type:</span> {selectedSession.type_session}</p>
                <p><span className="font-medium">Lieu:</span> {selectedSession.lieu}</p>
                <p><span className="font-medium">Mode:</span> {selectedSession.mode}</p>
                <p><span className="font-medium">Genre:</span> {selectedSession.genre}</p>
              </div>
              
            </div>
          
        {selectedSession.fiche_prg && participant && (
  <div className="mt-6 md:col-span-1 md:col-start-1 md:col-end-3 justify-center">
    {localStorage.getItem("user") ? (
      participant?.badge === "special" ? (
        <div className="space-y-4  items-center">
          <div>
            <h3 className="font-semibold text-gray-700 mb-3 text-lg">Fiche programme</h3>
            <div className="border rounded-lg overflow-hidden shadow-sm" style={{ height: "500px" }}>
              <PDFViewer 
                fileUrl={`${import.meta.env.VITE_APP_API_URL}/uploads/${selectedSession.fiche_prg}`} 
              />
            </div>
          </div>

          {selectedSession.cv && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-3 text-lg">CV du Formateur</h3>
              <div className="border rounded-lg overflow-hidden shadow-sm" style={{ height: "500px" }}>
                <PDFViewer 
                  fileUrl={`${import.meta.env.VITE_APP_API_URL}/uploads/${selectedSession.cv}`} 
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
        </div>
      )
    ) : (
      <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
        <p className="text-orange-700">Connectez-vous pour accéder aux documents</p>
      </div>
    )}
  </div>
)}
      </div>
    </div>
  </div>
  </div>
        </div>
)}
             
         
      </div>
    </div>
  );
};

export default CalendrierFormation;