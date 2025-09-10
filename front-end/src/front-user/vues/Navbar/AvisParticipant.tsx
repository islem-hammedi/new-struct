import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
type Session = {
    id_session: number;
    theme: string;
    code: string;

};

const AvisParticipant = () => {
    const [idParticipant, setIdParticipant] = useState(null);
    const [idSession, setIdSession] = useState("");
    const [sessions, setSessions] = useState<Session[]>([]);
    const [formData, setFormData] = useState({
        note: "",
        commentaire: "",
        adaptation_programme_vie_pro: 0,
        moyens_pedagogiques_utilises: 0,
        convenance_horaires_formation: 0,
        apports_niveau_professionnel: 0,
        qualite_documentation_distribuee: 0,
        maitrise_globale_sujets_presentes: 0,
        traitement_exemples_travail: 0,
        animations_seances: 0,
        homogeneite_groupe: 0,
        satisfaction_attentes: 0,
        duree_formation: ""
    });

    useEffect(() => {
        const storedUserData = localStorage.getItem("user");
        if (storedUserData) {
            const userData = JSON.parse(storedUserData);
            setIdParticipant(userData.id);
        }
    }, []);

    useEffect(() => {
        if (idParticipant) {
            fetchSessions();
        }
    }, [idParticipant]);

   const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

useEffect(() => {
        console.log("🔄 Sessions state changed:", sessions);
    }, [sessions]);

    useEffect(() => {
        console.log("🔄 Loading state changed:", loading);
    }, [loading]);

    useEffect(() => {
        console.log("🔄 Error state changed:", error);
    }, [error]);

    const fetchSessions = useCallback(async () => {
        if (!idParticipant) {
            console.log("❌ fetchSessions called without idParticipant");
            return;
        }
        
        console.log("🚀 Starting fetchSessions for participant:", idParticipant);
        setLoading(true);
        setError("");
        
        try {
            const url = `${import.meta.env.VITE_APP_API_URL}/apiUser/sessions?id_participant=${idParticipant}`;
            console.log("📡 Calling API:", url);
            
            const response = await axios.get(url);
            console.log("✅ API Response received:", response.data);
            
            const sessionsData = response.data?.sessions;
            console.log("📋 Raw sessions data:", sessionsData);
            console.log("🔍 Type of sessionsData:", typeof sessionsData);
            console.log("🔍 Is array?", Array.isArray(sessionsData));
            
            if (Array.isArray(sessionsData) && sessionsData.length > 0) {
                console.log("🎯 Setting sessions:", sessionsData);
                setSessions(sessionsData);
            } else {
                console.log("⚠️ No sessions found or invalid format");
                setError("Aucune session trouvée");
                setSessions([]);
            }
            
        } catch (error) {
            console.error("❌ API Error:", error);
            if (axios.isAxiosError(error)) {
                console.error("🔴 Error response:", error.response?.data);
            }
            setError("Erreur lors du chargement des sessions");
            setSessions([]);
        } finally {
            setLoading(false);
            console.log("🏁 fetchSessions completed");
        }
    }, [idParticipant]);

    useEffect(() => {
        console.log("🔍 useEffect - Checking localStorage");
        const storedUserData = localStorage.getItem("user");
        if (storedUserData) {
            try {
                const userData = JSON.parse(storedUserData);
                console.log("👤 User data found:", userData);
                if (userData.id) {
                    console.log("🎯 Setting idParticipant:", userData.id);
                    setIdParticipant(userData.id);
                } else {
                    console.log("❌ No id_participant in user data");
                }
            } catch (e) {
                console.error("❌ Error parsing user data:", e);
            }
        } else {
            console.log("❌ No user data in localStorage");
        }
    }, []);

    useEffect(() => {
        console.log("🔍 useEffect - idParticipant changed:", idParticipant);
        if (idParticipant) {
            console.log("🎯 idParticipant available, fetching sessions");
            fetchSessions();
        }
    }, [idParticipant, fetchSessions]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "radio" ? Number(value) : value
        }));
    };

    

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post(
                `${import.meta.env.VITE_APP_API_URL}/apiUser/avisParticipant`,
                {
                    id_participant: idParticipant,
                    id_session: idSession,
                    ...formData
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
            alert("Évaluation envoyée !");
        } catch (error) {
            console.error("Erreur lors de l'envoi :", error);
            alert("Echec de l'envoi de votre Évaluation  !");
            if (axios.isAxiosError(error)) {
                console.error("Détails de l'erreur :", error.response?.data);
            }
        }
    };
    
     console.log("Rendu - Sessions:", sessions);
    console.log(" Rendu - Loading:", loading);
    console.log(" Rendu - Error:", error);
    return (
        <form onSubmit={handleSubmit} className=" pt-10 p-6 bg-gray-100 shadow-lg rounded-lg max-w-5xl mx-auto">
            
            <h2 className="text-2xl font-bold text-teal-500 mb-4 text-center">Votre avis compte !</h2>

            <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-1">Sélectionnez la formation :</label>
                 {loading && <p className="text-blue-500">Chargement des sessions...</p>}
                 {error && <p className="text-red-500">{error}</p>}
                <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring focus:ring-teal-300"
                    value={idSession}
                    onChange={(e) => setIdSession(e.target.value)}
                    required
                    

                >
                    <option value="">-- Choisir la session --</option>
                    {sessions.map((session) => (
                        <option key={session.id_session} value={session.id_session}>
                            {session.theme} ({session.code})
                        </option>
                    ))}
                </select>
                {sessions.length > 0 && (
                    <p className="text-green-500 mt-2">
                        {sessions.length} session(s) chargée(s) avec succès
                    </p>
                )}
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-1">Note globale sur 10 :</label>
                <input
                    type="number"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring focus:ring-teal-300"
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-1">Exprimez vous :</label>
                <textarea
                    name="commentaire"
                    value={formData.commentaire}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring focus:ring-teal-300"
                ></textarea>
            </div>

          <h3 className="text-lg font-semibold text-center text-teal-500 mb-3">Aspects pédagogique</h3>
<div className="space-y-4">
  {[
      "adaptation_programme_vie_pro",
      "moyens_pedagogiques_utilises",
      "convenance_horaires_formation",
      "apports_niveau_professionnel",
      "qualite_documentation_distribuee",
      "maitrise_globale_sujets_presentes",
      "traitement_exemples_travail",
      "animations_seances",
      "homogeneite_groupe",
      "satisfaction_attentes"
  ].map((item) => (
      <div key={item} className="border border-teal-200 rounded-lg p-4 bg-gray-50 shadow-sm">
          <div className="flex justify-between items-center">
              <label className="text-gray-700 font-medium capitalize min-w-[250px]">
                  {item.replace(/_/g, " ")}
              </label>
              <div className="flex gap-6">
                  {["Insuffisant", "Peu satisfaisant", "Satisfaisant", "Très satisfaisant"].map((level, index) => (
                      <label key={index} className="flex items-center gap-2">
                          <input
                              type="radio"
                              name={item}
                              value={index + 1}
                              checked={formData[item as keyof typeof formData] === index + 1}
                              onChange={handleChange}
                              className="accent-teal-400 size-5"
                          />
                          <span>{level}</span>
                      </label>
                  ))}
              </div>
          </div>
      </div>
  ))}
</div>
<br/>
<div className="border border-teal-200 rounded-lg p-4 bg-white shadow-sm max-w-2xl">
  <div className="flex justify-between items-center">
      <label className="text-gray-700 font-medium">Durée de la formation</label>
      <select
          name="duree_formation"
          value={formData.duree_formation}
          onChange={handleChange}
          className="border border-gray-300 rounded-lg p-2 focus:ring focus:ring-teal-300 min-w-[200px]"
      >
          <option value="">Sélectionner</option>
          <option value="Longue">Longue</option>
          <option value="Courte">Courte</option>
          <option value="Convenable">Convenable</option>
      </select>
  </div>
</div><br/>
       

            <button type="submit" className="w-full bg-teal-500 text-white font-semibold p-3 rounded-lg hover:bg-teal-700 transition duration-300">
                Soumettre
            </button>
        </form>
    );
};


export default AvisParticipant;
