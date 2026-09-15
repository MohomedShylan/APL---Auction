import React from 'react';
import { MASTER_PLAYERS } from '../playersData';
import { FOREIGN_PLAYERS } from '../foreignPlayersData';
import './ViewPlayers.css';

const ViewPlayers = () => {
  const allPlayers = [
    ...MASTER_PLAYERS,
    ...FOREIGN_PLAYERS
  ];

  const sortedPlayers = allPlayers.sort((a, b) => a.id - b.id);
  const uniquePlayers = Array.from(new Map(sortedPlayers.map(p => [p.id, p])).values());

  const getImagePath = (id) => {
    const paddedId = String(id).padStart(2, '0');
    return `/player_image/${paddedId}.jpeg`;
  };

  return (
    <div className="view-players-container">
      
      <div className="players-grid">
        {uniquePlayers.map(player => (
          <div key={player.id} className="player-card">
            
            <div className="player-card-header" style={{ backgroundColor: '#0f172a' }}>
              <span className="player-id">#{String(player.id).padStart(2, '0')}</span>
            </div>
            
            <div className="player-card-body">
              
              <div className="player-image-wrapper">
                <img 
                  src={getImagePath(player.id)} 
                  alt={player.name}
                  className="player-photo"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="player-avatar-fallback" style={{ display: 'none' }}>
                  {player.name.charAt(0)}
                </div>
              </div>
              
              <h3 className="player-name">
                {player.name} {player.isForeign && '✈️'}
              </h3>
              <p className="player-role">{player.role}</p>
              
              {/* The Base Price has been removed from here! */}
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewPlayers;