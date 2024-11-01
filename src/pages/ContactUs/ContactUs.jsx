import React from 'react';
import DrawerComponent from '../../component/Drawers';
import Footer from '../../component/Footer';
import './ContactUs.css';
import Chat from '../../component/chat';

function ContactUs() {
  return (
    <>
        <Chat />
      <div className="ContactMain">
        <div className="ContactBG">
          <h1>Hello</h1>
          <p>Welcome to Aziel Dental Clinic</p>
        </div>

        <div className="ContactUsContainer">
        <h1>Get in Touch</h1>
        <input type="text" placeholder="Your Name" />
        <input type="text" placeholder="Your Phone Number" />
        <input type="text" placeholder="Your Email" />
        <textarea placeholder="Your Message"></textarea>
        <button>Submit</button>
          
        </div>
      </div>

      <Footer />
    </>
  );
}

export default ContactUs;
