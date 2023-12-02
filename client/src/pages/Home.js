import React, { useState, useEffect } from 'react';
import "./Home.css";
import { useAuthContext } from "../hooks/useAuthContext";


function Home() {
  const [userName, setUserName] = useState('User');
  const [events, setEvents] = useState([]);
  const { user } = useAuthContext();

  // Fetch Events
  useEffect(() => {
    const fetchEvents = async () => {
      if (user) {
        const response = await fetch('https://quantumix.onrender.com/api/schedule', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        const json = await response.json();
        if (response.ok) {
          setEvents(json);
        }
      }
    };
    fetchEvents();
  }, [user]);

  // Function to format date and time
  const formatDateTime = (dateTime) => {
    // Format the date and time from the dateTime string
    const date = new Date(dateTime);
    return date.toLocaleString(); // Adjust the format as needed
  };

  return (
    <div className="dashboard">
      <h1>Hello, {userName}</h1>
      <div className="events-container">
        {events.map(event => (
          <div key={event._id} className="event">
            <h3>{event.title}</h3>
            <p>{formatDateTime(event.startT)} - {formatDateTime(event.endT)}</p>
            <p>{event.desc}</p>
          </div>
        ))}
      </div>
      {/* Add sections for tasks and projects here */}
    </div>
  );
}

export default Home;
