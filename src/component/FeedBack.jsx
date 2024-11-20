import React, { useState } from 'react';
import '../styles/FeedBack.css'; // We'll create this file for styling
import DrawerComponent from './Drawers';
import axios from 'axios'; // Make sure to install axios: npm install axios
import Footer from './Footer'
import Chat from './chat';

// At the top of your file, set the base URL for axios
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL; // Use environment variable for server URL

const FeedBack = () => {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all fields are filled in
    if (!rating || !name || !email || !feedback) {
      setErrorMessage('Please fill in all fields before submitting.');
      return;
    }

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
      // Clear error message if submission is successful
      setErrorMessage('');
    } catch (error) {
      console.error('Error submitting feedback:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <>
    <Chat></Chat>
      <DrawerComponent />
      <div className="FBfeedbackContainer">
      <div className="FBfeedback">
        <h2>We'd love to hear your feedback!</h2>
        {showSuccessMessage && (
          <div className="FBsuccess-message">
            Thank you for your feedback!
          </div>
        )}
        {errorMessage && (
          <div className="FBerror-message">
            {errorMessage}
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
      </div>
      <Footer/>
    </>
  );
};

export default FeedBack;
