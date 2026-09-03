import React from 'react';
import AirplaneIcon from './AirplaneIcon';
import './Roster.css';

export default function UnsoldPool({ unsoldPlayers, setPlayerId, setCurrentView }) {
  return (
    <div className="roster-page">
      <header className="roster-header">
        <div className="roster-header-content">
          <div>
            <h1 style={{ color: '#9ca3af' }}>Unsold Players Pool</h1>
            <p className="roster-subtitle">Players passed in the first round. Ready for rapid-fire recall.</p>
          </div>
          <div className="budget-highlight" style={{ background: '#1e293b', color: '#cbd5e1' }}>
            Total Unsold: {unsoldPlayers.length}
          </div>
        </div>
      </header>

      <div className="roster-content">
        <div className="squad-card full-width-card">
          {unsoldPlayers.length === 0 ? (
            <div className="empty-roster">
              <h2>No players in the unsold pool.</h2>
              <p>When a player passes without a bid, they will appear here.</p>
            </div>
          ) : (
            <table className="squad-table large-table">
              <thead>
                <tr>
                  <th>Player ID</th>
                  <th>Player Name</th>
                  <th>Specialty Role</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {unsoldPlayers.map((player, index) => (
                  <tr key={index}>
                    <td className="id-col">#{player.id}</td>
                    <td className="name-col">
                      <strong style={{ color: '#fff' }}>{player.name}</strong>
                      {player.isForeign && <AirplaneIcon />}
                    </td>
                    <td className="role-col">
                      <span className="role-badge">{player.role}</span>
                    </td>
                    <td className="text-right">
                      <button 
                        className="manage-shortcut-btn"
                        style={{ padding: '8px 16px', borderColor: '#10b981', color: '#10b981', width: 'auto' }}
                        onClick={() => {
                          setPlayerId(player.id.toString());
                          setCurrentView('dashboard');
                        }}
                      >
                        Recall to Auction →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
