import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ClickOutside from '../ClickOutside';
import User from './../../images/user/user_1.png';
import { useAuth } from '../../hooks/useAuthAdmin';

const DropdownUser = () => {
   const navigate = useNavigate();
   const { user, setUser, isLoggedIn, logout } = useAuth(); // Ajouter logout ici
   const [dropdownOpen, setDropdownOpen] = useState(false);
   const location = useLocation();

   useEffect(() => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (userInfo.nom && userInfo.role) {
         setUser({ nom: userInfo.nom_admin, role: userInfo.role });
      }
   }, [location, setUser]);

   const toggleDropdown = () => {
      setDropdownOpen(!dropdownOpen);
      console.log('Dropdown Open:', !dropdownOpen);
   };

   const handleLogout = () => {
      document.cookie = 'token=; Max-Age=-99999999; Path=/; Secure; HttpOnly; SameSite=Strict';

      localStorage.removeItem('user');
      logout();

      navigate('/Admin/signin');
   };

   return (
      <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
         <div onClick={toggleDropdown} className="flex items-center gap-4 cursor-pointer">
            <span className="hidden text-right lg:block">
               <span className="block text-sm font-medium text-black dark:text-white">
                  {user?.nom_admin }
               </span>
               <span className="block text-xs">
                  {user?.role }
               </span>
            </span>

            <span className="h-12 w-12 rounded-full">
               <img src={User} alt="User" />
            </span>

            
         </div>

         {dropdownOpen && (
            <div className="absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
               <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
                  <li>
                     <Link
                        to="/Admin/profile"
                        className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                     >
                        <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22">
                           <path d="M11 9.62499C8.42188 9.62499 6.35938 7.59687 6.35938 5.12187C6.35938 2.64687 8.42188 0.618744 11 0.618744C13.5781 0.618744 15.6406 2.64687 15.6406 5.12187C15.6406 7.59687 13.5781 9.62499 11 9.62499ZM11 2.16562C9.28125 2.16562 7.90625 3.50624 7.90625 5.12187C7.90625 6.73749 9.28125 8.07812 11 8.07812C12.7188 8.07812 14.0938 6.73749 14.0938 5.12187C14.0938 3.50624 12.7188 2.16562 11 2.16562Z" />
                           <path d="M17.7719 21.4156H4.2281C3.5406 21.4156 2.9906 20.8656 2.9906 20.1781V17.0844C2.9906 13.7156 5.7406 10.9656 9.10935 10.9656H12.925C16.2937 10.9656 19.0437 13.7156 19.0437 17.0844V20.1781C19.0094 20.8312 18.4594 21.4156 17.7719 21.4156ZM4.53748 19.8687H17.4969V17.0844C17.4969 14.575 15.4344 12.5125 12.925 12.5125H9.07498C6.5656 12.5125 4.5031 14.575 4.5031 17.0844V19.8687H4.53748Z" />
                        </svg>
                        Mon Profile
                     </Link>
                  </li>
                  <li>
                     <Link
                        to="/Admin/parametre"
                        className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                     >
                        <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22">
                        </svg>
                        Paramètres
                     </Link>
                  </li>
                  <li>
                     <button
                        onClick={handleLogout} 
                        className="flex items-center gap-3.5 text-sm font-medium text-red-500 duration-300 ease-in-out hover:text-red-700"
                     >
                        <svg className="fill-current" width="22" height="22" viewBox="0 0 22 22">
                         
                        </svg>
                        Se déconnecter
                     </button>
                  </li>
               </ul>
            </div>
         )}
      </ClickOutside>
   );
};

export default DropdownUser;
