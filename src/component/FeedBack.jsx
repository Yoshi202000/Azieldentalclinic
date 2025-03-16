import React, { useState, useEffect } from 'react';
import '../styles/FeedBack.css'; // We'll create this file for styling
import DrawerComponent from './Drawers';
import axios from 'axios'; // Make sure to install axios: npm install axios
import Footer from './Footer'
import Chat from './chat';
import { useNavigate } from 'react-router-dom';

// At the top of your file, set the base URL for axios
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL; // Use environment variable for server URL

const FeedBack = () => {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user data from token verification
      axios
        .get(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
          headers: {
            Authorization: `${token}`,
          },
          withCredentials: true,
        })
        .then((response) => {
          const { firstName, lastName, email } = response.data.user;
          
          // Store fetched data in userData state
          const userData = {
            firstName: firstName || '',
            lastName: lastName || '',
            email: email || '',
          };
          setUserData(userData);

          // Set initial values if not anonymous
          if (!isAnonymous) {
            setName(`${userData.firstName} ${userData.lastName}`);
            setEmail(userData.email);
          }

          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching user data:', error);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [isAnonymous]);

  const handleAnonymousChange = (e) => {
    setIsAnonymous(e.target.checked);
    if (e.target.checked) {
      setName('Anonymous');
      setEmail('anonymous@example.com');
    } else if (userData.firstName) {
      setName(`${userData.firstName} ${userData.lastName}`);
      setEmail(userData.email);
    } else {
      setName('');
      setEmail('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!rating || !name || !email || !feedback) {
      setErrorMessage('Please fill in all fields before submitting.');
      return;
    }

    try {
      const response = await axios.post('/api/feedback/submit', { 
        rating, 
        name: isAnonymous ? 'Anonymous' : name, 
        email: isAnonymous ? 'anonymous@example.com' : email, 
        feedback,
        isAnonymous 
      });
      
      // Reset form after submission
      setRating(0);
      setName(userData.firstName ? `${userData.firstName} ${userData.lastName}` : '');
      setEmail(userData.email || '');
      setFeedback('');
      setIsAnonymous(false);
      // Show success message
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      setErrorMessage('');
    } catch (error) {
      console.error('Error submitting feedback:', error.response ? error.response.data : error.message);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

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

          <div className="FBanonymous-checkbox">
            <label>
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={handleAnonymousChange}
              />
              Submit as Anonymous
            </label>
          </div>

          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => !isAnonymous && setName(e.target.value)}
            disabled={isAnonymous}
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => !isAnonymous && setEmail(e.target.value)}
            disabled={isAnonymous}
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
