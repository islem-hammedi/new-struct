import { useState, useEffect } from 'react';
import axios from 'axios';

interface Theme {
  id: number;
  nom: string;
}

interface Session {
  id_session: number;
  date_debut: string;
  date_fin: string;
  mode: string;
  type_session: string;
  entreprise_beneficiaire?: string;
}

interface Participant {
  id_participant: number;
  nom_complet: string;
  nom_entreprise: string;
}

interface EvaluationData {
  [key: string]: string;
}

const AvisFormateur = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState<number | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [evaluations, setEvaluations] = useState<Record<number, EvaluationData>>({});
  const [formateurId, setFormateurId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const criteria = [
    { critere: 'Connaissances professionnelles', field: 'connaissances_professionnelles' },
    { critere: 'Connaissances des équipements utilisés', field: 'connaissances_equipements' },
    { critere: 'Compréhension des compétences proposées', field: 'comprehension_competences' },
    { critere: 'Aptitude à appliquer les informations reçues', field: 'aptitude_appliquer_infos' },
    { critere: 'Rapidité d\'exécution et d\'intervention', field: 'rapidite_execution' },
    { critere: 'Qualité des travaux réalisés', field: 'qualite_travaux' },
    { critere: 'Clarté et pertinence des résultats', field: 'clarte_pertinence_resultats' },
    { critere: 'Perfectionnement des connaissances acquises difficilement', field: 'perfectionnement_connaissances' },
    { critere: 'Respect des consignes constructeur', field: 'respect_consignes_constructeur' },
    { critere: 'Respect des normes de sécurité', field: 'respect_normes_securite' },
    { critere: 'Autonomie dans le travail', field: 'autonomie_travail' },
    { critere: 'Participation (Actif, retiré)', field: 'participation' },
    { critere: 'Assiduité - Ponctualité', field: 'assiduite_ponctualite' },
    { critere: 'Initiative', field: 'initiative' },
    { critere: 'Esprit de groupe', field: 'esprit_groupe' },
  ];

  const ratingOptions = [
    { label: 'Insuffisant', value: 'insuffisant' },
    { label: 'Passable', value: 'passable' },
    { label: 'Assez bien', value: 'assez bien' },
    { label: 'Bien', value: 'bien' },
    { label: 'Très bien', value: 'tres bien' },
  ];

 const [userInfo, setUserInfo] = useState({
   
    id_formateur: 0
  });


  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUserInfo({
      id_formateur: userData.formateurId 
    });
    console.log("userInfo:", userInfo);
  }, []);

useEffect(() => {
  console.log('[1] useEffect triggered - formateurId:', formateurId); // Étape 1
  
  if (formateurId) {
    console.log('[2] formateurId existe - valeur:', formateurId); // Étape 2

    const fetchThemes = async () => {
      console.log('[3] fetchThemes commencé'); // Étape 3
      
      try {
        setIsLoading(true);
        setError('');
        console.log('[4] Avant appel API - URL:', `${import.meta.env.VITE_APP_API_URL}/apiUser/themes?idFormateur=${formateurId}`); // Étape 4

        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/apiUser/themes?idFormateur=${formateurId}`
        );
        
        console.log('[5] Réponse API reçue - status:', response.status, 'data:', response.data); // Étape 5
        setThemes(response.data);
        
      } catch (err) {
        console.error('[6] Erreur attrapée:', err); // Étape 6
        setError('Failed to load themes');
      } finally {
        console.log('[7] finally block - isLoading:', isLoading); // Étape 7
        setIsLoading(false);
      }
    };
    
    fetchThemes().then(() => {
      console.log('[8] fetchThemes terminé'); // Étape 8
    });
  } else {
    console.log('[9] formateurId est falsy'); // Étape 9
  }
}, [formateurId]);

// Ajoutez ceci à l'extérieur du useEffect pour vérifier les re-renders
console.log('[RENDER] Composant rendu - formateurId:', formateurId);



  const handleRatingChange = (participantId: number, field: string, value: string) => {
    setEvaluations(prev => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        [field]: value
      }
    }));
  };

  const handleSubmit = async (participantId: number) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');

      setIsLoading(true);
await axios.post(
  `${import.meta.env.VITE_APP_API_URL}/apiUser/evaluations`,
  {
    participantId,
    sessionId: selectedSessionId,
    formateurId: userInfo.id_formateur,
    evaluations: evaluations[participantId]
  },
  {
    headers: {
      Authorization: `Bearer ${userData.token}`
    }
  }
);
      alert('Evaluation submitted successfully');
    } catch (err) {
      setError('Failed to submit evaluation');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedSession = sessions.find(s => s.id_session === selectedSessionId);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Évaluer les participants</h1>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sélectionnez un thème
        </label>
        <select
          className="w-full p-2 border border-gray-300 rounded-md"
          value={selectedThemeId || ''}
          onChange={(e) => setSelectedThemeId(Number(e.target.value))}
          disabled={isLoading}
        >
          <option value="">-- Sélectionner un thème --</option>
          {themes.map(theme => (
            <option key={theme.id} value={theme.id}>{theme.nom}</option>
          ))}
        </select>
      </div>
      
      {selectedThemeId && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionnez une session
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md"
            value={selectedSessionId || ''}
            onChange={(e) => setSelectedSessionId(Number(e.target.value))}
            disabled={isLoading || !selectedThemeId}
          >
            <option value="">-- Sélectionner une session --</option>
            {sessions.map(session => (
              <option key={session.id_session} value={session.id_session}>
                {new Date(session.date_debut).toLocaleDateString()} - {session.mode}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {selectedSession && (
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h2 className="text-lg font-semibold mb-2">Détails de la session</h2>
          <p>Dates: {new Date(selectedSession.date_debut).toLocaleDateString()} - {new Date(selectedSession.date_fin).toLocaleDateString()}</p>
          <p>Mode: {selectedSession.mode}</p>
          <p>Type: {selectedSession.type_session}</p>
          {selectedSession.mode === 'inter-entreprise' && selectedSession.entreprise_beneficiaire && (
            <p>Entreprise bénéficiaire: {selectedSession.entreprise_beneficiaire}</p>
          )}
        </div>
      )}
      
      {selectedSessionId && participants.length > 0 && (
        <div className="space-y-8">
          <h2 className="text-xl font-semibold">Participants à évaluer</h2>
          
          {participants.map(participant => (
            <div key={participant.id_participant} className="border rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">
                {participant.nom_complet} - {participant.nom_entreprise}
              </h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Critère
                      </th>
                      {ratingOptions.map(option => (
                        <th key={option.value} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {option.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {criteria.map((criterion, idx) => (
                      <tr key={criterion.field} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {criterion.critere}
                        </td>
                        {ratingOptions.map(option => (
                          <td key={option.value} className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="radio"
                              name={`${participant.id_participant}-${criterion.field}`}
                              value={option.value}
                              checked={evaluations[participant.id_participant]?.[criterion.field] === option.value}
                              onChange={() => handleRatingChange(participant.id_participant, criterion.field, option.value)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleSubmit(participant.id_participant)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
                >
                  {isLoading ? 'Envoi en cours...' : 'Soumettre évaluation'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedSessionId && participants.length === 0 && !isLoading && (
        <div className="text-gray-500">Aucun participant trouvé pour cette session.</div>
      )}
    </div>
  );
};

export default AvisFormateur;