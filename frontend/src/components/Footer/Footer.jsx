import React, { useState } from 'react';
import './Footer.css';
import footer_logo from '../assets/logo_big.png';
import instagram_icon from '../assets/instagram_icon.png';
import pintester_icon from '../assets/pintester_icon.png';
import whatsapp_icon from '../assets/whatsapp_icon.png';
import Contact from '../Contact/Contact';

export const Footer = () => {
    const [showContact, setShowContact] = useState(false);

    return (
        <div className='footer'>
            <div className="footer-logo">
                <img src={footer_logo} alt=""/>
            </div>
            <ul className="footer-links">
                <li>Company</li>
                <li>Product</li>
                <li>Offices</li>
                <li>About</li>
                <li onClick={() => setShowContact(true)}>Contact</li>
            </ul>
            {showContact && <Contact onClose={() => setShowContact(false)} />}
            <div className="footer-social-icon">
                <div className="footer-icons-container">
                    <img src={instagram_icon} alt=""/>
                </div>
                <div className="footer-icons-container">
                    <img src={pintester_icon} alt=""/>
                </div>
                <div className="footer-icons-container">
                    <img src={whatsapp_icon} alt=""/>
                </div>
            </div>
            <div className="footer-copyright">
                <hr/>
                <p>Copyright @2023 - All Right Reserved.</p>
            </div>

        </div>
    );
};
