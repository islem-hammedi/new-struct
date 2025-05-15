import React, { createContext, useState, useEffect } from "react";

interface User {
  id_formateur?: number;
  id_participant?: number;
  token: string;
  nom_complet: string;
  mail: string;
  badge?:string;
  isFormateur: boolean;
}

export const AuthContext = createContext<any | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isLoggedIn = user !== null && user.token !== undefined;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      try {
        const parsedUser = JSON.parse(storedUser);
        const currentTime = Date.now();

        if (parsedUser.token && parsedUser.expirationTime > currentTime) {
          setUser(parsedUser);
        } else {
          console.log("Session expirée");
          setUser(null);
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Erreur lors du parsing de l'utilisateur depuis localStorage:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = (userData: User) => {
    if (!userData.token) {
      console.error("Token manquant dans les données utilisateur");
      return;
    }

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);
    document.cookie = `token=${userData.token}; expires=${expirationDate.toUTCString()}; path=/`;

    setUser(userData);

    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    document.cookie = "token=; Max-Age=-99999999; path=/";
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, isLoggedIn, login, logout, loading, dropdownOpen, toggleDropdown }}
    >
      {children}
    </AuthContext.Provider>
  );
};