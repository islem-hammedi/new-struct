import React, { createContext, useState, useEffect } from 'react';

// Définition du type de l'utilisateur
interface User {
  token: string;
  id_admin: number;
  nom_admin: string;
  telephone: number;
  acces: string;
}

// Création du contexte d'authentification
export const AuthContext = createContext<any | null>(null);

// Fournisseur de contexte pour gérer l'authentification
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Déduire l'état de connexion (isLoggedIn)
  const isLoggedIn = user !== null && user.token !== undefined;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser && storedUser !== 'undefined') {
      try {
        const parsedUser = JSON.parse(storedUser);

        const currentTime = Date.now();
        if (parsedUser.token && parsedUser.expirationTime > currentTime) {
          setUser(parsedUser); // L'utilisateur est encore valide
        } else {
          console.log("Session expirée");
          setUser(null); // L'utilisateur a expiré
          localStorage.removeItem('user'); // Supprimer l'utilisateur de localStorage
        }
      } catch (error) {
        console.error("Erreur lors du parsing de l'utilisateur depuis localStorage:", error);
        setUser(null); // Si l'utilisateur est mal formé, réinitialiser à null
      }
    } else {
      setUser(null); 
    }

    setLoading(false); // Fin du chargement après avoir vérifié les données
  }, []);

  const login = (userData: User) => {
    if (!userData.token) {
      console.error("Token manquant dans les données utilisateur");
      return;
    }

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1); // Expiration après une heure

    // Créer le cookie avec le token
    document.cookie = `token=${userData.token}; expires=${expirationDate.toUTCString()}; path=/`;

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Sauvegarder l'utilisateur dans localStorage
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Supprimer l'utilisateur du stockage local
    document.cookie = 'token=; Max-Age=-99999999; path=/'; // Supprimer le cookie du token (avec path)
  };

  return (
    <AuthContext.Provider value={{ user,setUser, isLoggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};