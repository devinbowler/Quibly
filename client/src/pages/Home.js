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

  // Add state for the current month and year
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const [isHovered, setIsHovered] = useState(false);

  // State for notes
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);

    // Fetch notes on component mount
    useEffect(() => {
      const fetchNotes = async () => {
        try {
          const response = await fetch('https://quantumix.onrender.com/api/notes', {
            headers: {
              'Authorization': `Bearer ${user.token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const notesData = await response.json();
          setNotes(notesData);
        } catch (error) {
          console.error('Failed to fetch notes:', error);
        }
      };
  
      if (user) {
        fetchNotes();
      }
    }, [user]);

  // Function to handle adding a new note correctly
  const handleAddNote = async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newNote.trim()) {
        try {
          const response = await fetch('https://quantumix.onrender.com/api/notes', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`,
            },
            body: JSON.stringify({ text: newNote.trim() }),
          });
          const addedNote = await response.json();
          if (!response.ok) {
            throw new Error(addedNote.error);
          }
          setNotes([...notes, addedNote]);
          setNewNote(""); // Clear the textarea
        } catch (error) {
          console.error('Failed to add note:', error);
        }
      }
    }
  };



  // Function to delete a note
  const handleDeleteNote = async (noteId) => {
    try {
      const response = await fetch(`https://quantumix.onrender.com/api/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete note');
      }
      setNotes(notes.filter(note => note._id !== noteId));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

    // Function to update a note's text
    const handleUpdateNote = async (noteId, newText) => {
      try {
        const response = await fetch(`https://quantumix.onrender.com/api/notes/${noteId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`,
          },
          body: JSON.stringify({ text: newText }),
        });
        const updatedNote = await response.json();
        if (!response.ok) {
          throw new Error(updatedNote.error);
        }
        setNotes(notes.map(note => note.id === noteId ? updatedNote : note));
      } catch (error) {
        console.error('Failed to update note:', error);
      }
    };

      // Handler when the note text area changes
      const handleNoteChange = (e) => {
        setNewNote(e.target.value);
      };

      // Handler when editing is done (on blur or Enter key press)
      const handleFinishEditing = (noteId) => {
        handleUpdateNote(noteId, newNote);
        setEditingNoteId(null);
        setNewNote("");
      };


  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };


  // Function to navigate months
  const navigateMonth = (offset) => {
    const newMonth = currentMonth + offset;
    setCurrentMonth(newMonth % 12);
    setCurrentYear(currentYear + Math.floor(newMonth / 12));
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

  const generateCalendarDays = (year, month) => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    const days = [];
    // Start from the first day of the week in the current month
    for (let i = startDate.getDay(); i > 0; i--) {
      days.unshift(new Date(year, month, -i + 1));
    }
    // Fill the days of the current month
    for (let i = 1; i <= endDate.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    // Fill the remaining days to complete the week
    for (let i = 1; days.length % 7 !== 0; i++) {
      days.push(new Date(year, month + 1, i));
    }
    return days;
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
  
          // Log the raw data
          console.log('Fetched events:', json);
  
          // Assuming the backend sends dates in ISO format
          const upcomingEvents = json.filter(event => 
            new Date(event.startT) >= new Date()
          );
  
          // Log the filtered events
          console.log('Upcoming events:', upcomingEvents);
  
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

const placeholdersCount = 4 - events.length;

const displayedEvents = events.length >= 4
  ? events.slice(0, 4)
  : [
      ...events,
      ...Array.from({ length: 4 - events.length }, (_, index) => ({
        _id: `placeholder-${index}`, // Unique key for each placeholder
        placeholder: true, // A flag to indicate this is a placeholder
      })),
    ];

  const handleSeeAllClick = () => {
    navigate('/app/tasks');
  };

  const handleViewEvent  = () => {
    navigate('/app/schedule');
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
                You have {taskCount} {taskCount === 1 ? 'task' : 'tasks'} due, and {eventCount} upcoming {eventCount === 1 ? 'event' : 'events'}. Let's have a great day!
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
    <div className={`calendar-events-section ${useTheme().darkMode ? "dark-mode" : ""}`}>
    <div className="notepad-container">
      {notes.map((note) => (
        <div key={note.id} className="note">
          {editingNoteId === note.id ? (
            <textarea
              value={newNote}
              onChange={handleNoteChange}
              onBlur={() => handleFinishEditing(note.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault(); // Prevents newline on Enter key
                  handleFinishEditing(note.id);
                }
              }}
            />
          ) : (
            <div
              className="note-text"
              onClick={() => {
                setEditingNoteId(note.id);
                setNewNote(note.text);
              }}
            >
              {note.text}
            </div>
          )}
          <div className="note-controls">
            <span className="dot-menu">...</span>
            <div className="dropdown-content">
              <button onClick={() => {
                setEditingNoteId(note.id);
                setNewNote(note.text);
              }}>Edit</button>
              <button className="delete" onClick={() => handleDeleteNote(note.id)}>Delete</button>
            </div>
          </div>
        </div>
      ))}
      <textarea
        placeholder="Start typing to add a new note..."
        value={newNote}
        onChange={handleNoteChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            handleAddNote(e);
          }
        }}
      />
</div>

  {/* Events List */}
  <div className="events-list">
    {/* First, render all available events */}
    {events.slice(0, 4).map((event, index) => (
      <div key={event._id || index} className="event-card">
        <div className="event-date">
          <span className="weekday">
            {new Date(event.startT).toLocaleDateString('en-US', { weekday: 'short' })}
          </span>
          <span className="day-number">
            {new Date(event.startT).getDate()}
          </span>
        </div>
        <div className="event-details-home">
          <p className="event-title">{event.title}</p>
          <p className="event-time">
            {new Date(event.startT).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - 
            {new Date(event.endT).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="event-extra">
        <button 
        className="event-action" 
        onClick={() => handleViewEvent(event._id)}
      >
        View
      </button>
        </div>
      </div>
    ))}
    {/* Then, render placeholders if necessary */}
    {Array.from({ length: placeholdersCount }, (_, index) => (
      <div key={`placeholder-${index}`} className="event-card placeholder">
        <div className="event-date-placeholder">No Events</div>
        <div className="event-details-placeholder" />
      </div>
    ))}
  </div>
      </div>

      <div className={`tasks-section ${useTheme().darkMode ? "dark-mode" : ""}`}>
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
      <div className={`projects-section ${useTheme().darkMode ? "dark-mode" : ""}`}>
        <div className="projects-header">
          <h2>Projects</h2>
        </div>
        <div className="projects-container">
          {projects.slice(0, 3).map((project) => (
            <div key={project._id} className="project-card-home" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <div className="project-header">
                <h3 className="project-title">{project.title}</h3>
                <button className="view-project-arrow" onClick={() => openProjectPage(project)}>
                  →
                </button>
              </div>
              <div className="project-details">
                <p className="project-desc">{project.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default Home;