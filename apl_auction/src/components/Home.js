import React, { useState } from 'react';
import './Home.css'; 

const Home = ({ setCurrentView, user, news, onAddNews, onRemoveNews, teams, setActiveTeamId }) => {

  // --- Admin Form State ---
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('match');

  const submitNews = (e) => {
    e.preventDefault();
    if (!title || !desc) return;
    
    onAddNews({
      id: Date.now().toString(), // Generates a unique ID
      title,
      desc,
      type
    });
    
    // Clear the form
    setTitle('');
    setDesc('');
  };

  // Helper to determine colors/icons based on category
  const getTagConfig = (newsType) => {
    switch(newsType) {
      case 'match': return { text: '🏏 Match Day', colorClass: 'text-gold', borderClass: 'border-gold' };
      case 'event': return { text: '🚙 Community Event', colorClass: 'text-blue', borderClass: 'border-blue' };
      case 'admin': return { text: '🔨 Administration', colorClass: 'text-dark', borderClass: 'border-dark' };
      default: return { text: '📢 Announcement', colorClass: 'text-dark', borderClass: 'border-dark' };
    }
  };

  return (
    <div className="home-wrapper">
      
      {/* 1. HERO SECTION */}
<section className="hero-section" style={{ backgroundImage: "url('/APL Auction.png')" }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">SEASON 2 COMING SOON</div>
          <h1 className="hero-title">
            AMBANPOLA PREMIER <span className="text-gold">LEAGUE</span>
          </h1>
          <p className="hero-tagline">"Building Teams. Chasing Glory."</p>
          
          <div className="hero-logos-showcase">
            {teams.map(team => (
              <img 
                key={team.id}
                src={`/logos/${team.id}.png`} 
                alt={`${team.name} Logo`} 
                className="hero-team-logo"
                title={team.name}
                onError={(e) => { e.target.style.display = 'none'; }} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. STATS BAR */}
      <section className="stats-bar">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number">8</div>
            <div className="stat-label">Franchises</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">64</div>
            <div className="stat-label">Elite Players</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">Rs. 50k</div>
            <div className="stat-label">Grand Prize</div>
          </div>
        </div>
      </section>

      {/* 3. THE FRANCHISES (SUMMARY CARDS) */}
      <section className="teams-section">
        <div className="section-header">
          <h2>The Franchises</h2>
          <div className="header-underline"></div>
        </div>
        
        <div className="summary-grid">
          {teams.map(team => (
            <div key={team.id} className="summary-card" style={{ borderTop: `4px solid ${team.color}` }}>
              <div className="summary-card-header">
                
                <div className="team-title-wrapper">
                  <img 
                    src={`/logos/${team.id}.png`} 
                    alt={`${team.name} Logo`} 
                    className="team-summary-logo"
                    onError={(e) => { e.target.style.display = 'none'; }} 
                  />
                  <h3 style={{ color: team.color, margin: 0, fontSize: '1.4rem' }}>{team.name}</h3>
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
      </section>

      {/* 4. DYNAMIC NEWS & SCHEDULE */}
      <section className="news-section">
        <div className="section-header">
          <h2>Latest Updates & Schedule</h2>
          <div className="header-underline"></div>
        </div>

        {/* --- ADMIN ONLY: ADD NEWS FORM --- */}
        {user && (
          <div className="admin-news-panel">
            <h3>➕ Add New Announcement</h3>
            <form onSubmit={submitNews}>
              <input 
                type="text" 
                placeholder="News Title (e.g., Final Rosters Released)" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
              <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="match">🏏 Match / Game</option>
                <option value="event">🚙 Community Event</option>
                <option value="admin">🔨 Administration</option>
              </select>
              <textarea 
                placeholder="Description (Press Enter for new lines...)" 
                value={desc} 
                onChange={(e) => setDesc(e.target.value)} 
                required 
                rows="4"
              ></textarea>
              <button type="submit" className="btn-primary">Post Update</button>
            </form>
          </div>
        )}

        {/* --- PUBLIC NEWS GRID --- */}
        <div className="news-grid">
          {news && news.length > 0 ? (
            news.map(item => {
              const config = getTagConfig(item.type);
              return (
                <div key={item.id} className={`news-card ${config.borderClass}`}>
                  
                  <div className="news-header-row">
                    <div className={`news-tag ${config.colorClass}`}>{config.text}</div>
                    {/* Admin Delete Button */}
                    {user && (
                      <button onClick={() => onRemoveNews(item.id)} className="btn-delete-news">
                        Delete
                      </button>
                    )}
                  </div>
                  
                  <h3 className="news-title">{item.title}</h3>
                  <p className="news-desc" style={{ whiteSpace: 'pre-wrap' }}>{item.desc}</p>
                  
                </div>
              );
            })
          ) : (
            <div className="no-news-msg">No recent updates. Check back soon!</div>
          )}
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-about">
            <div className="footer-brand">
              <div className="brand-logo">A</div>
              <h2>APL 2026</h2>
            </div>
            <p className="footer-text">
              The Ambanpola Premier League is dedicated to showcasing top-tier local cricket talent, fostering sportsmanship, and uniting the community through the love of the game.
            </p>
            <div className="prize-pool">
              <p>Prize Pool:</p>
              <p className="prize-gold">🏆 Champions: Rs. 50,000</p>
              <p className="prize-silver">🥈 Runner Up: Rs. 30,000</p>
            </div>
          </div>
          
          <div className="footer-contact">
            <h3>Official Organizers</h3>
            <p className="footer-text">For registrations and inquiries, please contact:</p>
            <ul className="contact-list">
              <li>📞 Manoj: <span>078 333 5838</span></li>
              <li>📞 Mahesh: <span>078 312 6038</span></li>
              <li>📞 Tharaka: <span>071 334 5236</span></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Powered by APL Auction Management System &copy; 2026</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;