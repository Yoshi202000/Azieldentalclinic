import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/ViewFeedback.css'; // Create this file for styling

const ViewFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get('/api/feedback/view');
        setFeedbacks(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching feedbacks:', err);
        setError('Failed to load feedbacks. Please try again later.');
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
    
      <div className="view-feedback-container">
        <h2>Feedback Submissions</h2>
        {feedbacks.length === 0 ? (
          <p>No feedback submissions yet.</p>
        ) : (
          <ul className="feedback-list">
            {feedbacks.map((feedback) => (
              <li key={feedback._id} className="feedback-item">
                <div className="feedback-header">
                  <span className="feedback-name">{feedback.name}</span>
                  <span className="feedback-email">{feedback.email}</span>
                  <span className="feedback-date">
                    {new Date(feedback.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="feedback-rating">
                  Rating: {feedback.rating} / 5
                </div>
                <div className="feedback-text">{feedback.feedback}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default ViewFeedback;
