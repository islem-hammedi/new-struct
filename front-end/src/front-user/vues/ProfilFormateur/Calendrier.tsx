import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import axios from 'axios';

const Calendrier: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
    const userData = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
      fetchEvents();
    }, []);

  // Récupérer les informations de l'utilisateur depuis le localStorage et les événements
  const fetchEvents = () => {
    const token = localStorage.getItem("token");
    axios.get(`${import.meta.env.VITE_APP_API_URL}/api/calendrier`, {
      headers: { Authorization: `Bearer ${userData.token}` }
    })
    .then(response => {
      console.log("Données reçues de l'API :", response.data); 
      const formattedEvents = response.data.map((event: any) => ({
        id: event.id,
        title: event.title,
        start: event.date,  // Assurez-vous que "date" est bien au format YYYY-MM-DD
        extendedProps: {
          created_by: event.created_by || event.nom_complet,
        },
      }));
      setEvents(formattedEvents);
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des événements :', error);
    });
  };    

  // Gérer la création d'un nouvel événement
  const handleDateClick = (info: any) => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      alert("Vous devez être connecté pour effectuer cette action.");
      return;
    }
  
    if (!userData || !userData.nom_complet) {
      alert("Utilisateur non trouvé ou nom manquant.");
      return;
    }
  
  
    const title = prompt("Entrez le titre de l'événement :");
    if (title) {
      axios
        .post(
          `${import.meta.env.VITE_APP_API_URL}/apiAdmin/calendrierEvent/create`,
          {
            title,
            date: info.dateStr,
            created_by: userData.nom_complet,
          },
          {
            headers: { Authorization: `Bearer ${userData.token}` },
          }
        )
        .then((response) => {
          const newEvent = {
            id: response.data.id,  // Utilise l'ID renvoyé par la réponse de l'API
            title,
            start: info.dateStr,
            extendedProps: {
              created_by: userData.nom_complet,
            },
          };
          setEvents((prevEvents) => [...prevEvents, newEvent]);  // Ajoute l'événement à la liste existante
        })
        .catch((error) => {
          console.error("Erreur lors de la création de l'événement :", error);
          alert("Erreur lors de la création de l'événement. Veuillez réessayer.");
        });
    }
  };
  
  
  const handleEventClick = (info: any) => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      alert('Vous devez être connecté pour effectuer cette action.');
      return;
    }
  
    if (!info.event || !info.event.id) {
      console.error("Erreur: l'événement est undefined ou n'a pas d'ID.");
      return;
    }
  
    if (info.event.extendedProps.created_by === userData.nom_complet) {
      if (window.confirm(`Voulez-vous supprimer l'événement : "${info.event.title}" ?`)) {
        axios.delete(`${import.meta.env.VITE_APP_API_URL}/api/calendrier/${info.event.id}`, {
          headers: { Authorization: `Bearer ${userData.token}` }
        })
        .then(() => {
          fetchEvents();  // Récupérer la liste des événements mise à jour
        })
        .catch((error) => {
          console.error('Erreur lors de la suppression de l\'événement :', error);
        });
      }
    } else {
      alert('Vous ne pouvez supprimer que vos propres événements.');
    }
  };
  
  

  const renderEventContent = (eventInfo: any) => {
    return (
      <div>
        <b>{eventInfo.event.title}</b>
        <br />
        <i>Créé par: {eventInfo.event.extendedProps.created_by}</i>
      </div>
    );
  };

  return (
    <div className="App">
      <h1 className="text-2xl font-bold mb-4">Calendrier des événements</h1>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={frLocale}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        editable
        selectable
        eventContent={renderEventContent}
      />
    </div> 
  );
};

export default Calendrier;