import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { useAuthContext } from '../hooks/useAuthContext';
import { useTheme } from '../ThemeContext';
import { debounce } from 'lodash';
import MonacoEditor from 'react-monaco-editor';
import './Project.css';
import hljs from 'highlight.js';
import 'highlight.js/styles/default.css';

function Project() {
  const location = useLocation();
  const project = location.state?.project || {};
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { darkMode } = useTheme();
  const [title, setTitle] = useState(project.title || '');
  // Initialize content with a single text block containing the backend text
  const [content, setContent] = useState([{ type: 'text', value: project.text || '' }]);
  const [text, setText] = useState(project.text || '');
  const [saveStatus, setSaveStatus] = useState("All changes saved");

  useEffect(() => {
    // Apply syntax highlighting for code blocks
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightBlock(block);
    });
  }, [content]);

  const handleTextChange = (e) => {
    setText(e.target.value);
  };


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



  // Function to update the value of a content block and maintain the rest of the content
  function updateContentValue(index, newValue) {
    const updatedContent = content.map((item, idx) => idx === index ? { ...item, value: newValue } : item);
    setContent(updatedContent);
  }

  const saveChanges = async () => {
    setSaveStatus("Saving...");
    try {
      // Construct payload from content
      const payload = {
        title,
        text: content.map(item => item.value).join('\n'), // Combine all content into a single string for saving
      };
      // Simulate a save operation with a PATCH request
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
        setSaveStatus("Error saving changes");
      }
    } catch (error) {
      console.error("Failed to save changes:", error);
      setSaveStatus("Error saving changes");
    }
  };

  const debouncedSaveChanges = useCallback(debounce(saveChanges, 2000), [title, content]);

  useEffect(() => {
    if (content.length > 0) {
      debouncedSaveChanges();
    }
    // Cleanup function to cancel any pending save when the component unmounts or content changes
    return () => {
      debouncedSaveChanges.cancel();
    };
  }, [content, debouncedSaveChanges]);


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
      <div className="code-block-container">
        <pre className="code-block"><code>{`console.log('Hello, world!');`}</code></pre>
      </div>
    </div>
  );
}

export default Project;
