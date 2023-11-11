import './EventForm.css';
import Draggable from 'react-draggable';
import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import { useEventsContext } from '../hooks/useEventsContext';


const extractTimeFromISOString = (isoString) => {
  return isoString?.split('T')[1]?.substring(0, 5); // extracts HH:MM from the ISO string
}


const EventForm = ({ event, selectedDayIndex, closeForm, events, setEvents, isEdit, days }) => {
  const [title, setTitle] = useState(isEdit ? event.title : '');
  const [startTime, setStartTime] = useState(isEdit ? extractTimeFromISOString(event.startT) : '');
  const [endTime, setEndTime] = useState(isEdit ? extractTimeFromISOString(event.endT) : '');
  const [description, setDescription] = useState(isEdit ? event.desc : '');
  const [color, setColor] = useState("#c0392b");

  const [error, setError] = useState(null)
  const { user } = useAuthContext()

  const handleCloseOnEscape = (e) => {
    if (e.key === 'Escape') {
      closeForm();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleCloseOnEscape);
    return () => {
      window.removeEventListener('keydown', handleCloseOnEscape);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in')
      return
    }
  
    if (!isEdit) {
      if (!days || selectedDayIndex >= days.length || selectedDayIndex < 0) {
        console.error("Invalid days array or index.");
        return;
      }
    }
  
    const getSimpleDate = (dateStr) => {
      const d = new Date(dateStr);
      return d.toISOString().split('T')[0];
    }
  
    const selectedDate = isEdit ? getSimpleDate(event.startT) : getSimpleDate(days[selectedDayIndex]);
  
    console.log("Selected Date:", selectedDate);
    console.log("Start Time:", startTime);
    console.log("End Time:", endTime);
  
    const updatedEvent = {
      title: title,
      desc: description,
      color: color,
      startT: `${selectedDate}T${startTime}:00`,  // Added seconds for ISO format
      endT: `${selectedDate}T${endTime}:00`
    };
  
    console.log("Data being sent to the server:", updatedEvent);
  
    const method = isEdit ? 'PATCH' : 'POST';
    const apiUrl = `https://quantumix.onrender.com/api/schedule${isEdit ? `/${event._id}` : ''}`;
  
    const response = await fetch(apiUrl, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.token}`,
      },
      body: JSON.stringify(updatedEvent)
    });
  
    let responseData = await response.json(); // Only calling response.json() once
  
    if (!response.ok) {
        console.error('Response status:', response.status);
        console.error('Response status text:', response.statusText);
        console.error('Response body:', responseData);
    } else {
      // Process responseData here
      setEvents(prevEvents => {
        const updatedEvents = isEdit ? prevEvents.map(e => e._id === responseData._id ? responseData : e) : [...prevEvents, responseData];
        return updatedEvents;
      });
    }
  
    closeForm();
  };

  return (
    <Draggable handle=".event-form-header">
      <div className="event-form-container">
        <div className="event-form">
          <div className="event-form-header">
            <button className="close-button" onClick={closeForm}>
              X
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <label htmlFor="color">Color</label>
            <input
              type="color"
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
            <label htmlFor="startTime">Start Time</label>
            <input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <label htmlFor="endTime">End Time</label>
            <input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
            <button type="submit">Save</button>
          </form>
        </div>
      </div>
    </Draggable>
  );
};

export default EventForm;
