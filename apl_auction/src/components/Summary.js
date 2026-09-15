import React from 'react';
import './Summary.css';

export default function Summary({ teams, setActiveTeamId, setCurrentView }) {
  return (
    <div className="summary-page">
      <header className="summary-header">
        <h1>Live Auction Summary</h1>
        <p>Current overview of all franchise budgets and squad capacities.</p>
      </header>
      
      <div className="summary-grid">
        {teams.map(team => (
          <div key={team.id} className="summary-card" style={{ borderTop: `4px solid ${team.color}` }}>
            <div className="summary-card-header">
              
              {/* NEW: Wrapper for Logo and Name */}
              <div className="team-title-wrapper">
                <img 
                  src={`/logos/${team.id}.png`} 
                  alt={`${team.name} Logo`} 
                  className="team-summary-logo"
                  onError={(e) => { e.target.style.display = 'none'; }} /* Hides broken image icon if logo is missing */
                />
                <h2 style={{ color: team.color }}>{team.name}</h2>
              </div>

              <span className="status-badge" style={{ backgroundColor: `${team.color}20`, color: team.color, border: `1px solid ${team.color}50` }}>
                {team.players.length} / 8 Players
              </span>
            </div>
            
            <div className="summary-metrics">
              {team.id === 'gladiators' ? (
                <div className="metric-box" style={{ marginBottom: '12px' }}>
                  <span className="metric-label">Purse Status</span>
                  <span className="metric-value" style={{ fontSize: '1.2rem', color: team.color, marginTop: '4px' }}>
                    All Players Directly Signed
                  </span>
                </div>
              ) : (
                <div className="metric-box" style={{ marginBottom: '12px' }}>
                  <span className="metric-label">Remaining Purse</span>
                  <span className="metric-value">Rs. {team.budget.toLocaleString()}</span>
                </div>
              )}
            </div>
            
            <div className="summary-card-footer">
              <button 
                className="manage-shortcut-btn"
                onClick={() => { setActiveTeamId(team.id); setCurrentView('roster'); }}
                style={{ borderColor: team.color, color: team.color }}
              >
                View Full Squad →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}