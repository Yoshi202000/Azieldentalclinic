import "../styles/TermsCondition.css";

const TermsAndConditions = ({ isOpen, onClose, terms }) => {
  if (!isOpen) return null;

  return (
    <div className="terms-modal">
      <div className="terms-overlay" onClick={onClose}></div>
      <div className="terms-content">
        <h2 className="terms-title">Terms & Conditions</h2>
        <div className="terms-text">{terms || "Loading..."}</div>
        <button onClick={onClose} className="terms-close">Close</button>
      </div>
    </div>
  );
};

export default TermsAndConditions;
