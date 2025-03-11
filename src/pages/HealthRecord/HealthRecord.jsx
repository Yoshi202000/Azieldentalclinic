import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './HealthRecord.css';
import DrawerComponent from '../../component/Drawers';
import Chat from '../../component/chat';
import Footer from '../../component/Footer';
import axios from 'axios';

const Question = ({ questionKey, questionLabel, value, onChange }) => {
  return (
    <div className="question">
      <label>{questionLabel}</label>
      <div>
        <label>
          <input
            type="radio"
            name={questionKey}
            value="yes"
            checked={value === true}
            onChange={() => onChange(true)}
          />
          Yes
        </label>
        <label>
          <input
            type="radio"
            name={questionKey}
            value="no"
            checked={value === false}
            onChange={() => onChange(false)}
          />
          No
        </label>
      </div>
    </div>
  );
};

const HealthRecord = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [questions, setQuestions] = useState({
    questionOne: '',
    questionTwo: '',
    questionThree: '',
    questionFour: '',
    questionFive: '',
    questionSix: '',
    questionSeven: '',
    questionEight: '',
    questionNine: '',
    questionTen: ''
  });

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

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/clinic`);
      if (response.data) {
        const { 
          questionOne,
          questionTwo,
          questionThree,
          questionFour,
          questionFive,
          questionSix,
          questionSeven,
          questionEight,
          questionNine,
          questionTen
        } = response.data;

        setQuestions({
          questionOne,
          questionTwo,
          questionThree,
          questionFour,
          questionFive,
          questionSix,
          questionSeven,
          questionEight,
          questionNine,
          questionTen
        });
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to continue.');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        await fetchQuestions();

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
        const { healthRecord } = data.user || {};

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
          <Question
            questionKey="questionOne"
            questionLabel={questions.questionOne || "Are you currently smoking?"}
            value={healthData.questionOne}
            onChange={(answer) => handleAnswerChange('questionOne', answer)}
          />
          <Question
            questionKey="questionTwo"
            questionLabel={questions.questionTwo || "Do you have any known allergies?"}
            value={healthData.questionTwo}
            onChange={(answer) => handleAnswerChange('questionTwo', answer)}
          />
          <Question
            questionKey="questionThree"
            questionLabel={questions.questionThree || "Are you taking any medications?"}
            value={healthData.questionThree}
            onChange={(answer) => handleAnswerChange('questionThree', answer)}
          />
          <Question
            questionKey="questionFour"
            questionLabel={questions.questionFour || "Have you had any previous dental surgeries?"}
            value={healthData.questionFour}
            onChange={(answer) => handleAnswerChange('questionFour', answer)}
          />
          <Question
            questionKey="questionFive"
            questionLabel={questions.questionFive || "Do you have a history of anesthesia-related complications?"}
            value={healthData.questionFive}
            onChange={(answer) => handleAnswerChange('questionFive', answer)}
          />
          <Question
            questionKey="questionSix"
            questionLabel={questions.questionSix || "Are you experiencing any pain or discomfort at the moment?"}
            value={healthData.questionSix}
            onChange={(answer) => handleAnswerChange('questionSix', answer)}
          />
          <Question
            questionKey="questionSeven"
            questionLabel={questions.questionSeven || "Do you have a history of heart conditions?"}
            value={healthData.questionSeven}
            onChange={(answer) => handleAnswerChange('questionSeven', answer)}
          />
          <Question
            questionKey="questionEight"
            questionLabel={questions.questionEight || "Are you currently pregnant?"}
            value={healthData.questionEight}
            onChange={(answer) => handleAnswerChange('questionEight', answer)}
          />
          <Question
            questionKey="questionNine"
            questionLabel={questions.questionNine || "Do you have any medical conditions we should be aware of?"}
            value={healthData.questionNine}
            onChange={(answer) => handleAnswerChange('questionNine', answer)}
          />
          <Question
            questionKey="questionTen"
            questionLabel={questions.questionTen || "Do you have any specific concerns about the upcoming procedure?"}
            value={healthData.questionTen}
            onChange={(answer) => handleAnswerChange('questionTen', answer)}
          />
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
