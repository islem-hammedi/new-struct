import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart } from "lucide-react";
import { useAuth } from "../Hooks/useAuthUser";

interface CartItem {
  cartId: number;
  action: "commander" | "demander_devis";
  themes: {
    id_theme: number;
    theme: string;
    code: string;
  }[];
  participant: {
    id_participant: number;
    nom_participant: string;
    email_participant: string;
    tel_participant: number;
  };
}

const DropdownCart = ({ dropdownOpen }: { dropdownOpen: boolean }) => {
  const [cart, setCart] = useState<CartItem | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Charger le panier depuis localStorage
  useEffect(() => {
    if (!user) return;
    
    const storedCart = localStorage.getItem(`cart_${user.id}`);
    if (storedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(storedCart);
        if (parsedCart.length > 0) {
          setCart(parsedCart[parsedCart.length - 1]); // Charger uniquement le dernier cart
        }
      } catch (error) {
        console.error("Error parsing cart from localStorage", error);
        setCart(null);
      }
    }
  }, [user]);

  const isProfileComplete = () => {
    if (!user) {
      console.log("User not defined");
      return false;
    }
    
    const fieldsToCheck = {
      id_participant: user.id,
      nom_complet: user.nom_complet,
      mail: user.mail,
      telephone: user.telephone,
    };
  
    for (const [field, value] of Object.entries(fieldsToCheck)) {
      if (!value || value.toString().trim() === '') {
        console.log(`Missing or empty field: ${field}`);
        return false;
      }
    }
  
    return true;
  };
  
  const handleRemoveItem = (themeId: number) => {
    if (!cart || !user) return;
    
    const updatedThemes = cart.themes.filter(theme => theme.id_theme !== themeId);
    
    if (updatedThemes.length === 0) {
      setCart(null);
      localStorage.setItem(`cart_${user.id}`, JSON.stringify([]));
    } else {
      const updatedCart = { ...cart, themes: updatedThemes };
      setCart(updatedCart);
      localStorage.setItem(`cart_${user.id}`, JSON.stringify([updatedCart]));
    }
  };
  /*const handleRemoveItem = (themeId: number) => {
    if (!cart) return;
    const updatedthemes = cart.themes.filter(
      (theme) => theme.id_theme !== themeId
    );
    const updatedCart = { ...cart, themes: updatedthemes };

    setCart(updatedthemes.length > 0 ? updatedCart : null);
    localStorage.setItem("cart_${user.id}", JSON.stringify(updatedthemes.length > 0 ? [updatedCart] : []));
  };*/

  const updateGlobalCart = (updatedCart: CartItem) => {
    const storedGlobalCart = localStorage.getItem("globalCart");
    const globalCart: CartItem[] = storedGlobalCart ? JSON.parse(storedGlobalCart) : [];
    
    const newCartId = globalCart.length > 0 ? globalCart[globalCart.length - 1].cartId + 1 : 1;
    updatedCart.cartId = newCartId;

    globalCart.push(updatedCart);
    localStorage.setItem("globalCart", JSON.stringify(globalCart));
  };

  const handleOrder = () => {
    if (!cart || !user || !cart.themes || cart.themes.length === 0) return;
    
    if (!isProfileComplete()) {
      navigate("/profil_participant");
      return;
    }

    const participantData = {
      id_participant: user.id,
      nom_participant: user.nom_complet,
      email_participant: user.mail,
      tel_participant: user.telephone,
    };

     const updatedCart = {
      ...cart,
      action: "commander" as "commander",
      participant: participantData,
      cartId: cart.cartId || Date.now(),
    };

    updateGlobalCart(updatedCart);
    setCart(null);
    localStorage.removeItem(`cart_${user.id}`);
  };

  const handleQuoteRequest = () => {
    if (!cart || !user || !cart.themes || cart.themes.length === 0) return;

    if (!isProfileComplete()) {
      navigate("/profil_participant");
      return;
    }

    const participantData = {
      id_participant: user.id,
      nom_participant: user.nom_complet,
      email_participant: user.mail,
      tel_participant: user.telephone,
    };

      const updatedCart = {
      ...cart,
      action: "demander_devis" as "demander_devis",
      participant: participantData,
      cartId: cart.cartId || Date.now(),
    };

    updateGlobalCart(updatedCart);
    setCart(null);
    localStorage.removeItem(`cart_${user.id}`);
  };

  return (
    <div
      className={`absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 
        transition-transform duration-200 ease-out transform ${dropdownOpen ? "opacity-100 scale-100 translate-y-2" : "opacity-0 scale-95 pointer-events-none"}`}
    >
      <div className="bg-white shadow-lg rounded-lg p-4 min-h-[200px] flex flex-col">
        {!cart || !cart.themes || cart.themes.length === 0 ? (
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
            {cart.themes.map(theme => (
              <div key={theme.id_theme} className="flex justify-between items-center mb-3 border-b pb-2">
                <div>
                  <p className="font-medium">{theme.theme}</p>
                  <p className="text-sm text-gray-500">{theme.code}</p>
                </div>
                <button
                  onClick={() => handleRemoveItem(theme.id_theme)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            
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