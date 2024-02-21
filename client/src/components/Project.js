import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuthContext } from '../hooks/useAuthContext';
import { useTheme } from '../ThemeContext';
import { debounce } from 'lodash';
import './Project.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';

function Project() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const project = state?.project || {};
  const { user } = useAuthContext();
  const { darkMode } = useTheme();
  const [title, setTitle] = useState(project.title || '');
  const [text, setText] = useState(() => {
    return project.text || '';
  });
  const [saveStatus, setSaveStatus] = useState("All changes saved");

  useEffect(() => {
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightBlock(block);
    });
  }, [text]); // Note: changed from [content] to [text] to ensure highlighting updates when text changes


  function handleKeyDown(event) {
    const { key, target } = event;
    let { value, selectionStart, selectionEnd } = target;

    // Bullet insertion and initial indentation with "* " followed by space
    if (key === " " && value[selectionStart - 1] === "*") {
      event.preventDefault();
      const indent = "  "; // Using two spaces for the initial indent
      const newValue = `${value.substring(0, selectionStart - 1)}${indent}• ${value.substring(selectionStart)}`;
      setText(newValue);

      // Adjust the cursor position after the new character
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = selectionStart + indent.length + 1;
      }, 0);
    }

    // Handling indentation and bullet style cycling with Tab
    else if (key === "Tab") {
      event.preventDefault();
      const beforeCursor = value.substring(0, selectionStart);
      const afterCursor = value.substring(selectionEnd);
      const lineStart = beforeCursor.lastIndexOf('\n') + 1;
      const lineText = beforeCursor.substring(lineStart);
      const indent = "  "; // Define the increment of indentation

      let newLineText = lineText;
      let indentChange = 0; // Track change in indentation for cursor adjustment

      // Apply changes based on current bullet
      if (lineText.includes("•")) {
        newLineText = lineText.replace("•", `${indent}◦`);
        indentChange = indent.length; // Increase indentation
      } else if (lineText.includes("◦")) {
        newLineText = lineText.replace("◦", `${indent}▪`);
        indentChange = indent.length; // Further increase indentation
      } else if (lineText.includes("▪")) {
        newLineText = lineText.replace("▪", "•");
        indentChange = -indent.length; // Reset or decrease indentation
      }

      const newValue = `${value.substring(0, lineStart)}${newLineText}${afterCursor}`;
      setText(newValue);

      // Adjust the cursor position after the new character
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = selectionStart + indentChange;
      }, 0);
    }
  }

  const saveChanges = useCallback(async () => {
    setSaveStatus("Saving...");
    try {
      const payload = { title, text }; // Adjusted to use direct text state
      const response = await fetch(`https://quantumix.onrender.com/api/projects/${project._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setSaveStatus("All changes saved");
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error("Failed to save changes:", error);
      setSaveStatus("Error saving changes");
    }
  }, [title, text, user.token, project._id]); // Ensure dependencies are correctly listed

  // Debounced version of saveChanges to limit frequency of calls
  const debouncedSaveChanges = useCallback(debounce(() => saveChanges(), 2000), [saveChanges]);

  useEffect(() => {
    debouncedSaveChanges();

    return () => {
      debouncedSaveChanges.cancel();
    };
  }, [debouncedSaveChanges, text]); // Trigger auto-saving on text changes

  const handleTextChange = (e) => {
    setText(e.target.value);
  };


  return (
    <div className={`project ${darkMode ? 'dark-mode' : ''}`}>
      <div className="static-head">
        <button className="back-button" onClick={() => navigate('/app/visionboard')}>
          <FiArrowLeft />
        </button>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="project-title"
          placeholder="Untitled"
        />
        <div className="save-status">{saveStatus}</div>
      </div>
      <textarea
        value={text}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        className="project-text"
        placeholder="Start typing here..."
      />
    </div>
  );
}

export default Project;