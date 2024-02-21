import React, { useState } from 'react';
import { AiOutlinePlus } from 'react-icons/ai';
import { BsFillLightningFill } from 'react-icons/bs';
import { GiStickyBoot } from 'react-icons/gi';
import './AddButton.css';

function AddButton({ onAddProject, onAddNote }) {
  const [showOptions, setShowOptions] = useState(false);

  const handleClick = () => {
    setShowOptions(!showOptions);
  };

  const handleAddProject = (e) => {
    e.stopPropagation(); // This prevents event propagation to the parent (add-button)
    onAddProject();
    setShowOptions(false);
  };

  const handleAddNote = (e) => {
    e.stopPropagation(); // This prevents event propagation to the parent (add-button)
    onAddNote();
    setShowOptions(false);
  };

  return (
    <div className="add-button" onClick={handleClick}>
      {!showOptions && <AiOutlinePlus size={30} />}
      {showOptions && (
        <div className="options">
          <div className="option" onClick={handleAddProject}>
            <span>Project</span>
          </div>
          <div className="option" onClick={handleAddNote}>
            <span>Note</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddButton;
