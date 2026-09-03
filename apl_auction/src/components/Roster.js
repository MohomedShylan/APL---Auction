import React from 'react';
import AirplaneIcon from './AirplaneIcon';
import './Roster.css';

export default function Roster({ activeTeam, setCurrentView, handleDownloadPDF }) {
  if (!activeTeam) return null;

  return (
    <div className="roster-page">
      <header className="roster-header">
        <button className="back-btn" onClick={() => setCurrentView('summary')}>← Back to Summary</button>
        <div className="roster-header-content">
          <div>
            <h1 style={{ color: activeTeam.color }}>{activeTeam.name} Roster</h1>
            <p className="roster-subtitle">Squad Capacity: {activeTeam.players.length} / 8 Players</p>
          </div>
          <div className="budget-highlight">
            {activeTeam.id === 'gladiators' ? (
               <span style={{color: '#000'}}>All Players Directly Signed</span>
            ) : (
              `Remaining Purse: Rs. ${activeTeam.budget.toLocaleString()}`
            )}
          </div>
        </div>
      </header>

      <div className="roster-content">
        <div className="squad-card full-width-card">
          <table className="squad-table large-table">
            <thead>
              <tr>
                <th>Player ID</th>
                <th>Player Name</th>
                <th>Specialty Role</th>
                <th className="text-right">Purchase Price</th>
              </tr>
            </thead>
            <tbody>
              {activeTeam.players.map((player, index) => (
                <tr key={index}>
                  <td className="id-col">{player.isCaptain || player.isDirectSign ? 'DIR' : `#${player.id}`}</td>
                  <td className="name-col">
                    <strong style={{ color: activeTeam.color }}>{player.name}</strong>
                    {player.isCaptain && <span style={{fontSize: '0.85rem', marginLeft: '10px', color: '#fbbf24'}}>(Captain)</span>}
                    {player.isDirectSign && !player.isCaptain && <span style={{fontSize: '0.85rem', marginLeft: '10px', color: '#fbbf24'}}>(Direct)</span>}
                    {player.isForeign && <AirplaneIcon />}
                  </td>
                  <td className="role-col">
                    <span className="role-badge">{player.role}</span>
                  </td>
                  <td className="price-col text-right">
                    {player.isCaptain || player.isDirectSign ? <span style={{ color: '#10b981' }}>Direct Sign</span> : `Rs. ${player.price.toLocaleString()}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
