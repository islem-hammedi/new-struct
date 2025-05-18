import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from '../Hooks/useAuthUser';
import LoginMenu from "../LoginMenu";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import generateUniqueCartId from "../Dropdowns/DropdownCart";
//import FormateurTheme from "./FormateurTheme";
import ThemeComments from "../Comments/ThemeComments"; 

interface Theme {
  id_theme: number;
  theme: string;
  code: string;
}



interface Formation {
  id_domaine: number;
  domaine: string;
  themes: Theme[];
}


const Catalogue: React.FC = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sessionSearchQuery, setSessionSearchQuery] = useState("");
  const [filteredFormations, setFilteredFormations] = useState<Formation[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {user, isLoggedIn} = useAuth();
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null); // État pour le thème sélectionné

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/apiUser/formations/Form`)
      .then((response) => {
        setFormations(response.data);
        setFilteredFormations(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);
  
  const handleThemeClick = (theme: Theme) => {
    setSelectedTheme(theme);
  };
  const handleBackToCatalogue = () => {
    setSelectedTheme(null);
  };
  if (loading) return <p className="text-center text-gray-600">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">Erreur: {error}</p>;

  const handleSearchToggle = () => setShowSearchBar(!showSearchBar);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === "") {
      setFilteredFormations(formations);
      return;
    }
  
    const filtered = formations.filter((formation) => {
      const matchesDomaine = formation.domaine.toLowerCase().includes(query);
      const matchesTheme = formation.themes.some((theme) =>
        theme.theme.toLowerCase().includes(query) || theme.code.toLowerCase().includes(query)
      );
      return matchesDomaine || matchesTheme;
    });
  
    setFilteredFormations(filtered);
  };
  const handleAjout = (theme: Theme) => {
    if (isLoggedIn) {
      const storedCart = localStorage.getItem(`cart_${user.id}`); // Utilisation de user.id
      const cart = storedCart ? JSON.parse(storedCart) : [];
      const storedCartId = localStorage.getItem("currentCartId");
      const cartId = storedCartId ? parseInt(storedCartId) : generateUniqueCartId();
      localStorage.setItem("currentCartId", cartId.toString());
  
      const newCartItem = {
        cartId,
        action: "demander_devis",
        participant: {
          id_participant: user.id, // Utilisation de user.id au lieu de user.id_participant
          nom_participant: user?.nom_admin || "",
          email_participant: user?.email || "",
        },
        themes: [theme],
      };
  
      const existingCartItem = cart.find((item: any) => item.cartId === cartId);
      if (existingCartItem) {
        existingCartItem.themes.push(theme);
      } else {
        cart.push(newCartItem);
      }
  
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart)); // Utilisation de user.id
      console.log("Panier mis à jour", cart);
    } else {
      setShowLoginMenu(true);
    }
  };
  
  

  const handleSessionSearchChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSessionSearchQuery(e.target.value);

  // Extraire les domaines uniques des formations filtrées
  const domainesUniques = Array.from(new Set(filteredFormations.map((f) => f.domaine)));

  if (selectedTheme) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <button 
          onClick={handleBackToCatalogue}
          className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded inline-flex items-center"
        >
          ← Retour au catalogue
        </button>
        <ThemeComments themeId={selectedTheme.id_theme} themeName={selectedTheme.theme} />
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto p-4">
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-teal-600 text-center flex-grow">Explorez Notre Catalogue </h1>
        <button onClick={handleSearchToggle} className="bg-white text-[#82b89a] p-2 rounded-full shadow hover:text-black">
          🔍
        </button>
      </div>
      {showLoginMenu && !isLoggedIn && <LoginMenu onClose={() => setShowLoginMenu(false)} />}

      {showSearchBar && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-5">
          <input
            type="text"
            placeholder="Rechercher une formation ou un thème..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full h-10 p-2 border border-black rounded-lg bg-white text-[#82b89a]"
          />
        </motion.div>
      )}

      {domainesUniques.length === 0 ? (
        <p className="text-center text-gray-500 px-4 py-2">Aucune formation trouvée.</p>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {domainesUniques.map((domaine) => {
            const formationsDuDomaine = filteredFormations.filter((f) => f.domaine === domaine);
            return (
              <div key={domaine} className="bg-gray-100 text-black rounded-1xl p-6 shadow-lg transform hover:scale-10 hover:shadow-2xl transition-all cursor-pointer">
                {/* ... (votre code existant pour l'en-tête de domaine) */}
                
                <div className="mt-4">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-300/60 text-1l text-gray-500">
                        <th className="p-3 font-semibold text-left">Thèmes</th>
                        <th className="p-3 font-semibold text-left">Code</th>
                        <th className="p-3 font-semibold text-left">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formationsDuDomaine.flatMap((formation) =>
                        formation.themes
                          .filter((theme) =>
                            theme.theme.toLowerCase().includes(sessionSearchQuery.toLowerCase())
                          )
                          .map((theme) => (
                            <tr 
                              key={theme.id_theme} 
                              className="hover:bg-gray-100"
                              onClick={() => handleThemeClick(theme)}
                              style={{ cursor: 'pointer' }}
                            >
                              <td className="p-2 border">{theme.theme}</td>
                              <td className="p-2 border">{theme.code}</td>
                              <td className="p-2 border text-right gap-3">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); // Empêche le déclenchement du click sur la ligne
                                    handleAjout(theme);
                                  }}
                                  className="bg-teal-500 text-white py-1 px-3 rounded-md hover:bg-teal-600"
                                  disabled={isSubmitting}
                                >
                                  {isSubmitting ? "En cours..." : "Ajouter au panier"}
                                </button>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


export default Catalogue;