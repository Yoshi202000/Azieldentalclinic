import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/HomeFeedback.css'; // Create this file for styling

const HomeFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/feedback/view`);
        setFeedbacks(response.data.slice(0, 3)); // Get only the 3 most recent feedbacks
        setLoading(false);
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
        setError('Failed to load feedbacks. Please try again later.');
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (loading) return <div>Loading feedbacks...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="home-feedback-container">
      <h2>Recent Feedback</h2>
      {feedbacks.length === 0 ? (
        <p>No feedback submissions yet.</p>
      ) : (
        <ul className="home-feedback-list">
          {feedbacks.map((feedback) => (
            <li key={feedback._id} className="home-feedback-item">
              <div className="home-feedback-header">
                <span className="home-feedback-name">{feedback.name}</span>
                <span className="home-feedback-rating">
                  Rating: {feedback.rating} / 5
                </span>
              </div>
              <div className="home-feedback-text">{feedback.feedback}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HomeFeedback;

