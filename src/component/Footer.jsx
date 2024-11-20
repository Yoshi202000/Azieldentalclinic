import React from 'react';
import FooterCol from './FooterCol';
import '../styles/Footer.css';

const AzielAddress = [
  {name: "Aziel Dental Clinic", link: "//maps.app.goo.gl/7tzpcfthsECPe7n87"},
  {name: "Congressional Ave," , link: "//maps.app.goo.gl/7tzpcfthsECPe7n87"},
  {name: "Dasmariñas, 4115 Cavite" , link: "//maps.app.goo.gl/7tzpcfthsECPe7n87"},

]
const ArtsAddress = [

  {name: "Arts of Millennials Dental Clinic" , link: "//maps.app.goo.gl/csFrfpv593qi5oZW9"},
  {name: "8X78+V6F, Congressional Ave," , link: "//maps.app.goo.gl/csFrfpv593qi5oZW9"},
  {name: "Dasmariñas, Cavite" , link: "//maps.app.goo.gl/csFrfpv593qi5oZW9"},

]
const services = [
  {name: "tooth extraction" , link: "/services"},
  {name: "Braces & Orthodontics" , link: "/services"},
  {name: "Dental cleaning" , link: "/services"},
  {name: "Check Up" , link: "/services"}
]
const Footer = () => {
  return (
    <footer className="footer-area clear-both">
            <div className="Footerontainer">
                <div className="row">
                    <FooterCol key={1} menuTitle="Services" menuItems={services}/>
                    <FooterCol key={2} menuTitle="Address for Aziel Dental Clinic" menuItems={AzielAddress}/> 
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