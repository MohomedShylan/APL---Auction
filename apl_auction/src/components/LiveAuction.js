import React, { useState } from 'react';
import './LiveAuction.css';
import { MASTER_PLAYERS } from '../playersData';
import { FOREIGN_PLAYERS } from '../foreignPlayersData';

export default function LiveAuction({ teams, unsoldPlayers, setUnsoldPlayers, setPlayerId, setCurrentView }) {
  const [searchInput, setSearchInput] = useState('');
  const [activeDisplayId, setActiveDisplayId] = useState(null);
  const [error, setError] = useState('');

  // 1. Search Logic
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const parsedId = parseInt(searchInput, 10);
      
      // Look for player in both databases
      const player = [...MASTER_PLAYERS, ...FOREIGN_PLAYERS].find(p => p.id === parsedId);
      
      if (!player) {
        setError('Player ID not found in database.');
        setActiveDisplayId(null);
        return;
      }

      setError('');
      setActiveDisplayId(parsedId);
      setSearchInput('');
    }
  };

  // 2. Sold Logic 
  const handleSold = () => {
    setPlayerId(activeDisplayId.toString());
    setCurrentView('dashboard');
  };

  // 3. Unsold Logic 
  const handleUnsold = () => {
    const player = [...MASTER_PLAYERS, ...FOREIGN_PLAYERS].find(p => p.id === activeDisplayId);
    
    // Safety check: is player already sold?
    const isAlreadySold = teams.some(t => t.players.some(p => p.id === activeDisplayId));
    if (isAlreadySold) {
      setError(`${player.name} has already been sold!`);
      return;
    }

    // Add to unsold pool if not already there
    if (!unsoldPlayers.some(p => p.id === activeDisplayId)) {
      setUnsoldPlayers([...unsoldPlayers, player]);
    }
    
    // Clear the screen for the next player
    setActiveDisplayId(null);
  };

  // Format the ID to always be at least 2 digits (e.g., 1 becomes "01", 10 remains "10")
  const formattedImageId = activeDisplayId ? String(activeDisplayId).padStart(2, '0') : '';

  return (
    <div className="live-auction-page">
      <div className="live-search-header">
        <h2>Live Player Display</h2>
        <div className="search-box">
          <input 
            type="number" 
            placeholder="Enter Player ID and press Enter..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        {error && <div className="live-error">{error}</div>}
      </div>

      {/* Main Display */}
      <div className="live-display-area">
        {!activeDisplayId ? (
          <div className="live-empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <p>Waiting for Player ID...</p>
          </div>
        ) : (
          <div className="live-player-card">
            
            <img 
              src={`/player_image/${formattedImageId}.jpeg`} 
              alt={`Player ${activeDisplayId}`} 
              className="presentation-image"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = "https://via.placeholder.com/1200x800/0f172a/475569?text=IMAGE+NOT+FOUND";
              }}
            />
            
            <div className="live-action-buttons">
                <button className="live-btn sold-btn" onClick={handleSold}>
                SOLD ✔
              </button>
              <button className="live-btn unsold-btn" onClick={handleUnsold}>
                UNSOLD ✖
              </button>  
            </div>
          </div>
        )}
      </div>
    </div>
  );
}