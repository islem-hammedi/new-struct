import React, { useEffect, useState } from "react";
import axios from "axios";

type Entreprise = {
  id: number;
  nom: string;
  lien: string;
  logo: string;
  secteur: string;
  created_at: string;
};

const References: React.FC = () => {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [secteurs, setSecteurs] = useState<string[]>([]);
  const [secteurSelectionne, setSecteurSelectionne] = useState<string | null>(null); // Changé à null par défaut

  useEffect(() => {
    const apiUrl = `${import.meta.env.VITE_APP_API_URL}/apiUser/getReferences`;
    console.log('Making request to:', apiUrl);
    
    axios.get(apiUrl).then((res) => {
      console.log('Response:', res.data);
      const entreprisesData = Array.isArray(res.data) ? res.data : res.data.data;
      setEntreprises(entreprisesData ?? []);
      
      const secteursUniques: string[] = Array.from(
        new Set((entreprisesData ?? []).map((e: Entreprise) => e.secteur))
      );
      
      setSecteurs(secteursUniques as string[]);
    }).catch(error => {
      console.error('API Error:', error);
    });
  }, []);

  const entreprisesFiltrees = secteurSelectionne
    ? entreprises.filter((e) => e.secteur === secteurSelectionne)
    : entreprises;
const getImageUrl = (logoPath: string) => {
  if (!logoPath) return '';
  if (logoPath.startsWith('http')) return logoPath;
  return `${import.meta.env.VITE_APP_API_URL}/${logoPath}`;
};
  return (
    <section className="bg-white/90 backdrop-blur-md py-10 px-8 sm:px-10 lg:px-8 border-t border-emerald-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-teal-600 text-center flex-grow">NOS RÉFÉRENCES</h2>
        
        <div className="my-8 flex flex-wrap justify-center gap-2">
          <button
            key="tous"
            onClick={() => setSecteurSelectionne(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              secteurSelectionne === null
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tous
          </button>
          
          {secteurs.map(secteur => (
            <button
              key={secteur}
              onClick={() => setSecteurSelectionne(secteur)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                secteurSelectionne === secteur
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {secteur}
            </button>
          ))}
        </div>

        {entreprisesFiltrees.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-10">
            {entreprisesFiltrees.map((entreprise) => (
              <div 
                key={entreprise.id}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
               <img 
  src={`http://localhost:5000/${entreprise.logo}`} 
  alt={`Logo ${entreprise.nom}`}
  className="h-16 w-auto object-contain mb-3 transition-transform hover:scale-105"
  loading="lazy"
/>
                <h3 className="text-md font-medium text-gray-700 text-center">
                  {entreprise.nom}
                </h3>
                <p className="text-xs text-gray-500">{entreprise.secteur}</p>
                <a 
                  href={entreprise.lien} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-600 hover:text-emerald-800 mt-1 hover:underline"
                >
                  Visiter le site
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Aucune entreprise trouvée {secteurSelectionne ? `dans le secteur ${secteurSelectionne}` : ''}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default References;