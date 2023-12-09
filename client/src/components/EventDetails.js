// EventDetails.js
import React, { useState, useEffect } from 'react';
import './EventDetails.css';
import { parseTime } from "../pages/Schedule"; 
import Draggable from 'react-draggable';
import EventForm from './EventForm';
import { useAuthContext } from '../hooks/useAuthContext';
import { useTheme } from '../ThemeContext'; // Adjust the path as necessary

const EventDetails = ({ event, closeDetails, events, setEvents }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(event); 
  const { user } = useAuthContext()
  const { darkMode } = useTheme();

  const handleDelete = async () => {
    if (!user) {
      return
    }
    const response = await fetch(`https://quantumix.onrender.com/api/schedule/${event._id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });
  
    if (response.ok) {
      setEvents(prevEvents => prevEvents.filter(e => e._id !== event._id));
      setShowDeleteModal(false); 
      closeDetails(); // Close the event details after deletion.
    }
  };

  const handleUpdate = (updatedEvent) => {
    setEvents(events.map((e) => (e._id === updatedEvent._id ? updatedEvent : e)));
    setCurrentEvent(updatedEvent); 
    setShowEditForm(false);
  };

  const iconStyles = {
    fontSize: '1.5rem',
    marginRight: '10px',
    cursor: 'pointer',
    color: 'black',
    WebkitFilter: 'grayscale(100%)', /* Safari 6.0 - 9.0 */
    filter: 'grayscale(100%)'
  };

  return (
    <>
      <Draggable handle=".event-details-header">
        <div className="event-details-container" onClick={closeDetails}>
          <div className="event-details" onClick={(e) => e.stopPropagation()}>
            <div className={`event-details-header ${darkMode ? 'event-details-header' : ''}`}>
              <button className="icon-button delete-button" onClick={() => setShowDeleteModal(true)}>
                🗑️
              </button>
              <button className="icon-button edit-button" onClick={() => setShowEditForm(true)}>
                ✏️
              </button>
              <button className={`icon-button close-button ${darkMode ? 'icon-button close-button' : ''}`} onClick={closeDetails}>
                &times;
              </button>
            </div>
            <div className={`event-details-text ${darkMode ? 'event-details-text' : ''}`}>
              <h2>{event.title}</h2>
              <p>
                <strong>Date:</strong> {new Date(event.startT).toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong> {parseTime(event.startT)} - {parseTime(event.endT)}
              </p>
              <p>
                <strong>Description:</strong> {event.desc}
              </p>
            </div>
          </div>
        </div>
      </Draggable>
      {showDeleteModal && (
        <div className={`delete-modal ${darkMode ? 'delete-modal' : ''}`}>
          <div className="delete-modal-content">
            <h2>Are you sure you want to delete this event?</h2>
            <div className="delete-modal-buttons">
              <button onClick={handleDelete}>Yes</button>
              <button onClick={() => setShowDeleteModal(false)}>No</button>
            </div>
          </div>
        </div>
      )}
      {showEditForm && (
        <EventForm
          event={currentEvent}
          closeForm={() => setShowEditForm(false)}
          events={events}
          setEvents={setEvents}
          handleUpdate={handleUpdate} // Pass handleUpdate as a prop
          isEdit={true}
        />
      )}
    </>
  );
};

export default EventDetails;