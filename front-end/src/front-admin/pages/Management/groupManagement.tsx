import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaPen } from 'react-icons/fa'; // Juste l'icône FaPen
import Breadcrumb from '../../components/Breadcrumbs/Breadcrumb';

interface Admin {
  id_admin: number;
  nom_admin: string;
  telephone: string;
  email_admin: string;
  role: string;
  poste: string;
  id_acces: number;  // Utilisation de l'id_acces
}

interface Acces {
  id_acces: number;
  nom_acces: string;
}

const GroupManagement = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [accessList, setAccessList] = useState<Acces[]>([]);  // Liste des accès
  const [editingAdminId, setEditingAdminId] = useState<number | null>(null);
  const [accessListVisible, setAccessListVisible] = useState<boolean>(false); // Afficher ou non la liste d'accès
  const [editedAccessId, setEditedAccessId] = useState<number | null>(null);  // L'ID de l'accès sélectionné

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/admin`);
        setAdmins(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des administrateurs :', error);
      }
    };
    
    const fetchAccessList = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/acces`);
        setAccessList(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des accès :', error);
      }
    };

    fetchAdmins();
    fetchAccessList();
  }, []);

  
  // Filtrage global sur nom, poste et accès
  const filteredAdmins = admins.filter((admin) => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    return (
      (admin.nom_admin && admin.nom_admin.toLowerCase().includes(lowerCaseSearch)) ||
      (admin.role && admin.role.toLowerCase().includes(lowerCaseSearch)) ||
      (admin.poste && admin.poste.toLowerCase().includes(lowerCaseSearch)) ||
      (accessList.find(acc => acc.id_acces === admin.id_acces)?.nom_acces.toLowerCase().includes(lowerCaseSearch))  // Filtrage par nom_acces
    );
  });

  // Gestion du changement d'accès
  const handleAccessChange = async (id_admin: number, newAccessId: number) => {
    if (newAccessId === null) return; // Ne pas effectuer de mise à jour si l'ID d'accès est nul
    try {
      await axios.put(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/admin/${id_admin}/acces`, { id_acces: newAccessId });
      setAdmins((prevAdmins) =>
        prevAdmins.map((admin) =>
          admin.id_admin === id_admin ? { ...admin, id_acces: newAccessId } : admin
        )
      );
      setAccessListVisible(false); // Masquer la liste après sélection
      setEditingAdminId(null); // Quitter le mode édition
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'accès :', error);
    }
  };

  return (
    <>
          
    <div className="p-4">
      <h2 className="text-xl text-center text-teal-500 font-semibold mb-4">Gérer les rôles des admin</h2>

      {/* Champ de recherche unique */}
      <div className="relative mb-4">
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, rôle ou accès..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
        />
      </div>

      {/* Tableau des administrateurs */}
      <table className="min-w-full table-auto border-collapse border border-gray-300 shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-6 py-3 text-left border border-gray-300">Nom</th>
            <th className="px-6 py-3 text-left border border-gray-300">Téléphone</th>
            <th className="px-6 py-3 text-left border border-gray-300">Email</th>
            <th className="px-6 py-3 text-left border border-gray-300">Rôle</th>
            <th className="px-6 py-3 text-left border border-gray-300">Poste</th>
            <th className="px-6 py-3 text-left border border-gray-300">Role</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdmins.length > 0 ? (
            filteredAdmins.map((admin) => (
              <tr key={admin.id_admin} className="hover:bg-gray-50">
                <td className="px-6 py-3 border border-gray-300">{admin.nom_admin}</td>
                <td className="px-6 py-3 border border-gray-300">{admin.telephone}</td>
                <td className="px-6 py-3 border border-gray-300">{admin.email_admin}</td>
                <td className="px-6 py-3 border border-gray-300">{admin.role}</td>
                <td className="px-6 py-3 border border-gray-300">{admin.poste}</td>
                <td className="px-6 py-3 border border-gray-300">
                  <div className="relative">
                    {/* Lorsque l'icône de l'édition est cliquée */}
                    <FaPen
                      onClick={() => {
                        setEditingAdminId(admin.id_admin);
                        setAccessListVisible(true); // Afficher la liste des accès
                      }}
                      className="cursor-pointer text-blue-500"
                    />
                    {/* Affichage de la liste d'accès seulement si on est en mode édition */}
                    {accessListVisible && editingAdminId === admin.id_admin && (
                      <ul className="absolute bg-white border border-gray-300 rounded-lg w-full mt-2 z-10">
                        {accessList.map((access) => (
                          <li
                            key={access.id_acces}
                            onClick={() => handleAccessChange(admin.id_admin, access.id_acces)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {access.nom_acces}
                          </li>
                        ))}
                      </ul>
                    )}
                    <span>
                      {accessList.find(acc => acc.id_acces === admin.id_acces)?.nom_acces}
                    </span>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-3 text-center border border-gray-300">
                Aucun administrateur trouvé
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    </>
  );
};

export default GroupManagement;
