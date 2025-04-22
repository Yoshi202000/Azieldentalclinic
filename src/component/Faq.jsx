import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Faq.css';

const Faq = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedFaqId, setExpandedFaqId] = useState(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/clinic`);
        
        if (response.data && response.data.faqs) {
          // Only include active FAQs
          const activeFaqs = response.data.faqs.filter(faq => faq.isActive);
          setFaqs(activeFaqs);
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  const toggleFaq = (faqId) => {
    if (expandedFaqId === faqId) {
      setExpandedFaqId(null); // Collapse if already expanded
    } else {
      setExpandedFaqId(faqId); // Expand the clicked FAQ
    }
  };

  if (loading) {
    return (
      <div className="faq-container loading">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <div className="faq-loading">Loading FAQs...</div>
      </div>
    );
  }

  return (
    <div className="faq-container">
      <h2 className="faq-title">Frequently Asked Questions</h2>
      
      {faqs.length === 0 ? (
        <p className="faq-empty">No FAQs available at the moment.</p>
      ) : (
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div 
              key={faq._id || index} 
              className={`faq-item ${expandedFaqId === (faq._id || index) ? 'expanded' : ''}`}
            >
              <div 
                className="faq-question"
                onClick={() => toggleFaq(faq._id || index)}
              >
                <h3>{faq.question}</h3>
                <div className="faq-icon">
                  {expandedFaqId === (faq._id || index) ? '−' : '+'}
                </div>
              </div>
              
              <div className={`faq-answer ${expandedFaqId === (faq._id || index) ? 'show' : ''}`}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Faq;
