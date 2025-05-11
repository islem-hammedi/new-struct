import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../hooks/useAuthAdmin";
import Breadcrumb from "../../components/Breadcrumbs/Breadcrumb";

interface Formateur {
  id_formateur: number;
  nom_complet: string;
  mail: string;
  adr: string;
  competences: string;
  themes_a_enseigner: string;
  tarif_journalier: number;
  nb_formations: number;
  tel: string;
  photo: string | null;
  cv: string | null;
  fiche_prg: string | null;
}

const Formateurs: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth(); // Utiliser le hook useAuth pour récupérer l'utilisateur et l'état de connexion
  const [searchTerm, setSearchTerm] = useState("");
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [filteredFormateurs, setFilteredFormateurs] = useState<Formateur[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pdfContent, setPdfContent] = useState<string>("");

        
  useEffect(() => {
    if (!user) return; // Vérifie si l'utilisateur est connecté

    axios
      .get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs`)
      .then((response) => {
        const sortedFormateurs = response.data.sort((a: Formateur, b: Formateur) => b.id_formateur - a.id_formateur);
        setFormateurs(sortedFormateurs);
        setFilteredFormateurs(sortedFormateurs);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération des formateurs:", error.response?.data || error.message);
      });
  }, [user]);
 

  useEffect(() => {
    if (!id || !searchTerm) return;

    // Extraction et recherche dans le PDF
    axios
      .post(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs/extract-pdf-content`, {
        formateurId: id,
        searchTerm: searchTerm,
      })
      .then((response) => {
        setPdfContent(response.data.content || "");
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération du contenu PDF :", error);
        setErrorMessage("Erreur lors de l'extraction du contenu PDF.");
      });
  }, [id, searchTerm]);

  useEffect(() => {
    if (searchTerm === "") {
      setFilteredFormateurs(formateurs);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    const filtered = formateurs.filter((formateur) => {
      const matchesFormateurData = Object.values(formateur).some((field) =>
        field && field.toString().toLowerCase().includes(lowerSearchTerm)
      );
      const matchesPdfContent = pdfContent.toLowerCase().includes(lowerSearchTerm);

      return matchesFormateurData || matchesPdfContent;
    });

    setFilteredFormateurs(filtered);
  }, [searchTerm, formateurs, pdfContent]);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };
  const handleEditClick = (id: number) => {
    if (user.nom_acces === "visiteur") {
      setErrorMessage("Vous n'avez pas l'accès pour modifier un formateur.");
      return;
    }

    navigate(`/Admin/formateur/${id}`);
  };

  const handleDelete = (id: number) => {
    if (user.nom_acces !== "super_admin") {
      setErrorMessage("Vous n'avez pas l'accès pour supprimer un formateur.");
      return;
    }

    axios
      .delete(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/formateurs/${id}`)
      .then(() => {
        const updatedList = formateurs.filter((formateur) => formateur.id_formateur !== id);
        setFormateurs(updatedList);
        setFilteredFormateurs(updatedList);
      })
      .catch((error) => console.error("Erreur lors de la suppression du formateur:", error.response || error.message));
  };

  const handleRowClick = (id: number) => {
    navigate(`/Admin/formateur/${id}`);
  };

  const handleAddClick = () => {
    if (user.nom_acces === "visiteur" || user.nom_acces === "editeur_formation") {
      setErrorMessage("Vous n'avez pas l'accès pour ajouter un formateur.");
      return;
    }

    navigate("/Admin/ajout_formateur");
  };

  return (
    <>
                <h1 className="text-2xl font-bold text-teal-700 text-center flex-grow">Formateurs</h1>


    <div className="container mx-auto p-6 mt-12">
      <input
        type="text"
        placeholder="Rechercher un formateur..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="w-full p-3 mb-6 text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-teal-600"
      />
   <div className="flex justify-end p-4">
      {(user.nom_acces === "super_admin" || user.nom_acces === "editeur formateur") && (
       
        <button
          className="bg-teal-500 text-white px-4 py-2 rounded-lg"
          onClick={handleAddClick}
        >
          + Nouveau Formateur ?
        </button>
        
      )}</div>

      <h2 className="text-red text-xl">{errorMessage}</h2>

      <div className="flex flex-col gap-4">
        {filteredFormateurs.length === 0 ? (
          <p className="text-gray-600">Aucun formateur trouvé</p>
        ) : (
          filteredFormateurs.map((formateur) => (
            <div
              key={formateur.id_formateur}
              className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-md cursor-pointer hover:bg-gray-200"
              onClick={() => handleRowClick(formateur.id_formateur)}
            >
              <div>
                <div className="text-lg font-semibold">{formateur.nom_complet}</div>
                <div className="text-sm text-gray-600">
                  {formateur.themes_a_enseigner || "Aucun thème"}
                </div>
              </div>

              {(user.nom_acces === "super_admin"  || user.nom_acces === "editeur formateur")  && (
                <button
                  className="px-6 py-1 bg-teal-500/80 text-white rounded-lg hover:bg-tela-800 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditClick(formateur.id_formateur);
                  }}
                >
                  Modifier
                </button>
              )}

              {(user.nom_acces === "super_admin "  || user.nom_acces === "editeur formateur") && (
                <button
                  className="px-3 py-1 bg-gray-400 text-white rounded-lg hover:bg-red-600 text-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(formateur.id_formateur);
                  }}
                >
                  Supprimer
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
    </>
  );
};

export default Formateurs;







