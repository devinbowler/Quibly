import React, { useState, useEffect } from "react";
import "./Schedule.css";
import EventForm from "../components/EventForm";
import EventDetails from "../components/EventDetails";
import { useAuthContext } from "../hooks/useAuthContext";
import { useTheme } from '../ThemeContext';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const parseTime = (dateString) => {
  // Convert spaces to "T" to handle both formats
  const adjustedDateString = dateString.replace(' ', 'T');
  const date = new Date(adjustedDateString);
  let hours = date.getHours();  // Use getHours instead of getUTCHours
  let minutes = date.getMinutes();  // Use getMinutes instead of getUTCMinutes
  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  console.log(`Parsed Time: ${hours}:${minutes}`); // Add this line
  return `${hours}:${minutes}`;  
};



const getEventStyle = (event) => {
  const { startTime, endTime } = event;

  const startHours = parseInt(startTime.split(':')[0]);
  const startMinutes = parseInt(startTime.split(':')[1]);
  const endHours = parseInt(endTime.split(':')[0]);
  const endMinutes = parseInt(endTime.split(':')[1]);

  const PIXELS_PER_HOUR = 40;
  const EVENT_PADDING = 5;
  const DAY_HEADER_HEIGHT = 44;
  const top = (startHours * 60 + startMinutes) / 60 * PIXELS_PER_HOUR + DAY_HEADER_HEIGHT;
  const height = ((endHours * 60 + endMinutes) - (startHours * 60 + startMinutes)) / 60 * PIXELS_PER_HOUR - 2 * EVENT_PADDING;

  return {
    top: `${top}px`,
    height: `${height}px`,
  };
};


const initialDate = new Date();

