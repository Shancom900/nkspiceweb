import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, ShoppingCart, ShieldAlert } from 'lucide-react';
import './Navbar.css';

const Navbar = ({ settings }) => {
  const renderLogo = () => {
    if (!settings) return <Flame size={28} color="var(--primary-red)" fill="var(--primary-red)" />;
    
    if (settings.logoType === 'image' && settings.logoImage) {
      return (
        <img 
          src={settings.logoImage} 
          alt="Logo" 
          className="nav-logo-image" 
          style={{ height: '32px', width: 'auto', borderRadius: '4px', objectFit: 'contain' }} 
        />
      );
    }
    
    if (settings.logoType === 'text' && settings.logoText) {
      return <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{settings.logoText}</span>;
    }
    
    return <Flame size={28} color="var(--primary-red)" fill="var(--primary-red)" />;
  };

  const displayName = settings ? settings.siteName : 'SpiceMarket';

  return (
    <nav className="navbar glass">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          {renderLogo()}
          <span>{displayName}</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className="nav-link">Shop Chillies</Link>
          <div className="cart-icon">
            <ShoppingCart size={24} />
            <span className="cart-badge">0</span>
          </div>
          <Link to="/admin-login" className="admin-link" title="Admin Access">
            <ShieldAlert size={20} />
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
