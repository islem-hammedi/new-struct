import React, { useState, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BellIcon } from "@heroicons/react/24/outline";
import { Trash2 } from "lucide-react";
import axios from "axios";

interface Cart {
  cartId: number;
  action: "commander" | "demander_devis";
  participant: {
    nom_participant: string;
    email_participant: string;
    tel_participant: number;

  };
  sessions: ParticipationRequest[];
}

interface ParticipationRequest {
  id_session: number;
  theme: string;
  date_debut: string;
  date_fin: string;
  formateur: string;
}


interface EventFormateur {
  id_event: number;
  id_formateur: number;
   nom_complet: string;
  title: string;
  date: string;
}
const DropdownNotification = () => {
  const [requests, setRequests] = useState<Cart[]>([]);
  const [eventrequests, eventsetRequests] = useState<EventFormateur[]>([]);


  useEffect(() => {
    console.log("Chargement brut depuis localStorage :", localStorage.getItem("globalCart"));

    try {
      const storedRequests = localStorage.getItem("globalCart") || "[]";
      const parsedRequests: Cart[] = JSON.parse(storedRequests);
      console.log("Données parsées :", parsedRequests);

      if (!Array.isArray(parsedRequests)) {
        console.warn("Les données récupérées ne sont pas un tableau. Réinitialisation...");
        localStorage.setItem("globalCart", JSON.stringify([]));
        setRequests([]);
      } else {
        setRequests(parsedRequests); // Afficher tous les cart
      }
    } catch (error) {
      console.error("Erreur de parsing JSON :", error);
      localStorage.setItem("globalCart", JSON.stringify([]));
      setRequests([]);
    }
  }, []);
   useEffect(() => {
    console.log("Chargement brut depuis localStorage :", localStorage.getItem("eventFormateur"));

    try {
      const storedRequests = localStorage.getItem("eventFormateur") || "[]";
      const parsedRequests: EventFormateur[] = JSON.parse(storedRequests);
      console.log("Données parsées :", parsedRequests);

      if (!Array.isArray(parsedRequests)) {
        console.warn("Les données récupérées de event Formateur ne sont pas un tableau. Réinitialisation...");
        localStorage.setItem("eventFormateur", JSON.stringify([]));
        setRequests([]);
      } else {
        eventsetRequests(parsedRequests);
      }
    } catch (error) {
      console.error("Erreur de parsing JSON :", error);
      localStorage.setItem("eventFormateur", JSON.stringify([]));
      eventsetRequests([]);
    }
  }, []);

  const handleAction = async (cartId: number, action: "confirm" | "refuse") => {
    try {
      const cart = requests.find((cart) => cart.cartId === cartId);
      if (!cart) {
        console.error("Cart introuvable");
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/apiUser/formations/send-email`, {
        subject: action === "confirm" ? "Confirmation de la session" : "Refus de la session",
        body: action === "confirm" 
          ? "Votre demande a été confirmée. Merci de votre inscription." 
          : "Désolé, votre demande a été refusée.",
        email: cart.participant.email_participant,
      });

      if (response.status === 200) {
        console.log("Email envoyé avec succès");
        const updatedRequests = requests.filter((cart) => cart.cartId !== cartId);
        setRequests(updatedRequests);
        localStorage.setItem("globalCart", JSON.stringify(updatedRequests));
        console.log("Données mises à jour dans localStorage:", updatedRequests);
      } else {
        console.error("Erreur lors de l'envoi de l'email:", response);
      }
    } catch (error) {
      console.error("Erreur lors de la gestion de l'action :", error);
    }
  };

  const handleRemoveItem = (cartId: number) => {
    // Remove the cart only if the action is "demander_devis"
    const cart = requests.find((cart) => cart.cartId === cartId);
    if (cart && cart.action === "demander_devis"||"event_formateur") {
      const updatedRequests = requests.filter((cart) => cart.cartId !== cartId);
      setRequests(updatedRequests);
      localStorage.setItem("globalCart", JSON.stringify(updatedRequests));
      console.log("Données mises à jour après suppression :", updatedRequests);
    } else {
      console.log("Suppression non autorisée pour cette action");
    }
  };

  // Grouping the requests by cartId and action
  const groupedRequests = requests.reduce((acc, cart) => {
    const key = `${cart.cartId}-${cart.action}`;
    if (!acc[key]) {
      acc[key] = cart; // Add the cart if it's not already in the accumulator
    }
    return acc;
  }, {} as { [key: string]: Cart });

  // Convert the grouped object back to an array
  const uniqueRequests = Object.values(groupedRequests);

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative flex items-center p-2 rounded-full hover:bg-gray-200 overflow-y-auto">
        <BellIcon className="h-6 w-6 text-gray-600" />
        {uniqueRequests.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {uniqueRequests.length}
          </span>
        )}
      </Menu.Button>

      <Transition
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg flex flex-col shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-3">
            <h3 className="text-lg font-semibold mb-2">Notifications</h3>
            {uniqueRequests.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucune demande en attente.</p>
            ) : (
              uniqueRequests.map((cart) => (
                <div key={cart.cartId} className="border-b py-2">
                  <div className="text-sm font-semibold mb-2">
                    {cart.participant.nom_participant || "Inconnu"} (Email:{" "}
                    {cart.participant.email_participant || "Inconnu"})(Telephone:{" "}
                    {cart.participant.tel_participant || "Inconnu"})

                  </div>

                  {cart.themes?.map((theme) => (
  <div key={theme.id_theme} className="p-3">
    <p className="text-sm">{theme.theme || "Thème non disponible"}</p>
    <p className="text-xs text-gray-500">{theme.code}</p>
  </div>
))}

                  {cart.action === "commander" && (
                    <div className="flex gap-2 mt-2">
                      <p>voir la commande </p>
                      <button
                        className="bg-green-500 text-white text-xs py-1 px-3 rounded-md"
                        onClick={() => handleAction(cart.cartId, "confirm")}
                      >
                        Confirmer
                      </button>
                      <button
                        className="bg-red-500 text-white text-xs py-1 px-3 rounded-md"
                        onClick={() => handleAction(cart.cartId, "refuse")}
                      >
                        Annuler
                      </button>
                    </div>
                  )}

                  {cart.action === "demander_devis" && (
                    <div className="flex items-center justify-between mt-2">
                      <p>voir la demande de devis</p>
                      <button
                        onClick={() => handleRemoveItem(cart.cartId)}
                        className="right-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default DropdownNotification;




{/*
import React, { useState, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BellIcon } from "@heroicons/react/24/outline";
import { Trash2 } from "lucide-react";
import axios from "axios";

interface Cart {
  cartId: number;
  action: "commander" | "demander_devis";
  participant: {
    nom_participant: string;
    email_participant: string;
    tel_participant: number;

  };
  sessions: ParticipationRequest[];
}

interface ParticipationRequest {
  id_session: number;
  theme: string;
  date_debut: string;
  date_fin: string;
  formateur: string;
}

interface EventNotification {
  id_event: number;
  title: string;
  date: string;
  created_by: string;
  isNew?: boolean;
}
const DropdownNotification = () => {
  const [requests, setRequests] = useState<Cart[]>([]);
  const [eventNotifications, setEventNotifications] = useState<EventNotification[]>([]);


  useEffect(() => {
    console.log("Chargement brut depuis localStorage :", localStorage.getItem("globalCart"));

    try {
      const storedRequests = localStorage.getItem("globalCart") || "[]";
      const parsedRequests: Cart[] = JSON.parse(storedRequests);
      console.log("Données parsées :", parsedRequests);

      if (!Array.isArray(parsedRequests)) {
        console.warn("Les données récupérées ne sont pas un tableau. Réinitialisation...");
        localStorage.setItem("globalCart", JSON.stringify([]));
        setRequests([]);
      } else {
        setRequests(parsedRequests); // Afficher tous les cart
      }
    } catch (error) {
      console.error("Erreur de parsing JSON :", error);
      localStorage.setItem("globalCart", JSON.stringify([]));
      setRequests([]);
    }
  }, []);
    // Charger les notifications d'événements
  useEffect(() => {
    const loadEventNotifications = () => {
      try {
        const storedEvents = localStorage.getItem('eventNotifications') || '[]';
        const parsedEvents: EventNotification[] = JSON.parse(storedEvents);
        
        // Marquer les nouveaux événements non lus
        const withNewStatus = parsedEvents.map(event => ({
          ...event,
          isNew: event.isNew !== false // Conserve le statut ou marque comme nouveau
        }));
        
        setEventNotifications(withNewStatus);
      } catch (error) {
        console.error("Error loading event notifications:", error);
        setEventNotifications([]);
      }
    };

    loadEventNotifications();
    
    // Écouter les changements dans localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'eventNotifications') {
        loadEventNotifications();
      }
    };
    // Marquer une notification comme lue
  const markAsRead = (eventId: number) => {
    setEventNotifications(prev => 
      prev.map(event => 
        event.id_event === eventId ? {...event, isNew: false} : event
      )
    );
    
    // Mettre à jour le localStorage
    const updated = eventNotifications.map(event => 
      event.id_event === eventId ? {...event, isNew: false} : event
    );
    localStorage.setItem('eventNotifications', JSON.stringify(updated));
  };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAction = async (cartId: number, action: "confirm" | "refuse") => {
    try {
      const cart = requests.find((cart) => cart.cartId === cartId);
      if (!cart) {
        console.error("Cart introuvable");
        return;
      }

      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/apiUser/formations/send-email`, {
        subject: action === "confirm" ? "Confirmation de la session" : "Refus de la session",
        body: action === "confirm" 
          ? "Votre demande a été confirmée. Merci de votre inscription." 
          : "Désolé, votre demande a été refusée.",
        email: cart.participant.email_participant,
      });

      if (response.status === 200) {
        console.log("Email envoyé avec succès");
        const updatedRequests = requests.filter((cart) => cart.cartId !== cartId);
        setRequests(updatedRequests);
        localStorage.setItem("globalCart", JSON.stringify(updatedRequests));
        console.log("Données mises à jour dans localStorage:", updatedRequests);
      } else {
        console.error("Erreur lors de l'envoi de l'email:", response);
      }
    } catch (error) {
      console.error("Erreur lors de la gestion de l'action :", error);
    }
  };

  const handleRemoveItem = (cartId: number) => {
    // Remove the cart only if the action is "demander_devis"
    const cart = requests.find((cart) => cart.cartId === cartId);
    if (cart && cart.action === "demander_devis"||"event_formateur") {
      const updatedRequests = requests.filter((cart) => cart.cartId !== cartId);
      setRequests(updatedRequests);
      localStorage.setItem("globalCart", JSON.stringify(updatedRequests));
      console.log("Données mises à jour après suppression :", updatedRequests);
    } else {
      console.log("Suppression non autorisée pour cette action");
    }
  };

  // Grouping the requests by cartId and action
  const groupedRequests = requests.reduce((acc, cart) => {
    const key = `${cart.cartId}-${cart.action}`;
    if (!acc[key]) {
      acc[key] = cart; // Add the cart if it's not already in the accumulator
    }
    return acc;
  }, {} as { [key: string]: Cart });

  // Convert the grouped object back to an array
  const uniqueRequests = Object.values(groupedRequests);

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative flex items-center p-2 rounded-full hover:bg-gray-200 overflow-y-auto">
        <BellIcon className="h-6 w-6 text-gray-600" />
        {uniqueRequests.length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
            {uniqueRequests.length}
          </span>
        )}
      </Menu.Button>

      <Transition
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg flex flex-col shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-3">
            <h3 className="text-lg font-semibold mb-2">Notifications</h3>
            {eventNotifications.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-sm text-gray-500 mb-1">Nouveaux événements</h4>
                {eventNotifications.map(event => (
                  <div 
                    key={`event-${event.id_event}`} 
                    className={`border-b py-2 ${event.isNew ? 'bg-blue-50' : ''}`}
                    onClick={() => markAsRead(event.id_event)}
                  >
                    <div className="text-sm font-semibold">
                      {event.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      Créé par: {event.created_by}
                    </div>
                    <div className="text-xs">
                      Date: {new Date(event.date).toLocaleDateString()}
                    </div>
                    {event.isNew && (
                      <span className="inline-block mt-1 bg-blue-500 text-white text-xs px-1 rounded">
                        Nouveau
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {uniqueRequests.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucune demande en attente.</p>
            ) : (
              uniqueRequests.map((cart) => (
                <div key={cart.cartId} className="border-b py-2">
                  <div className="text-sm font-semibold mb-2">
                    {cart.participant.nom_participant || "Inconnu"} (Email:{" "}
                    {cart.participant.email_participant || "Inconnu"})(Telephone:{" "}
                    {cart.participant.tel_participant || "Inconnu"})

                  </div>

                  {cart.sessions.map((session) => (
                    <div key={session.id_session} className="p-3">
                      <p className="text-sm">{session.theme || "Thème non disponible"}</p>
                    </div>
                  ))}

                  {cart.action === "commander" && (
                    <div className="flex gap-2 mt-2">
                      <p>voir la commande </p>
                      <button
                        className="bg-green-500 text-white text-xs py-1 px-3 rounded-md"
                        onClick={() => handleAction(cart.cartId, "confirm")}
                      >
                        Confirmer
                      </button>
                      <button
                        className="bg-red-500 text-white text-xs py-1 px-3 rounded-md"
                        onClick={() => handleAction(cart.cartId, "refuse")}
                      >
                        Annuler
                      </button>
                    </div>
                  )}

                  {cart.action === "demander_devis" && (
                    <div className="flex items-center justify-between mt-2">
                      <p>voir la demande de devis</p>
                      <button
                        onClick={() => handleRemoveItem(cart.cartId)}
                        className="right-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default DropdownNotification;
*/}