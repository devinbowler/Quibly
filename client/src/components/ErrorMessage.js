import React from 'react';

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="form-error">
      {message}
    </div>
  );
};

export default ErrorMessage;
