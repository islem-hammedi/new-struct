import React from 'react';

// Fonction pour convertir les notes en texte lisible
const getSatisfactionLabel = (value: number): string => {
  switch (value) {
    case 1:
      return " Insuffisant";
    case 2:
      return " Peu satisfaisant";
    case 3:
      return " Satisfaisant";
    case 4:
      return " Très satisfaisant";
    default:
      return "❓ Non évalué";
  }
};

const getDureeLabel = (duree: number): string => {
  switch (duree) {
    case 1:
      return " Longue";
    case 2:
      return " Courte";
    case 3:
      return " Convenable";
    default:
      return "❓ Non évalué";
  }
};

const Avis = ({
  avisList,
  loading,
  error,
  onClose,
}: {
  avisList: any[];  // Liste des avis à afficher
  loading: boolean;  // Etat pour savoir si les avis sont en train d'être chargés
  error: string | null;  // Erreur potentielle
  onClose: () => void;  // Fonction pour fermer l'affichage des avis
}) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full overflow-y-auto max-h-[90vh]">
        <h2 className="text-lg font-semibold mb-4 text-center">Avis sur la session</h2>

        {/* Affichage du message de chargement */}
        {loading && <p className="text-center text-gray-600">Chargement des avis...</p>}

        {/* Affichage des erreurs */}
        {error && <p className="text-center text-red-500">{error}</p>}

        {/* Affichage des avis */}
        {avisList.length > 0 ? (
          avisList.map((avis) => (
            <div key={avis.id_avis} className="mb-6">
              <table className="w-full border-collapse border border-gray-300">
                <tbody>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2 text-left w-1/3">📅 Date </th>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(avis.date_creation).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">👤  Participant</th>
                    <td className="border border-gray-300 px-4 py-2">{avis.nom_complet}</td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">💬 Observation et suggestions</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {avis.commentaire || "Aucun commentaire"}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Adaptation du programme à la vie professionnels</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.adaptation_programme_vie_pro)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Moyens pédagogiques</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.moyens_pedagogiques_utilises)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Convenance des horaires </th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.convenance_horaires_formation)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Apports professionnels</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.apports_niveau_professionnel)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Qualité de la documentation distribuée</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.qualite_documentation_distribuee)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Maîtrise globale des sujets présentés</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.maitrise_globale_sujets_presentes)}
                    </td>
                  </tr>   <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Traitement d’exemples vécus au travail</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.traitement_exemples_travail)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Animations des séances</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.animations_seances)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Homogénénité du groupe</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.homogeneite_groupe)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Degré de satisfaction à vos attentes</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getSatisfactionLabel(avis.satisfaction_attentes)}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">📌 Durée</th>
                    <td className="border border-gray-300 px-4 py-2">
                      {getDureeLabel(avis.duree_formation)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">Aucun avis disponible.</p>
        )}

        {/* Bouton pour fermer la fenêtre */}
        <div className="flex justify-center mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Avis;
