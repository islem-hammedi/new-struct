import React, { useEffect, useState } from "react";
import axios from "axios";
import { format, startOfYear, addMonths, differenceInDays } from "date-fns";

interface Domaine {
  id_domaine: number;
  domaine: string;
  themes: Theme[];
}

interface Theme {
  id_theme: number;
  theme: string;
  sessions: Session[];
}

interface Session {
  id_session: number;
  createdAt: string;
}

interface CalendarSession {
  id_session: number;
  id_theme: number;
  id_domaine: number;
  theme: string;
  domaine: string;
  createdAt: string;
  date_debut?: Date;
  date_fin?: Date;
  duree?: number;
}

interface MonthData {
  selectors: {
    selectedDomaine: number | null;
  }[];
  sessions: CalendarSession[];
}

const TrainingCalendar: React.FC = () => {
  const [domainesData, setDomainesData] = useState<Domaine[]>([]);
  const [calendarData, setCalendarData] = useState<Record<number, MonthData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/domaines-with-sessions`);
        
        if (!response.data.success) {
          setError(response.data.message || "Structure de données inattendue");
          return;
        }

        setDomainesData(response.data.data || []);
      } catch (error) {
        console.error("Erreur réseau:", error);
        setError("Impossible de charger les données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddSelector = (month: number) => {
    setCalendarData((prev) => ({
      ...prev,
      [month]: {
        selectors: [...(prev[month]?.selectors || []), { selectedDomaine: null }],
        sessions: prev[month]?.sessions || []
      }
    }));
  };

  const handleDomaineChange = (month: number, selectorIndex: number, id_domaine: number) => {
    setCalendarData((prev) => {
      const currentData = prev[month] || { selectors: [], sessions: [] };
      const updatedSelectors = [...currentData.selectors];
      updatedSelectors[selectorIndex] = { selectedDomaine: id_domaine };
      
      return {
        ...prev,
        [month]: {
          ...currentData,
          selectors: updatedSelectors
        }
      };
    });
  };

  const handleAddSession = (month: number, selectorIndex: number, sessionId: number) => {
    let selectedSession: CalendarSession | null = null;

    for (const domaine of domainesData) {
      for (const theme of domaine.themes) {
        const session = theme.sessions.find((s) => s.id_session === sessionId);
        if (session) {
          selectedSession = {
            id_session: session.id_session,
            id_theme: theme.id_theme,
            id_domaine: domaine.id_domaine,
            theme: theme.theme,
            domaine: domaine.domaine,
            createdAt: session.createdAt,
            date_debut: new Date(),
            date_fin: new Date(new Date().setDate(new Date().getDate() + 1)),
            duree: 1
          };
          break;
        }
      }
      if (selectedSession) break;
    }

    if (!selectedSession) return;

    setCalendarData((prev) => {
      const monthData = prev[month] || { selectors: [], sessions: [] };
      return {
        ...prev,
        [month]: {
          ...monthData,
          sessions: [...monthData.sessions, selectedSession as CalendarSession],
        },
      };
    });
  };

  const handleRemoveSession = (month: number, sessionId: number) => {
    setCalendarData((prev) => {
      if (!prev[month]) return prev;
      return {
        ...prev,
        [month]: {
          ...prev[month],
          sessions: prev[month].sessions.filter((s) => s.id_session !== sessionId),
        },
      };
    });
  };

  const handleDateChange = (month: number, sessionId: number, field: 'date_debut' | 'date_fin', value: Date) => {
    setCalendarData((prev) => {
      if (!prev[month]) return prev;
      
      return {
        ...prev,
        [month]: {
          ...prev[month],
          sessions: prev[month].sessions.map((session) => {
            if (session.id_session === sessionId) {
              const updatedSession = {
                ...session,
                [field]: value
              };
              
              // Recalculer la durée si les deux dates sont définies
              if (updatedSession.date_debut && updatedSession.date_fin) {
                updatedSession.duree = differenceInDays(
                  new Date(updatedSession.date_fin),
                  new Date(updatedSession.date_debut)
                ) + 1; // +1 pour inclure le dernier jour
              }
              
              return updatedSession;
            }
            return session;
          }),
        },
      };
    });
  };

  const handleSave = async () => {
    try {
      // 1. Préparer les données
      const sessionsToSave = Object.entries(calendarData).flatMap(([month, monthData]) =>
        monthData.sessions.map(session => ({
          id_session: session.id_session,
          date_debut: session.date_debut?.toISOString().split('T')[0],
          date_fin: session.date_fin?.toISOString().split('T')[0],
          duree: session.duree
        }))
      );

      console.log("Données à envoyer:", sessionsToSave);

      // 2. Envoyer directement le tableau (sans l'objet wrapper)
      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/apiAdmin/sessions/save`,
        sessionsToSave,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // 3. Gérer la réponse
      if (response.data.success) {
        alert(response.data.message || "Sessions enregistrées avec succès !");
      } else {
        throw new Error(response.data.error || "Erreur inconnue du serveur");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Erreur détaillée:", error.response?.data || error.message);
        alert(`Erreur lors de l'enregistrement: ${error.response?.data?.error || error.message}`);
      } else {
        console.error("Erreur détaillée:", error);
        alert("Erreur inconnue lors de l'enregistrement.");
      }
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  if (loading) return <div className="p-6">Chargement...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Calendrier des Formations</h1>

      <div className="grid grid-cols-3 gap-4">
        {months.map((month) => {
          const monthData = calendarData[month] || { selectors: [], sessions: [] };

          return (
            <div key={month} className="border rounded p-4">
              <h3 className="font-bold mb-2">
                {format(addMonths(startOfYear(new Date()), month - 1), "MMMM")}
              </h3>

              <button
                className="mb-4 text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded"
                onClick={() => handleAddSelector(month)}
              >
                + Ajouter une sélection
              </button>

              {monthData.selectors.map((selector, selectorIndex) => {
                const availableSessions: CalendarSession[] = [];
                
                if (selector.selectedDomaine) {
                  const selectedDomaine = domainesData.find((d) => d.id_domaine === selector.selectedDomaine);
                  if (selectedDomaine) {
                    selectedDomaine.themes.forEach((theme) => {
                      theme.sessions.forEach((session) => {
                        if (!monthData.sessions.some(s => s.id_session === session.id_session)) {
                          availableSessions.push({
                            id_session: session.id_session,
                            id_theme: theme.id_theme,
                            id_domaine: selectedDomaine.id_domaine,
                            theme: theme.theme,
                            domaine: selectedDomaine.domaine,
                            createdAt: session.createdAt,
                          });
                        }
                      });
                    });
                  }
                }

                return (
                  <div key={selectorIndex} className="mb-4 border-b pb-4">
                    <div className="mb-2">
                      <label className="block text-sm mb-1">Domaine:</label>
                      <select
                        className="w-full p-2 border rounded text-sm"
                        value={selector.selectedDomaine || ""}
                        onChange={(e) => handleDomaineChange(month, selectorIndex, Number(e.target.value))}
                      >
                        <option value="">Sélectionnez un domaine</option>
                        {domainesData.map((domaine) => (
                          <option key={domaine.id_domaine} value={domaine.id_domaine}>
                            {domaine.domaine}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selector.selectedDomaine && (
                      <div className="mb-2">
                        <label className="block text-sm mb-1">Sessions:</label>
                        <select
                          className="w-full p-2 border rounded text-sm"
                          onChange={(e) => handleAddSession(month, selectorIndex, Number(e.target.value))}
                          disabled={!selector.selectedDomaine}
                          value=""
                        >
                          <option value="">Ajouter une session</option>
                          {availableSessions.map((session) => (
                            <option key={session.id_session} value={session.id_session}>
                              {`${session.theme} (${format(new Date(session.createdAt), "dd/MM/yyyy")})`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="space-y-2 mt-2">
                {monthData.sessions.map((session) => (
                  <div key={session.id_session} className="bg-gray-100 p-2 rounded text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <div className="font-medium">{session.theme}</div>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveSession(month, session.id_session)}
                      >
                        ×
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className="block text-xs mb-1">Date début:</label>
                        <input
                          type="date"
                          className="w-full p-1 border rounded text-xs"
                          value={session.date_debut?.toISOString().split('T')[0] || ''}
                          onChange={(e) => handleDateChange(
                            month, 
                            session.id_session, 
                            'date_debut', 
                            new Date(e.target.value))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Date fin:</label>
                        <input
                          type="date"
                          className="w-full p-1 border rounded text-xs"
                          value={session.date_fin?.toISOString().split('T')[0] || ''}
                          onChange={(e) => handleDateChange(
                            month, 
                            session.id_session, 
                            'date_fin', 
                            new Date(e.target.value))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="mt-1 text-xs">
                      Durée: {session.duree || 0} jour(s)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <button
          className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700"
          onClick={handleSave}
        >
          Enregistrer le calendrier
        </button>
      </div>
    </div>
  );
};

export default TrainingCalendar;