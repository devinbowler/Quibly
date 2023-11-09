import React, { useState } from 'react';
import './Note.css';

function Note({ note, onDelete }) {
  const [title, setTitle] = useState(note.title);
  const [text, setText] = useState(note.text);

  const handleTitleChange = (event) => {
    setTitle(event.target.value);
  };

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this note?');
    if (confirmDelete) {
      onDelete(note.id);
    }
  };

  return (
    <div className="note">
      <button onClick={handleDelete}>X</button>
      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        className="note-title"
        placeholder="Untitled"
      />
      <textarea
        value={text}
        onChange={handleTextChange}
        className="note-text"
        placeholder="I have an idea..."
      />
    </div>
  );
}

export default Note;
