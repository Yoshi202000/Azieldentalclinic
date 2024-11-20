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
          <Card 
            name="Tooth Extractions" 
            description="Safe and efficient tooth removal procedures" 
            image={remove} 
          />
          <Card 
            name="Braces & Orthodontics" 
            description="Straighten your teeth for a perfect smile" 
            image={brace}  
          />
          <Card 
            name="Dental cleaning" 
            description="Restore damaged teeth with quality fillings" 
            image={clean} 
          />
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Services;
