import React from 'react';
import './Logo.css';

function Logo() {
  return (
    <div className="logo-container">
      <img src="/logo.jpeg" alt="Logo" className="logo-image" />
      <div className="logo-text">
        <div className="company-name">AKHİZWE TECHNOLOGİES</div>
        <div className="company-slogan">CREATING ADVANCED COMMUNITIES</div>
      </div>
    </div>
  );
}

export default Logo;