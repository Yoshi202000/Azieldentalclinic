import React, { useState, useEffect } from 'react';
import FooterCol from './FooterCol';
import '../styles/Footer.css';
import axios from 'axios';

const Footer = () => {
  const [clinicData, setClinicData] = useState({
    nameOne: '',
    nameTwo: '',
    address: '',
    addressTwo: '',
    services: []
  });

  useEffect(() => {
    const fetchClinicData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/clinic`);
        if (response.data) {
          setClinicData({
            nameOne: response.data.nameOne || '',
            nameTwo: response.data.nameTwo || '',
            address: response.data.address || '',
            addressTwo: response.data.addressTwo || '',
            services: response.data.services || []
          });
        }
      } catch (error) {
        console.error('Error fetching clinic data:', error);
      }
    };

    fetchClinicData();
  }, []);

  const AzielAddress = [
    {name: clinicData.nameOne, link: "//maps.app.goo.gl/7tzpcfthsECPe7n87"},
    {name: clinicData.address, link: "//maps.app.goo.gl/7tzpcfthsECPe7n87"},
    {name: clinicData.addressTwo, link: "//maps.app.goo.gl/7tzpcfthsECPe7n87"},
  ];

  const ArtsAddress = [
    {name: clinicData.nameTwo, link: "//maps.app.goo.gl/csFrfpv593qi5oZW9"},
    {name: clinicData.address, link: "//maps.app.goo.gl/csFrfpv593qi5oZW9"},
    {name: clinicData.addressTwo, link: "//maps.app.goo.gl/csFrfpv593qi5oZW9"},
  ];

  // Transform services data to match the required format
  const formattedServices = clinicData.services.map(service => ({
    name: service.name,
    link: "/services"
  }));

  return (
    <footer className="footer-area clear-both">
            <div className="Footerontainer">
                <div className="row">
                    <FooterCol key={1} menuTitle="Services" menuItems={formattedServices}/>
                    <FooterCol key={2} menuTitle="Address for Aziel Dental Clinica" menuItems={AzielAddress}/> 
                    <FooterCol key={3} menuTitle="Address for Arts of Millennials Dental Clinic" menuItems={ArtsAddress}> 
                    </FooterCol>
                </div>
                <div className="copyRight text-center">
                    <p>Copyright {(new Date()).getFullYear()} All Rights Reserved</p>
                </div>
            </div>
        </footer>
  );
};

export default Footer;