import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HealthRecord.css';
import DrawerComponent from '../../component/Drawers';
import Chat from '../../component/chat';
import Footer from '../../component/Footer';

const HealthRecord = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [healthData, setHealthData] = useState({
    questionOne: null,
    questionTwo: null,
    questionThree: null,
    questionFour: null,
    questionFive: null,
    questionSix: null,
    questionSeven: null,
    questionEight: null,
    questionNine: null,
    questionTen: null,
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/verify-token`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error('Session expired or invalid.');
        }
        
        const data = await response.json();
        const { healthRecord } = data.user || {}; // Assuming health data is under `healthRecord`
        
        setHealthData({
          questionOne: healthRecord?.questionOne || null,
          questionTwo: healthRecord?.questionTwo || null,
          questionThree: healthRecord?.questionThree || null,
          questionFour: healthRecord?.questionFour || null,
          questionFive: healthRecord?.questionFive || null,
          questionSix: healthRecord?.questionSix || null,
          questionSeven: healthRecord?.questionSeven || null,
          questionEight: healthRecord?.questionEight || null,
          questionNine: healthRecord?.questionNine || null,
          questionTen: healthRecord?.questionTen || null,
        });
        
        setLoading(false);
      } catch (error) {
        alert('Session expired or invalid. Please log in again.');
        navigate('/login');
      }
    };

    fetchData();
  }, [navigate]);

  const handleAnswerChange = (question, answer) => {
    setHealthData((prevData) => ({
      ...prevData,
      [question]: answer,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setIsError(false);

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/update-health-record`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ questions: healthData }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage('Health record updated successfully');
        alert('Health record updated successfully');
        setTimeout(() => {
          navigate('/home');
        }, 2000); // Redirect to home after 2 seconds
      } else {
        setMessage(result.message || 'Failed to update health record');
        setIsError(true);
      }
    } catch (error) {
      console.error('Error updating health record:', error);
      setMessage('An error occurred while updating health record.');
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }
  return (
    <>
    <DrawerComponent />

    <div className="health-record-container">
      <h1>Update Health Record</h1>
      <p className="info-message">
        This questionnaire is optional and can be completed at the clinic if necessary. If you are booking an appointment on behalf of someone else, please leave this questionnaire unanswered.
      </p>
      {message && <p className={isError ? 'error-message' : 'success-message'}>{message}</p>}
      <form onSubmit={handleSubmit}>
        {Object.keys(healthData).map((questionKey, index) => (
          <div key={questionKey} className="question">
            <label>{`Question ${index + 1}`}</label>
            <div>
              <label>
                <input
                  type="radio"
                  name={questionKey}
                  value="yes"
                  checked={healthData[questionKey] === true}
                  onChange={() => handleAnswerChange(questionKey, true)}
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name={questionKey}
                  value="no"
                  checked={healthData[questionKey] === false}
                  onChange={() => handleAnswerChange(questionKey, false)}
                />
                No
              </label>
            </div>
          </div>
        ))}
        <button className="health-record-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
    <Footer />
    <Chat />

    </>
  );
};

export default HealthRecord;