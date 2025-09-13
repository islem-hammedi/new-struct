import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid/index.js';
import interactionPlugin from '@fullcalendar/interaction/index.js';
import frLocale from '@fullcalendar/core/locales/fr.js';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuthAdmin';

const Calendrier: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    axios.get(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/calendrierEvent/get`)
      .then(response => {
        const formattedEvents = response.data.map((event: any) => ({
          id: event.id,
          title: event.title,
          start: event.date,
          created_by: event.created_by,
          extendedProps: {
            created_by: event.created_by,
          },
        }));
        setEvents(formattedEvents);
      })
      .catch(error => console.error('Erreur lors de la récupération des événements :', error));
  };

  const handleDateClick = (info: any) => {
    const title = prompt("Entrez le titre de l'événement :");
    if (title) {
      axios.post(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/calendrierEvent/create`, { title, date: info.dateStr, created_by: user.nom_admin }, {
        headers: { Authorization: `${localStorage.getItem('token')}` }
      })
      .then(response => {
        fetchEvents();
      })
      .catch(error => console.error('Erreur lors de la création de l\'événement :', error));
    }
  };

  const handleEventClick = (info: any) => {
    const token = localStorage.getItem('token');
  
    if (!token) {
      alert('Vous devez être connecté pour effectuer cette action.');
      return;
    }
  
    if (info.event.extendedProps.created_by === user.nom_admin) {
      if (window.confirm(`Voulez-vous supprimer l'événement : "${info.event.title}" ?`)) {
        axios.delete(`${import.meta.env.VITE_APP_API_URL}/apiAdmin/calendrierEvent/${info.event.id}`, {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        })
        .then(() => {
          fetchEvents();
        })
        .catch(error => {
          if (error.response && error.response.status === 401) {
            alert('Accès refusé. Vous n\'avez pas les autorisations nécessaires pour supprimer cet événement.');
          } else {
            console.error('Erreur lors de la suppression de l\'événement :', error);
          }
        });
      }
    } else {
      alert('Vous ne pouvez supprimer que vos propres événements.');
    }
  };

  const getEventColor = (eventId: string): string => {
    if (!isNaN(Number(eventId))) {
      const colorIndex = parseInt(eventId) % 3;
      
      switch (colorIndex) {
        case 0:
          return 'bg-violet-100';
        case 1:
          return 'bg-teal-100';
        case 2:
          return 'bg-blue-100';
        default:
          return 'bg-violet-200';
      }
    } else {
      let hash = 0;
      for (let i = 0; i < eventId.length; i++) {
        hash = eventId.charCodeAt(i) + ((hash << 5) - hash);
      }
      const colorIndex = Math.abs(hash) % 3;
      
      switch (colorIndex) {
        case 0:
          return 'bg-violet-200';
        case 1:
          return 'bg-yellow-200';
        case 2:
          return 'bg-pink-100';
        default:
          return 'bg-violet-200';
      }
    }
  };

  const renderEventContent = (eventInfo: any) => {
    const colorClass = getEventColor(eventInfo.event.id);
    
    return (
      <div className={`${colorClass} p-1 rounded w-full`}>
        <b>{eventInfo.event.title}</b>
        <br />
        <i>Créateur: {eventInfo.event.extendedProps.created_by}</i>
      </div>
    );
  };
  
  return (
    <div className="App p-4">
      <h1 className="text-1xl text-left text-gray-500 font-semibold mb-4">Marquez vos événements...</h1>
      
      <style>
        {`
          .fc-header-toolbar {
            margin-bottom: 1em;
          }
          .fc-toolbar-chunk {
            display: flex;
            align-items: center;
          }
          .fc-toolbar-title {
            font-size: 1.5em;
            font-weight: 600;
            color: #6D28D9;
          }
          .fc-button {
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
            background-color: #993bd0ff;
            border: none;
          }
          .fc-button:hover {
            background-color: #5B21B6;
          }
          .fc-button:active, .fc-button:focus {
            outline: none;
            box-shadow: none;
          }
          .fc-prev-button, .fc-next-button {
            margin-left: 0.5rem;
          }
          .fc-today-button {
            background-color: #8B5CF6;
          }
          .fc-today-button:hover {
            background-color: #7C3AED;
          }
        `}
      </style>
      
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={frLocale}
        headerToolbar={{
          left: '',
          center: 'title',
          right: 'prev,next today'
        }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        editable
        selectable
        eventContent={renderEventContent}
        height="auto"
      />
    </div>
  );
};

export default Calendrier;