const Schedule = ({ currentDate, setCurrentDate }) => {
  const { darkMode } = useTheme();
  const [events, setEvents] = useState([]);
  const { user } = useAuthContext()

  const onDragEnd = (result) => {
    if (!result.destination) {
      return;
    }
  }

  useEffect(() => {
    // console.log("Running fetchEvents effect."); 
    const fetchEvents = async () => {
      const response = await fetch('https://quantumix.onrender.com/api/schedule', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const json = await response.json();
      if (response.ok) {
        setEvents(json);
        // console.log("Events fetched:", json);
      }
    };

    if (user) {
      fetchEvents();
    }
  }, [user]);

  const changeDays = (offset) => {
    console.log("About to change days by offset", offset);
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    setCurrentDate(newDate);
  };


  const generateDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentDate);
      day.setDate(currentDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const days = generateDays();

  const lastDayOfWeek = days[days.length - 1];

  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);

  const formatHour = (hour) => {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
  };

  const selectDate = (date) => {
    setCurrentDate(new Date(date.getFullYear(), date.getMonth(), date.getDate()));
  };

  const strippedDate = (dateObj) => {
    return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
  };

  const [miniCalendarDate, setMiniCalendarDate] = useState(initialDate);

  const [, forceUpdate] = useState({});

  const changeMiniCalendarMonth = (offset) => {
    console.log("About to change mini calendar month by offset", offset);
    let newDate = new Date(miniCalendarDate);
    newDate.setMonth(miniCalendarDate.getMonth() + offset);
    setMiniCalendarDate(newDate);

    // Force a re-render after changing the miniCalendarDate
    forceUpdate({});
  };

  useEffect(() => {
    setMiniCalendarDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  }, [currentDate]);



  const generateMiniCalendarDates = () => {
    const firstDayOfMonth = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), 1);
    const lastDayOfMonth = new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth() + 1, 0);
    const dates = [];

    for (let i = firstDayOfMonth.getDay(); i > 0; i--) {
      const prevDate = new Date(firstDayOfMonth);
      prevDate.setDate(firstDayOfMonth.getDate() - i);
      dates.push(prevDate);
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      dates.push(new Date(miniCalendarDate.getFullYear(), miniCalendarDate.getMonth(), i));
    }

    let nextDateCounter = 1;
    while (dates.length % 7 !== 0) {
      const nextDate = new Date(lastDayOfMonth);
      nextDate.setDate(lastDayOfMonth.getDate() + nextDateCounter);
      dates.push(nextDate);
      nextDateCounter++;
    }

    return dates;
  };

  const miniCalendarDates = generateMiniCalendarDates();


  return (
    <div className="schedule-container">
      <div className="mini-calendar">
        <div className="mini-calendar-header">
          <span>{miniCalendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
          <div className="arrow-container">
            <span className="arrow" onClick={() => changeMiniCalendarMonth(-1)}>
              &lt;
            </span>
            <span className="arrow" onClick={() => changeMiniCalendarMonth(1)}>
              &gt;
            </span>
          </div>
        </div>
        <div className="mini-calendar-dates">
          {miniCalendarDates.map((date, index) => (
            <div
              key={index}
              className={`mini-calendar-date${miniCalendarDate.getMonth() !== date.getMonth() ? " mini-calendar-date-faded" : ""}`}
              style={
                strippedDate(currentDate).getTime() === strippedDate(date).getTime() ?
                  { backgroundColor: 'rgba(0, 0, 0, 0.1)' } :
                  strippedDate(lastDayOfWeek).getTime() === strippedDate(date).getTime() ?
                    { backgroundColor: 'rgba(0, 0, 0, 0.1)' } :
                    {}
              }
              onClick={() => {
                const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                setCurrentDate(selectedDate);
                // console.log("Setting Mini Calendar Date to:", date.getFullYear(), date.getMonth(), 1);
                setMiniCalendarDate(new Date(date.getFullYear(), date.getMonth(), 1)); // Set to the first day of the month
              }}
            >
              {date.getDate()}
            </div>
          ))}
        </div>
      </div>
      <div className="schedule">
        <div className="time-series">
          {Array.from({ length: 24 }).map((_, index) => (
            <div className={`time-series-label ${darkMode ? "dark-mode-style" : ""}`} key={index}>
              {formatHour(index)}
            </div>
          ))}
        </div>
        <div className="days">
          {days.map((day, index) => (
            <div
              className={`day ${darkMode ? "dark-mode" : ""}`}
              key={index}
              onClick={() => {
                setShowEventForm(true);
                setSelectedDayIndex(index);
                console.log("Selected day: " + day);
              }}
            >
              <div className="day-header">
                <div className="day-prefix">{day.toLocaleDateString("en-US", { weekday: "short" })}</div>
                <div>{day.getDate()}</div>
              </div>
              {events
                .filter((event) => {
                  const eventDay = new Date(event.startT); // Use 'startT' instead of 'date'
                  const isSameDay = (
                    eventDay.getDate() === day.getDate() &&
                    eventDay.getMonth() === day.getMonth() &&
                    eventDay.getFullYear() === day.getFullYear()
                  );
                  return isSameDay;
                })
                .map((event) => {
                  const startTime = parseTime(event.startT);
                  const endTime = parseTime(event.endT);
                  const style = getEventStyle({ startTime, endTime });
                  
                  console.log(`Rendering event: ${event.title}, Start: ${event.startT}, End: ${event.endT}`);
                  return (
                    <div
                    key={event._id}
                    className="event"
                    style={{ backgroundColor: event.color, ...getEventStyle({ startTime, endTime }) }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                      }}
                    >
                      <div className="event-title">{event.title}</div>
                      <div className="event-time">{startTime} - {endTime}</div>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>
      {showEventForm && (
        <EventForm
          selectedDayIndex={selectedDayIndex}
          closeForm={() => setShowEventForm(false)}
          events={events}
          setEvents={setEvents}
          days={days}
        />
      )}
      {selectedEvent && (
        <EventDetails
          event={selectedEvent}
          closeDetails={() => setSelectedEvent(null)}
          events={events}
          setEvents={setEvents}
        />
      )}
    </div>
  );
};

export { parseTime };
export default Schedule;