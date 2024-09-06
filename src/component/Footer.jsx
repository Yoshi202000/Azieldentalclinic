import React from 'react';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer-wrapper">
      {/* Contact Section */}
      <div className="footer-contact-container">
        <div className="footer-contact">
          <h1>contact us</h1>
          <p className="footer-paragraph">Main Email: contact@dentcare.com</p>
          <p className="footer-paragraph">Office Telephone: 0135-24863976</p>
        </div>
        <div className="footer-contact">
          <p className="footer-paragraph">Inquiries: info@dentcare.com</p>
          <p className="footer-paragraph">Mobile: 7900139615</p>
        </div>
      </div>

      {/* About Us and Services Sections */}
      <div className="footer-info">
        {/* About Us Section */}
        <div className="footer-about">
          <h2 className="footer-heading">About Us</h2>
          <p className="footer-paragraph">
            Aziel Dental Clinic is committed to providing the best dental care.
            We strive for excellence and aim to serve our community with a smile.
          </p>
        </div>

        {/* Services Section */}
        <div className="footer-services">
          <h2 className="footer-heading">Services</h2>
          <ul className="footer-list">
            <li className="footer-list-item">Tooth Extraction</li>
            <li className="footer-list-item">Tooth Cleaning</li>
            <li className="footer-list-item">Denture Creation</li>
          </ul>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p className="footer-copyright">© 2024 Aziel Dental Clinic</p>
      </div>
    </footer>
  );
}

export default Footer;
