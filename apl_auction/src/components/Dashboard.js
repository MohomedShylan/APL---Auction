import React from 'react';
import AirplaneIcon from './AirplaneIcon';
import './Dashboard.css';

export default function Dashboard({
  teams, activeTeamId, activeTeam, handleSwitchTeam,
  playerId, setPlayerId, price, setPrice, error, setError,
  boostAmount, setBoostAmount, playerToSell,
  handleSellPlayer, handleMarkUnsold, handleIncreaseBudget, handleRemovePlayer,
  handleDownloadPDF
}) {
  if (!activeTeam) {
    return (
      <div className="auction-app">
        <aside className="sidebar">
          <h2 className="sidebar-title">Select Franchise</h2>
          <div className="team-list">
            {teams.map((team) => (
              <div key={team.id} className="team-item" onClick={() => handleSwitchTeam(team.id)}>
                <div className="team-item-header">
                  <div className="sidebar-team-title">
                    <img 
                      src={`/${team.id}.png`} 
                      alt={`${team.name} Logo`} 
                      className="sidebar-team-logo"
                      onError={(e) => { e.target.style.display = 'none'; }} 
                    />
                    <h3>{team.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
        <main className="main-panel">
          <div className="empty-state">Select a team from the sidebar.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="auction-app">
      <aside className="sidebar">
        <h2 className="sidebar-title">Select Franchise</h2>
        <div className="team-list">
          {teams.map((team) => (
            <div 
              key={team.id} 
              className={`team-item ${activeTeamId === team.id ? 'active-team' : ''} ${team.players.length >= 8 ? 'full-team' : ''}`}
              onClick={() => handleSwitchTeam(team.id)}
            >
              <div className="team-item-header">
                <div className="sidebar-team-title">
                  <img 
                    src={`/logos/${team.id}.png`} 
                    alt={`${team.name} Logo`} 
                    className="sidebar-team-logo"
                    onError={(e) => { e.target.style.display = 'none'; }} 
                  />
                  <h3>{team.name}</h3>
                </div>
                <span className="player-count">{team.players.length}/8</span>
              </div>
              <div className="team-item-budget">
                {team.id === 'gladiators' ? (
                  <span style={{color: team.color}}>Directly Signed</span>
                ) : (
                  `Purse: Rs. ${team.budget.toLocaleString()}`
                )}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="main-panel">
        <div className="dashboard">
          <header className="dashboard-header">
            
            {/* --- NEW: Header Title Wrapper with Logo --- */}
            <div className="dashboard-title-wrapper">
              <img 
                src={`/logos/${activeTeam.id}.png`} 
                alt={`${activeTeam.name} Logo`} 
                className="dashboard-header-logo"
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
              <h1>{activeTeam.name} Management</h1>
            </div>

            <div className="budget-highlight" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', padding: '12px 24px' }}>
              {activeTeam.id === 'gladiators' ? (
                <span style={{ fontSize: '1.1rem', color: '#000' }}>All Players Directly Signed</span>
              ) : (
                <span>Remaining Purse: Rs. {activeTeam.budget.toLocaleString()}</span>
              )}
            </div>
          </header>

          <div className="dashboard-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="form-card">
                <h3>Record a Sold Player</h3>
                <form onSubmit={handleSellPlayer}>
                  <label>Player ID</label>
                  <input type="number" value={playerId} onChange={(e) => { setPlayerId(e.target.value); setError(''); }} placeholder="e.g. 1 or 201" min="1" max="300" disabled={activeTeam.players.length >= 8} />
                  
                  {playerToSell && (
                    <div className="player-preview">
                      Confirming: <strong>{playerToSell.name}</strong> ({playerToSell.role})
                      {playerToSell.isForeign && <AirplaneIcon />}
                    </div>
                  )}

                  <label>Selling Price (Rs.)</label>
                  <input type="number" value={price} onChange={(e) => { setPrice(e.target.value); setError(''); }} placeholder="e.g. 35000" min="25000" disabled={activeTeam.players.length >= 8} />
                  
                  {error && <div className="error-text">{error}</div>}
                  
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button type="submit" className="submit-btn" disabled={activeTeam.players.length >= 8} style={{ flex: 2 }}>
                      {activeTeam.players.length >= 8 ? "Squad Full" : `Sell to ${activeTeam.name}`}
                    </button>
                    <button type="button" className="submit-btn" onClick={handleMarkUnsold} style={{ flex: 1, background: 'transparent', border: '2px solid #64748b', color: '#cbd5e1' }}>
                      Pass (Unsold)
                    </button>
                  </div>
                </form>
              </div>

              {activeTeam.budget < 100000 && activeTeam.id !== 'gladiators' && (
                <div className="form-card" style={{ border: '1px solid #fbbf24', boxShadow: '0 0 15px rgba(251,191,36,0.1)' }}>
                  <h3 style={{ color: '#fbbf24', borderBottomColor: '#334155' }}>⚠️ Low Funds Alert</h3>
                  <p style={{ color: '#cbd5e1', fontSize: '0.95rem', marginBottom: '16px', marginTop: '-8px' }}>
                    Purse is critically low (below Rs. 100,000). You may inject emergency funds if approved.
                  </p>
                  <form onSubmit={handleIncreaseBudget}>
                    <label style={{ color: '#fbbf24' }}>Amount to Add (Rs.)</label>
                    <input type="number" value={boostAmount} onChange={(e) => setBoostAmount(e.target.value)} placeholder="e.g. 50000" min="1" style={{ borderColor: '#d97706' }} />
                    <button type="submit" className="submit-btn" style={{ background: 'transparent', border: '2px solid #fbbf24', color: '#fbbf24' }}>
                      + Inject Funds
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="squad-card">
              <h3>Recent Signings ({activeTeam.players.length}/8)</h3>
              <table className="squad-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th className="text-right">Price</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTeam.players.map((player, index) => (
                    <tr key={index}>
                      <td style={{ color: '#94a3b8' }}>{player.isCaptain || player.isDirectSign ? 'DIR' : `#${player.id}`}</td>
                      <td>
                        <strong>{player.name}</strong>
                        {player.isCaptain && <span style={{fontSize: '0.75rem', marginLeft: '8px', color: '#fbbf24'}}>(Captain)</span>}
                        {player.isDirectSign && !player.isCaptain && <span style={{fontSize: '0.75rem', marginLeft: '8px', color: '#fbbf24'}}>(Direct)</span>}
                        {player.isForeign && <AirplaneIcon />}
                      </td>
                      <td className="text-right">
                        {player.isCaptain || player.isDirectSign ? <span style={{ color: '#10b981' }}>Direct Sign</span> : `Rs. ${player.price.toLocaleString()}`}
                      </td>
                      <td className="text-center">
                        {player.isCaptain || player.isDirectSign ? (
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Retained</span>
                        ) : (
                          <button className="remove-btn" onClick={() => handleRemovePlayer(activeTeam.id, player.id)} title="Undo Sale">Undo</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={handleDownloadPDF} className="manage-shortcut-btn" style={{ marginTop: '24px', borderColor: activeTeam.color, color: activeTeam.color, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Official Roster PDF
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}