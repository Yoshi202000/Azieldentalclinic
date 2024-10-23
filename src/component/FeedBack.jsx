import React, { useState } from 'react';
import '../styles/FeedBack.css'; // We'll create this file for styling
import DrawerComponent from './Drawers';
import axios from 'axios'; // Make sure to install axios: npm install axios

// At the top of your file, set the base URL for axios
axios.defaults.baseURL = 'http://localhost:5000'; // or whatever your server URL is

const FeedBack = () => {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting feedback:', { rating, name, email, feedback });
      const response = await axios.post('/api/feedback/submit', { rating, name, email, feedback });
      console.log('Server response:', response.data);
      // Reset form after submission
      setRating(0);
      setName('');
      setEmail('');
      setFeedback('');
      // Show success message
      setShowSuccessMessage(true);
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <>
      <DrawerComponent />
      <div className="FBfeedback">
        <h2>We'd love to hear your feedback!</h2>
        {showSuccessMessage && (
          <div className="FBsuccess-message">
            Thank you for your feedback!
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="FBrating-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`FBstar ${star <= rating ? 'FBactive' : ''}`}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <textarea
            placeholder="Your Feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
          ></textarea>
          <button type="submit">Submit Feedback</button>
        </form>
      </div>
    </>
  );
};

export default FeedBack;
