

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import { 
  personOutline, cartOutline,logoFacebook,mailOutline,  shieldCheckmarkOutline ,
  callOutline,logoLinkedin,fishOutline,menuOutline,closeOutline
} from "ionicons/icons";
import logo from "/image.png";
import LoginMenu from "./LoginMenu";
import DropdownUser from "./Dropdowns/DropdownUser"; 
import DropdownCart from "./Dropdowns/DropdownCart";
import { useAuth } from "./Hooks/useAuthUser";
import { personAddOutline } from 'ionicons/icons';
import FormateurCandidatureForm from "./Navbar/Candidature";
const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const Links = [
    { name: "CATALOGUE", link: "/Catalogue" },
    { name: "CALENDRIER", link: "/Calendrier" },
    ...(user && !user.isFormateur ? [{ name: "AVIS", link: "/avis_formation" }] : []),
    ...(user && user.isFormateur ? [{ name: "AVIS", link: "/avis_formateur" }] : []),
    { name: "NOS REFERENCES", link: "/references" },
    { name: "CONTACT", link: "/Footer" },
  ];

const socialLinks = [
    { name: "Facebook", icon: logoFacebook, link: "https://www.facebook.com/SacConsulting", text: "Suivez-nous sur Facebook" },
    { name: "Email", icon: mailOutline, link: "mailto:marketing@sac-consulting.com", text: "marketing@sac-consulting.com" },
    { name: "Phone", icon: callOutline, link: "tel:73467357", text: "73 46 73 57" },
    { name: "LinkedIn", icon: logoLinkedin, link: "https://www.linkedin.com/in/sac-consulting-35544b135/", text: "Notre LinkedIn" },
    { name: "Viadeo", icon: fishOutline, link: "http://www.viadeo.com/p/0021co5qvdaukcah", text: "Notre Viadeo" },
    { 
        name: "Recrutement Formateur", 
        text: "Recrutement Formateur", 
        link: "/formateur-candidature",
        icon: null,
        isTextOnly: true
    },    { name: "Admin", icon: shieldCheckmarkOutline, link: "/Admin", text: "Espace Administrateur" },
];

  const handleImageClick = () => {
    navigate("/");
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
    setCartDropdownOpen(false); 
  };

  const toggleCartDropdown = () => {
    setCartDropdownOpen(!cartDropdownOpen);
    setUserDropdownOpen(false); 
  };

  const handleRequestFormationClick = () => {
    if (!user) {
      setShowLoginMenu(true);
      setIsMobileMenuOpen(false);
    } else {
      navigate("/demander_formation");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
        setCartDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <>
   <div className="fixed top-0 left-0 w-full z-30">
  <div className="bg-white shadow-sm h-8 flex items-center justify-between relative z-20">
    <div className="flex items-center space-x-8 px-10">
  {socialLinks.slice(0, -1).map((social) => (
    <div 
      key={social.name}
      className="relative group"
      onMouseEnter={() => setHoveredItem(social.name)}
      onMouseLeave={() => setHoveredItem(null)}  
    >
      <Link 
        to={social.link} 
        className={`flex flex-col items-center text-gray-600 hover:text-teal-500 transition-colors duration-300 ${
          social.isTextOnly ? "text-sm font-medium" : ""
        }`}
      >
        {social.icon ? (
          <IonIcon icon={social.icon} className="text-xl" />
        ) : (
          <span>{social.text}</span>
        )}
        {hoveredItem === social.name && (
          <span className="absolute top-10 z-30 text-xs bg-teal-400/80 text-gray-800 px-2 py-1 rounded whitespace-nowrap shadow-sm border border-gray-200">
            {social.text}
          </span>
        )}
      </Link>
    </div>
  ))}
</div>
    
    <div className="pr-10">
      <div 
        className="relative group"
        onMouseEnter={() => setHoveredItem("Admin")}
        onMouseLeave={() => setHoveredItem(null)}
      >
        <Link 
          to={socialLinks[socialLinks.length - 1].link} 
          className="flex flex-col items-center text-gray-600 hover:text-teal-500 transition-colors duration-300"
        >
          <IonIcon icon={shieldCheckmarkOutline} className="text-xl" />
          {hoveredItem === "Admin" && (
            <span className="absolute top-10 right-0 z-30 text-xs bg-teal-400/80 text-gray-800 px-2 py-1 rounded whitespace-nowrap shadow-sm border border-gray-200">
              {socialLinks[socialLinks.length - 1].text}
            </span>
          )}
        </Link>
      </div>
    </div>
 

  </div>

  <div className="bg-white bg-opacity-90 backdrop-blur-lg shadow-md relative z-10"><div className="flex justify-between items-center h-12 md:h-20 relative">
            <div className="h-full flex items-center pl-8 md:pl-10">
              <img
                src={logo}
                alt="Logo"
                className="h-20 w-auto cursor-pointer"
                onClick={handleImageClick}
              />
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-2xl text-gray-700 px-4"
            >
              <IonIcon icon={isMobileMenuOpen ? closeOutline : menuOutline} />
            </button>

            <ul className={`md:flex h-full items-stretch ${
              isMobileMenuOpen ? "block absolute top-full left-0 right-0 bg-white shadow-lg" : "hidden"
            }`}>
              {Links.map((link) => (
                <li key={link.name} className="h-full flex items-center">
                  <Link 
                    to={link.link}
                    className="
                      relative px-4 md:px-6 h-full flex items-center
                      text-gray-700 hover:text-white 
                      transition-all duration-300
                      before:absolute before:inset-0 before:bg-teal-500 
                      before:opacity-0 before:transition-all before:duration-300
                      hover:before:opacity-100
                      z-10
                    "
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="relative z-20">{link.name}</span>
                  </Link>
                </li>
              ))}
              <li className="h-full flex items-center">
                <button
                  onClick={handleRequestFormationClick}
                  className="
                    relative px-4 md:px-6 h-full flex items-center
                    text-gray-700 hover:text-white 
                    transition-all duration-300
                    before:absolute before:inset-0 before:bg-teal-500 
                    before:opacity-0 before:transition-all before:duration-300
                    hover:before:opacity-100
                    z-10 w-full text-left
                  "
                >
                  <span className="relative z-20">DEMANDE DE FORMATION</span>
                </button>
              </li>
            </ul>

            <div className="relative flex items-center pr-4 md:pr-10" ref={dropdownRef}>
              {user ? (
                <div className="flex items-center">
                   <img
        src={JSON.parse(localStorage.getItem("user") || "{}").photo_profil || "/profileDefault.png"}
        className="h-10 w-10 rounded-full object-cover border border-gray-700 cursor-pointer"
        onClick={toggleUserDropdown}
        alt="Photo de profil"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/profileDefault.png';
        }}
      />

                  {!user.isFormateur && (
                    <IonIcon
                      icon={cartOutline}
                      className="text-2xl text-gray-700 cursor-pointer ml-4"
                      onClick={toggleCartDropdown}
                    />
                  )}
                </div>
              ) : (
                <IonIcon
                  icon={personOutline}
                  className="text-2xl text-gray-700 cursor-pointer"
                  onClick={() => {
                    setShowLoginMenu(true);
                    setIsMobileMenuOpen(false);
                  }}
                />
              )}

              {userDropdownOpen && (
                <DropdownUser dropdownOpen={userDropdownOpen} toggleDropdown={toggleUserDropdown} />
              )}

              {cartDropdownOpen && !user?.isFormateur && (
                <DropdownCart toggleDropdown={toggleCartDropdown} dropdownOpen={cartDropdownOpen} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="h-28 md:h-32"></div>
      
      {showLoginMenu && !user && <LoginMenu onClose={() => setShowLoginMenu(false)} />}
    </>
  );
};

export default Navbar;