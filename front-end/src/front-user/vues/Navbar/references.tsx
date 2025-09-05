{/*import React, { useState } from 'react';
import i from "/nexteam.png";
import im from "/elhlel.png";
import ima from "/monatech.png";
import imag from "/somalec.png";
import env from "/enfavet.png";
import be from "/be.png"
import vnh from "/vnh.png";
import sor from "/soromap.png"
import ep from "/ep.png"
import col from "/col.png"
import onh from "/onh.png";
import cons from "/cons.png";
import m from "/m.png";
import emka from "/emka.png";
import sy from "/sy.png";
import h from "/h.png";
import somi from "/somi.png";
import sun from "/sun.png";
import mode from "/mode.png";
import enis from "/enis.png";
import iset from "/iset.png";
import enim from "/enim.png";
import Footer from "../Footer";

const References = () => {
  // État pour le secteur sélectionné
  const [secteurSelectionne, setSecteurSelectionne] = useState('Tout');
  
  // Données des entreprises avec secteur associé
  const entreprises = [
    // Agroalimentaire
    { nom: 'ONH', logo: onh, site: 'https://www.onh.com.tn/', secteur: 'Agroalimentaire' },
    
    // Construction Métallique
    { nom: 'Nexteam', logo: i, site: 'https://nexteam.com', secteur: 'Construction Métallique' },
    { nom: 'CHIMICOULEURS', logo: cons, site: 'http://cce.com.tn/', secteur: 'Construction Métallique' },
    { nom: 'COLMAR', logo: col, site: 'https://colmar.com', secteur: 'Construction Métallique' },
    { nom: 'MAKLADA', logo: m, site: 'http://www.maklada.com/', secteur: 'Construction Métallique' },

    // Électrique
    { nom: 'Somalec', logo: imag, site: 'https://somalec.com', secteur: 'Électrique' },
    { nom: 'EMKA', logo: emka, site: 'https://www.emka-med.com/', secteur: 'Électrique' },
    { nom: 'SYLVANIA', logo: sy, site: 'https://www.sylvania-group.com/fr-FR/page-daccueil-professionnels/', secteur: 'Électrique' },

    
    // Impression et emballage
    { nom: 'HELIA PACK', logo: h, site: 'https://www.emploitunisie.com/recruteur/146544', secteur: 'Impression et emballage' },
    { nom: 'Elhlel', logo: im, site: 'https://elhlel.com', secteur: 'Impression et emballage' },

    // Injection plastique
    { nom: 'MONATECH', logo: ima, site: 'https://www.bt-africa.com/fr/entreprise/MTA2NzA1Mg-societe-ste-monatech?RC=B2752112007&IF=1014616J', secteur: 'Injection plastique' },
    { nom: 'SOMIPEM', logo: somi, site: 'https://www.ugfsnorthafrica.com.tn/fr/portfolio/somipem/', secteur: 'Injection plastique' },
    { nom: 'SUNPLASTIK', logo: sun, site: 'https://www.ugfsnorthafrica.com.tn/fr/portfolio/somipem/', secteur: 'Injection plastique' },

    // Instituts d'enseignement supérieur
    { nom: 'INSTITUT SUPERIEUR DES METIERS DE LA MODE DE MONASTIR', logo: mode, site: 'https://ismm.rnu.tn/', secteur: 'Instituts d\'enseignement supérieur' },
    { nom: 'ECOLE NATIONALE D\'INGENIEURS DE SOUSSE', logo: enis, site: 'http://www.eniso.rnu.tn/', secteur: 'Instituts d\'enseignement supérieur' },
    { nom: 'Institut Supérieur des Etudes Technologiques de Ksar Hellal', logo: iset, site: 'https://isetkh.rnu.tn/', secteur: 'Instituts d\'enseignement supérieur' },
    { nom: 'ECOLE NATIONALE D\'INGENIEURS DE MONASTIR', logo: enim, site: 'http://www.eniso.rnu.tn/', secteur: 'Instituts d\'enseignement supérieur' },

    // Textile
    { nom: 'ENVAFET', logo: env, site: 'https://envafet.com', secteur: 'Textile' },
    { nom: 'SOROMAP', logo: sor, site: 'https://soromap.com', secteur: 'Textile' },
    { nom: 'EPSYLON', logo: ep, site: 'https://epsylon.com', secteur: 'Textile' },

    { nom: 'BECOTEX', logo: be, site: 'https://becotex.com', secteur: 'Textile' },
    { nom: 'VNH', logo: vnh, site: 'https://vnh.com', secteur: 'Textile' },
  ];

  // Filtrer les entreprises selon le secteur sélectionné
  const entreprisesFiltrees = secteurSelectionne === 'Tout' 
    ? entreprises 
    : entreprises.filter(entreprise => entreprise.secteur === secteurSelectionne);

  // Liste des secteurs disponibles
  const secteurs = [
    'Tout',
    'Agroalimentaire',
    'Construction Métallique',
    'Électrique',
    'Impression et emballage',
    'Injection plastique',
    'Instituts d\'enseignement supérieur',
    'Textile'
  ];

  return (
    <section className="bg-white/90 backdrop-blur-md py-10 px-8 sm:px-10 lg:px-8 border-t border-emerald-100">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-teal-600 text-center flex-grow">NOS REFERENCES</h2>
        
       
        <div className="my-8 flex flex-wrap justify-center gap-2">
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
                key={entreprise.nom}
                className="flex flex-col items-center p-4 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <img 
                  src={entreprise.logo} 
                  alt={`Logo ${entreprise.nom}`}
                  className="h-16 w-auto object-contain mb-3 transition-transform hover:scale-105"
                  loading="lazy"
                />
                <h3 className="text-md font-medium text-gray-700 text-center">
                  {entreprise.nom}
                </h3>
                <p className="text-xs text-gray-500">{entreprise.secteur}</p>
                <a 
                  href={entreprise.site} 
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
            <p className="text-gray-500">Aucune entreprise trouvée dans ce secteur</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default References;*/}







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