import React from 'react';
import './Home.css';

export default function Home({ setCurrentView }) {
  return (
    <div className="home-page">
       <div className="hero-banner">
          <img 
            src="APL Auction.png" 
            alt="Stadium Background" 
            className="hero-image" 
          />
          <div className="hero-overlay">
             <h1>Ambanpola Premier League 2026</h1>
             <p>The Ultimate Franchise Auction Engine</p>
             <button 
               className="submit-btn enter-btn" 
               onClick={() => setCurrentView('dashboard')}
             >
               Enter Live Auction Dashboard
             </button>
          </div>
       </div>
    </div>
  );
}
