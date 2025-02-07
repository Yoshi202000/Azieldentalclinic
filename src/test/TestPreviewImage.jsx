import React, { useState } from "react";

const TestPreviewImage = () => {
  const [number, setNumber] = useState(0); // State to store the user input

  // Handler for input change
  const handleChange = (event) => {
    setNumber(parseInt(event.target.value, 10) || 0); // Convert input to number
  };

  return (
    <div>
      <h1>Image Display</h1>
      <label htmlFor="imageNumber">Enter the number of images to display: </label>
      <input
        type="number"
        id="imageNumber"
        value={number}
        onChange={handleChange}
      />
      <div className="image-container">
        {Array.from({ length: number }, (_, index) => (
          <img
            key={index}
            src={`src/uploads/services${index}.png`}
            alt={`Service ${index}`}
            className="logo"
          />
        ))}
      </div>
    </div>
  );
};

export default TestPreviewImage;
