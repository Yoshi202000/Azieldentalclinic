import React from 'react';
import FooterCol from './FooterCol';
import '../styles/Footer.css';

const ourAddress = [
  {name: "Congressional Ave," , link: "//maps.app.goo.gl/7tzpcfthsECPe7n87"},
  {name: "Dasmariñas, 4115 Cavite" , link: "//maps.app.goo.gl/7tzpcfthsECPe7n87"},
 
]
const services = [
  {name: "tooth extraction" , link: "/services"},
  {name: "Braces & Orthodontics" , link: "/services"},
  {name: "dental cleaning" , link: "/services"},
  {name: "Check Up" , link: "/services"}
]
const Footer = () => {
  return (
    <footer className="footer-area clear-both">
            <div className="Footerontainer">
                <div className="row">
                    <FooterCol key={1} menuTitle="Services" menuItems={services}/>
                    <FooterCol key={2} menuTitle="Our Address" menuItems={ourAddress}> 
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