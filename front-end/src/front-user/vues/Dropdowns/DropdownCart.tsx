import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart } from "lucide-react";
import { useAuth } from "../Hooks/useAuthUser";

interface CartItem {
  cartId: number;
  action: "commander" | "demander_devis";
  participant: {
    id_participant: number;
    nom_participant: string;
    email_participant: string;
    tel_participant: number;
  };
  sessions: {
    id_session: number;
    theme: string;
    date_debut: string;
    date_fin: string;
    formateur: string;
    code: string;
  }[];  
}

const DropdownCart = ({ dropdownOpen = false }: { dropdownOpen?: boolean }) => {
  const [carts, setCarts] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Charger le panier depuis localStorage
  useEffect(() => {
    if (!user) return;
    
    const storedCart = localStorage.getItem(`cart_${user.id_participant}`);
    if (storedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(storedCart);
        setCarts(parsedCart);
      } catch (error) {
        console.error("Error parsing cart from localStorage", error);
        setCarts([]);
      }
    }
  }, [user]);

  const isProfileComplete = () => {
    if (!user) return false;
    
    return (
      user.id_participant &&
      user.nom_complet &&
      user.mail &&
      user.telephone &&
      user.adresse &&
      user.nature_participant &&
      (
        user.nature_participant === "personne" || 
        (user.nature_participant === "entreprise" && 
          user.nom_entreprise &&
          user.tel_entreprise &&
          user.email_entreprise &&
          user.adr_entreprise)
      )
    );
  };

  // Supprimer une session du panier
  const handleRemoveItem = (sessionId: number) => {
    if (!user) return;
    
    const updatedCarts = carts.map(cart => ({
      ...cart,
      sessions: cart.sessions.filter(session => session.id_session !== sessionId)
    })).filter(cart => cart.sessions.length > 0);

    setCarts(updatedCarts);
    localStorage.setItem(`cart_${user.id_participant}`, JSON.stringify(updatedCarts));
  };

  // Mettre à jour globalCart dans localStorage
  const updateGlobalCart = (cart: CartItem) => {
    const storedGlobalCart = localStorage.getItem("globalCart");
    const globalCart: CartItem[] = storedGlobalCart ? JSON.parse(storedGlobalCart) : [];
    
    globalCart.push(cart);
    localStorage.setItem("globalCart", JSON.stringify(globalCart));
  };

  // Passer la commande
  const handleOrder = () => {
    if (!user || carts.length === 0) return;
    if (!isProfileComplete()) {
      navigate("/profil_participant");
      alert("Veuillez compléter votre profil avant de passer une commande.");
      return;
    }
    carts.forEach(cart => {
      const cartToSave = {
        ...cart,
        action: "commander",
        participant: {
          id_participant: user.id_participant,
          nom_participant: user.nom_complet,
          email_participant: user.mail,
          tel_participant: user.telephone
        }
      };
      
      updateGlobalCart(cartToSave);
    });
    localStorage.removeItem(`cart_${user.id_participant}`);
    setCarts([]);
  };

  // Demander un devis
  const handleQuoteRequest = () => {
    if (!user || carts.length === 0) return;

    if (!isProfileComplete()) {
      navigate("/profil_participant");
      alert("Veuillez compléter votre profil avant de demander un devis.");
      return;
    }

    carts.forEach(cart => {
      const cartToSave = {
        ...cart,
        action: "demander_devis",
        participant: {
          id_participant: user.id_participant,
          nom_participant: user.nom_complet,
          email_participant: user.mail,
          tel_participant: user.telephone
        }
      };
      
      updateGlobalCart(cartToSave);
    });

    localStorage.removeItem(`cart_${user.id_participant}`);
    setCarts([]);
  };

  // Calculer le nombre total d'items dans le panier
  const totalItems = carts.reduce((sum, cart) => sum + cart.sessions.length, 0);

  return (
    <div
      className={`absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 
        transition-transform duration-200 ease-out transform ${dropdownOpen ? "opacity-100 scale-100 translate-y-2" : "opacity-0 scale-95 pointer-events-none"}`}
    >
      <div className="bg-white shadow-lg rounded-lg p-4 min-h-[200px] flex flex-col">
        {totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center text-gray-500 h-full">
            <ShoppingCart size={50} className="text-gray-300 mb-3" />
            <p className="text-sm">Votre panier est vide</p>
            <Link to="/Catalogue" className="mt-4">
              <button className="bg-gray-700 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition">
                Retour au catalogue
              </button>
            </Link>
          </div>
        ) : (
          <>
            {carts.flatMap(cart =>
              cart.sessions.map(session => (
                <div key={session.id_session} className="flex justify-between items-center mb-3 border-b pb-2">
                  <div>
                    <p className="font-medium">{session.theme}</p>
                    <p className="text-sm text-gray-500">{session.code}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(session.id_session)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
            
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={handleOrder}
                className="bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 transition duration-300 w-full"
              >
                Passer la commande
              </button>
              <button
                onClick={handleQuoteRequest}
                className="bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 transition duration-300 w-full"
              >
                Demande de devis
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DropdownCart;