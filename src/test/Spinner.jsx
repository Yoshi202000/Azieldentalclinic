import React from 'react';
import './spinner.css'; // Optional: You can create a CSS file for styling

const Spinner = () => {
  return (
    <div className="spinner">
      {/* You can use a simple CSS spinner or an animated GIF */}
      <div className="loader"></div>
    </div>
  );
};

export default Spinner;
