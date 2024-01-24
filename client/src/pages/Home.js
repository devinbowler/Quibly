import React, { useState, useEffect } from 'react';
import "./Home.css";
import { useAuthContext } from "../hooks/useAuthContext";
import { useNavigate, Navigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import greetingImage from "../images/undraw_coding_re_iv62.svg"

function Home() {
  const [userName, setUserName] = useState('User');
  const [events, setEvents] = useState([]);
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const [projects, setProjects] = useState([]);
  const [rerender, setRerender] = useState(false);
  const [tasks, setTasks] = useState({
    inProgress: [],
    working: []
  });

    // Utility function for date formatting
    const formatDate = (dateString) => {
      const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    };

    // Function to navigate to project page
    const openProjectPage = (project) => {
      navigate('/app/project', { state: { project } });
    };

  const getDueDateText = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return due.toDateString() === today.toDateString() 
      ? 'Today' 
      : due.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const days = [];
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
      days.push(new Date(today.getFullYear(), today.getMonth(), i));
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

    // Function to count events for a specific day
    const countEventsForDay = (day) => {
      return events.filter(event => {
        const eventDate = new Date(event.date); // Assuming 'date' is a property of your event
        return eventDate.toDateString() === day.toDateString();
      }).length;
    };

  // Add a utility function to check if an event is in the future
  const isFutureEvent = (eventDateStr) => {
    const eventDate = new Date(eventDateStr);
    const today = new Date();
    return eventDate >= today;
  };

  useEffect(() => {
    // When the component mounts
    document.body.classList.add('homepage-body');

    // When the component unmounts
    return () => {
      document.body.classList.remove('homepage-body');
    };
  }, []);

  // Fetch Events
  useEffect(() => {
    const fetchEvents = async () => {
      if (user) {
        try {
          const response = await fetch('https://quantumix.onrender.com/api/schedule', {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
  
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const json = await response.json();
          const upcomingEvents = json.filter(event => isFutureEvent(event.date));
          setEvents(upcomingEvents);
        } catch (error) {
          console.error('Failed to fetch:', error);
        }
      }
    };
    fetchEvents();
  }, [user]);

    // Fetch Projects
    useEffect(() => {
      const fetchProjects = async () => {
        if (user && user.token) {
          try {
            const response = await fetch('https://quantumix.onrender.com/api/projects', {
              headers: {
                'Authorization': `Bearer ${user.token}`
              }
            });
            const data = await response.json();
            if (response.ok) {
              setProjects(data);
            } else {
              console.error('Error fetching projects:', data);
            }
          } catch (error) {
            console.error("Error fetching projects:", error);
          }
        }
      };
  
      fetchProjects();
    }, [user]);
  
useEffect(() => {
  const fetchTasks = async () => {
    if (user && user.token) {
      try {
        // Fetch Tasks
        const response = await fetch('https://quantumix.onrender.com/api/tasks/', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          },
          cache: 'no-cache', // This will force the request to bypass the cache
        });
        const json = await response.json();

        console.log("Fetched tasks:", json);

        if (response.ok) {
          setTasks(json);
          setRerender(prev => !prev); // Toggle rerender state to force rerender
          console.log("Updated tasks state:", json); // This should log the tasks state after it's set
        } else {
          console.error('Error fetching projects:', json);
        }

      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks({ inProgress: [], working: [] });
      }
    }
  };

  fetchTasks();
}, [user]);

    const getGreetingTime = (date) => {
      const hour = date.getHours();
      if (hour < 12) return 'Good morning';
      if (hour < 18) return 'Good afternoon';
      return 'Good evening';
  };

  const getFormattedDate = () => {
      const date = new Date();
      const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
      return date.toLocaleDateString('en-US', options);
  };

// Combine inProgress and working tasks
const combinedTasks = [...tasks.inProgress, ...tasks.working];

  // Simply check if combinedTasks is 4 or more and log the result
if (combinedTasks.length >= 4) {
  console.log("More than 4 tasks, displaying without placeholders");
} else {
  console.log("Less than 4 tasks, placeholders may be added");
}

// Determine the correct number of tasks or placeholders to display
const displayedTasks = combinedTasks.length >= 4
  ? combinedTasks.slice(0, 4)
  : [
      ...combinedTasks,
      ...Array.from({ length: 4 - combinedTasks.length }, (_, index) => ({
        title: "No More Tasks",
        _id: `placeholder-${index}`, // Unique key for each placeholder
      })),
    ];

console.log("Displayed tasks:", displayedTasks); // This will log the final tasks to be displayed

// If there are fewer than 4 tasks, fill the remaining slots with placeholders
if (displayedTasks.length < 4) {
  for (let i = displayedTasks.length; i < 4; i++) {
    displayedTasks.push({ title: "No More Tasks", _id: "placeholder" });
  }
}

  const handleSeeAllClick = () => {
    navigate('/app/tasks');
  };

  const taskCount = tasks.inProgress.length + tasks.working.length; // Updated task count
  const eventCount = events.length;
  


    return (
      <div className={`dashboard ${useTheme().darkMode ? "dark-mode" : ""}`}>
    <div className="greeting-section">
        <div className="greeting-content">
            <h1>{getGreetingTime(new Date())}, {userName}!</h1>
            <p>{getFormattedDate()}</p>
            <div className="summary-bubbles">
                <div className="summary-bubble">
                    <p className="summary-desc">You have {taskCount} tasks due today, and {eventCount} events for today. Let's have a great day!</p>
                </div>
            </div>
        </div>
        <div className="summary-image">
          <div className="image-container">
              <img src={greetingImage} alt="Greeting" />
            </div>
      </div>
      </div>

      {/* Calendar and Events Section */}
      <div className="calendar-events-section">
        <div className="mini-calendar-home">
          {calendarDays.map(day => (
            <div key={day.getDate()} className="calendar-day">
              <span>{day.getDate()}</span>
              {countEventsForDay(day) > 0 && <span className="event-dot"></span>}
            </div>
          ))}
        </div>
        <div className="events-list">
          {events.slice(0, 4).map(event => (
            <div key={event.id} className="event-card">
              <p>{event.title}</p>
              <p>{new Date(event.date).toLocaleDateString()}</p>
            </div>
          ))}
          {events.length < 4 && <p>No More Events</p>}
        </div>
      </div>

          <div className="tasks-section">
      <div className="tasks-header">
        <h2>Tasks</h2>
        <button className="see-all" onClick={handleSeeAllClick}>see all</button>
      </div>
      <div className="task-cards-container">
        {displayedTasks.map((task, index) => (
          <div key={task._id} className="task-card-home">
                 {task.title === "No More Tasks" ? (
            <div className="no-more-tasks">{task.title}</div>
          ) : (
              <>
                <div className="task-number">{index + 1}</div>
                <div className="task-details">
                  <h3 className="task-title">{task.title}</h3>
                  <p className="task-date">{getDueDateText(task.dueDate)}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Projects Section */}
      <div className="projects-section">
      <div className="projects-header">
        <h2>Projects</h2>
      </div>
      <div className="projects-container">
        {projects.slice(0, 3).map((project) => (
          <div key={project._id} className="project-card-home">
            <div className="project-details">
              <h3 className="project-title">{project.title}</h3>
              <p className="project-desc">{project.description}</p>
              <p className="project-date">{formatDate(project.dateCreated)}</p>
            </div>
            <button onClick={() => openProjectPage(project)} className="view-project-btn">View</button>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}


export default Home;