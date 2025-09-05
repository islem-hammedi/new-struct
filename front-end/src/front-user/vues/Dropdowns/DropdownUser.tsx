import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Hooks/useAuthUser";

const DropdownUser = ({ dropdownOpen, toggleDropdown }: any) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (user?.isFormateur) {
      navigate("/profil_formateur");
    } else {
      navigate("/profil_participant");
    }
    toggleDropdown(false);
  };

  const handleLogout = () => {
    logout();
    toggleDropdown(false);
    navigate("/");
  };

  return (
    <div className="relative">
      <div onClick={toggleDropdown} className="flex items-center gap-4 cursor-pointer">
        <span className="hidden text-right lg:block">
          <span className="block text-sm font-medium text-black dark:text-white">
            {user?.nom_complet}
          </span>
          <span className="block text-xs">{user?.isFormateur ? "Formateur" : "Participant"}</span>
        </span>
      </div>

      {dropdownOpen && (
        <div className="absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
            <li>
              <button
                onClick={handleProfileClick}
                className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
              >
                Mon Profil
              </button>
            </li>

            <li>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3.5 text-sm font-medium text-red-500 duration-300 ease-in-out hover:text-red-700"
              >
                Se déconnecter
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropdownUser;