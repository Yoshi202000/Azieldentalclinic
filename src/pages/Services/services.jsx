import React from 'react';
import Drawer from '../../component/Drawers';
import Footer from '../../component/Footer';
import Card from '../../component/Card';
import brace from '../../assets/brace.png';
import clean from '../../assets/clean.png';
import remove from '../../assets/remove.png';
import clinic from '../../assets/clinic.png'
import './services.css';
import '../../styles/Card.css'
import doctor1 from '../../assets/doctor1.png';
import '../../styles/Doctors.css';


// Import your images here
// import extract from '../../assets/extract.png'; // Example import

const Services = () => {
  return (
    <>
      <Drawer />
      <div className="Services-container">
        <div className="Services-hero">
          <h1 className="Services-hero-title">Our Dental Services</h1>
          <p className="Services-hero-description">Comprehensive care for your smile</p>
        </div>
        <div className="Services-main-content">          
          <div className="Services-image-container">
          <img src={clinic} alt="Dental Services" className="Services-main-image" />
          </div>
          <div className="Services-text-container">
            <h2 className="Services-main-title">Expert Dental Care</h2>
            <p className="Services-main-description">We offer a wide range of dental services to meet your needs. Our experienced team is dedicated to providing you with the highest quality care in a comfortable and friendly environment.</p>
          </div>
        </div>
        <h2 className="Services-section-title">Our Services</h2>
        <div className="Services-dental-grid">
        <div className="service-card">
            <img src={remove} alt="Tooth Extractions" className="doctor-image" />
            <div className="doctor-info">
              <h3 className="doctor-name">Tooth Extractions</h3>
              <p className="doctor-description">
                Safe and efficient tooth removal procedures. Our expert dentists ensure that any extraction is as comfortable as possible, using advanced anesthetics and techniques to minimize discomfort. Whether it's wisdom teeth removal or a problematic tooth, we offer a compassionate approach to make your experience stress-free.
              </p>
            </div>
          </div>

          <div className="service-card">
            <img src={brace} alt="Braces & Orthodontics" className="doctor-image" />
            <div className="doctor-info">
              <h3 className="doctor-name">Braces & Orthodontics</h3>
              <p className="doctor-description">
                Straighten your teeth for a perfect smile. Our orthodontic treatments include traditional braces and modern clear aligners, designed to correct misalignments and enhance your overall dental health. Let us help you achieve a confident, beautiful smile through a personalized treatment plan tailored to your needs.
              </p>
            </div>
          </div>

          <div className="service-card">
            <img src={clean} alt="Dental cleaning" className="doctor-image" />
            <div className="doctor-info">
              <h3 className="doctor-name">Dental Cleaning</h3>
              <p className="doctor-description">
                Restore your oral health with professional dental cleanings. Our dental hygienists remove plaque, tartar, and stains, promoting healthy gums and brightening your smile. Regular cleanings are essential for preventing cavities, gum disease, and maintaining overall dental hygiene, giving you a fresh and confident smile.
              </p>
            </div>
          </div>

        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Services;
