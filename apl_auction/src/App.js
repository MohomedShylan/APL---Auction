import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './App.css';

// Import Firebase auth and db, plus the Firestore functions we need for real-time sync
import { auth, db } from './firebase'; 
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

import { MASTER_PLAYERS } from './playersData';
import { TEAM_CAPTAINS } from './captainsData';
import { GLADIATORS_SQUAD } from './gladiatorsData';
import { FOREIGN_PLAYERS } from './foreignPlayersData';

import Home from './components/Home';
import Dashboard from './components/Dashboard';
import ViewPlayers from './components/ViewPlayers';
import Summary from './components/Summary';
import Roster from './components/Roster';
import LiveAuction from './components/LiveAuction';

import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';

const INITIAL_TEAMS = [
  { id: 'falcons', name: 'Falcons', budget: 500000, players: [TEAM_CAPTAINS.falcons], color: '#2563eb' },
  { id: 'warriors', name: 'Warriors', budget: 500000, players: [TEAM_CAPTAINS.warriors], color: '#dc2626' },
  { id: 'panthers', name: 'Panthers', budget: 500000, players: [TEAM_CAPTAINS.panthers], color: '#10b981' },
  { id: 'kings', name: 'Kings', budget: 500000, players: [TEAM_CAPTAINS.kings], color: '#f97316' },
  { id: 'titans', name: 'Titans', budget: 500000, players: [TEAM_CAPTAINS.titans], color: '#8b5cf6' },
  { id: 'gladiators', name: 'Gladiators', budget: 500000, players: GLADIATORS_SQUAD, color: '#9f1239' },
  { id: 'sharks', name: 'Sharks', budget: 500000, players: [TEAM_CAPTAINS.sharks], color: '#0d9488' },
  { id: 'lions', name: 'Lions', budget: 500000, players: [TEAM_CAPTAINS.lions], color: '#eab308' },
];

const AppContent = () => {
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [unsoldPlayers, setUnsoldPlayers] = useState([]); 
  const [news, setNews] = useState([]); // Dynamic news state
  const [activeTeamId, setActiveTeamId] = useState('falcons');
  
  const [playerId, setPlayerId] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [boostAmount, setBoostAmount] = useState('');

  const [user, setUser] = useState(null);
  
  // --- NEW: Mobile Menu State ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // 1. Listen for login/logout changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-Time Firestore Sync Listener
  useEffect(() => {
    const auctionDocRef = doc(db, 'auction', 'main');
    
    const unsubscribe = onSnapshot(auctionDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setTeams(data.teams || INITIAL_TEAMS);
        setUnsoldPlayers(data.unsoldPlayers || []);
        setNews(data.news || []);
      } else if (auth.currentUser) {
        setDoc(auctionDocRef, {
          teams: INITIAL_TEAMS,
          unsoldPlayers: [],
          news: [] 
        }).catch(err => console.error("Error initializing DB:", err));
      }
    });

    return () => unsubscribe(); 
  }, [user]);

  const setCurrentView = (view) => {
    if (view === 'home') navigate('/');
    else navigate(`/${view}`);
  };

  // --- NEW: Helper to navigate and close mobile menu ---
  const handleNavClick = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const currentPath = location.pathname;
  const activeTeam = teams.find(t => t.id === activeTeamId);
  const parsedId = parseInt(playerId, 10);
  
  let playerToSell = null;
  if (!isNaN(parsedId)) {
    playerToSell = MASTER_PLAYERS.find(p => p.id === parsedId) || FOREIGN_PLAYERS.find(p => p.id === parsedId);
  }

  // --- Dynamic News Handlers ---
  const handleAddNews = (newNewsItem) => {
    const updatedNews = [newNewsItem, ...news];
    updateDoc(doc(db, 'auction', 'main'), { news: updatedNews });
  };

  const handleRemoveNews = (newsId) => {
    const updatedNews = news.filter(n => n.id !== newsId);
    updateDoc(doc(db, 'auction', 'main'), { news: updatedNews });
  };

  const handleMarkUnsold = () => {
    setError('');
    if (!playerId) return setError("Please enter a Player ID.");
    if (!playerToSell) return setError("Player ID not found.");

    const isAlreadySold = teams.some(team => team.players.some(p => p.id === parsedId));
    if (isAlreadySold) return setError(`${playerToSell.name} has already been sold!`);

    const isAlreadyUnsold = unsoldPlayers.some(p => p.id === parsedId);
    if (isAlreadyUnsold) return setError(`${playerToSell.name} is already in the Unsold Pool!`);

    const updatedUnsold = [...unsoldPlayers, playerToSell];
    
    updateDoc(doc(db, 'auction', 'main'), {
      unsoldPlayers: updatedUnsold
    });

    setPlayerId('');
    setPrice('');
  };

  const handleSellPlayer = (e) => {
    e.preventDefault();
    setError('');

    const sellPrice = parseInt(price, 10);
    const MAX_PLAYERS = 8;
    const BASE_PRICE = 25000;

    if (!playerId) return setError("Please enter a Player ID.");
    if (!playerToSell) return setError("Player ID not found.");
    
    const isAlreadySold = teams.some(team => team.players.some(p => p.id === parsedId));
    if (isAlreadySold) return setError(`${playerToSell.name} has already been sold!`);

    if (isNaN(sellPrice) || sellPrice <= 0) return setError("Please enter a valid amount.");
    if (sellPrice < BASE_PRICE) return setError(`Minimum base price is Rs. ${BASE_PRICE.toLocaleString()}.`);
    if (activeTeam.players.length >= MAX_PLAYERS) return setError("Squad is already full.");

    if (activeTeam.id !== 'gladiators') {
      const foreignCount = activeTeam.players.filter(p => p.isForeign).length;
      const emptySlots = MAX_PLAYERS - activeTeam.players.length;
      const foreignNeeded = 2 - foreignCount;

      if (playerToSell.isForeign) {
        if (foreignCount >= 2) return setError(`${activeTeam.name} already have their maximum quota of 2 foreign players.`);
      } else {
        if (emptySlots <= foreignNeeded) return setError(`Bid failed! ${activeTeam.name} must reserve their remaining ${emptySlots} slot(s) exclusively for foreign players.`);
      }
    }

    if (activeTeam.budget < sellPrice) {
      return setError(`Bid failed! Insufficient funds. ${activeTeam.name} only has Rs. ${activeTeam.budget.toLocaleString()} remaining in their purse.`);
    }

    const updatedTeams = teams.map(team => {
      if (team.id === activeTeamId) {
        return {
          ...team,
          budget: team.budget - sellPrice,
          players: [...team.players, { 
            id: parsedId, 
            name: playerToSell.name || "Unknown", 
            role: playerToSell.role || "Unknown", 
            price: sellPrice, 
            isForeign: playerToSell.isForeign || false 
          }]
        };
      }
      return team;
    });

    const updatedUnsold = unsoldPlayers.filter(p => p.id !== parsedId);

    updateDoc(doc(db, 'auction', 'main'), {
      teams: updatedTeams,
      unsoldPlayers: updatedUnsold
    });

    setPlayerId('');
    setPrice('');
  };

  const handleIncreaseBudget = (e) => {
    e.preventDefault();
    const amount = parseInt(boostAmount, 10);
    if (isNaN(amount) || amount <= 0) return;
    
    const updatedTeams = teams.map(team => 
      team.id === activeTeamId ? { ...team, budget: team.budget + amount } : team
    );

    updateDoc(doc(db, 'auction', 'main'), { teams: updatedTeams });
    
    setBoostAmount('');
    setError('');
  };

  const handleRemovePlayer = (teamId, playerIdToRemove) => {
    const updatedTeams = teams.map(team => {
      if (team.id === teamId) {
        const playerToRemove = team.players.find(p => p.id === playerIdToRemove);
        if (!playerToRemove || playerToRemove.isCaptain || playerToRemove.isDirectSign) return team;
        return {
          ...team,
          budget: team.budget + playerToRemove.price,
          players: team.players.filter(p => p.id !== playerIdToRemove) 
        };
      }
      return team;
    });

    updateDoc(doc(db, 'auction', 'main'), { teams: updatedTeams });
  };

  const handleSwitchTeam = (teamId) => {
    setActiveTeamId(teamId);
    setError('');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    doc.setFillColor(10, 17, 40); 
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor('#fbbf24'); 
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("APL AUCTION 2026", pageWidth / 2, 18, { align: "center" });

    doc.setTextColor('#ffffff');
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text("OFFICIAL FRANCHISE ROSTER", pageWidth / 2, 28, { align: "center" });

    doc.setTextColor(activeTeam.color);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(`${activeTeam.name.toUpperCase()}`, 14, 55);

    doc.setTextColor('#475569'); 
    doc.setFontSize(12);
    const purseText = activeTeam.id === 'gladiators' ? 'STATUS: ALL PLAYERS DIRECTLY SIGNED' : `REMAINING PURSE: RS. ${activeTeam.budget.toLocaleString()}`;
    doc.text(purseText, 14, 63);

    const tableColumn = ["PLAYER ID", "PLAYER NAME", "SPECIALTY ROLE", "PURCHASE PRICE"];
    const tableRows = [];

    activeTeam.players.forEach(player => {
      const id = player.isCaptain || player.isDirectSign ? 'DIR' : `#${player.id}`;
      let name = player.name;
      if (player.isCaptain) name += ' (C)';
      else if (player.isDirectSign) name += ' (D)';
      if (player.isForeign) name += ' (Foreign)';

      const role = player.role;
      const price = player.isCaptain || player.isDirectSign ? 'Direct Sign' : `Rs. ${player.price.toLocaleString()}`;
      tableRows.push([id, name, role, price]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 70,
      theme: 'grid',
      headStyles: { fillColor: activeTeam.color, textColor: '#ffffff', fontStyle: 'bold', fontSize: 10, halign: 'center' },
      bodyStyles: { fontSize: 10, textColor: '#1e293b', valign: 'middle' },
      alternateRowStyles: { fillColor: '#f8fafc' },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold', textColor: '#64748b' }, 
        1: { fontStyle: 'bold', textColor: '#0f172a' }, 
        2: { halign: 'center' }, 
        3: { halign: 'right', fontStyle: 'bold', textColor: '#10b981' } 
      },
      margin: { top: 70, left: 14, right: 14 }
    });

    doc.setTextColor('#94a3b8');
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    const today = new Date().toLocaleString();
    doc.text(`Generated securely by APL Auction System | ${today}`, pageWidth / 2, pageHeight - 10, { align: "center" });

    doc.save(`APL_2026_${activeTeam.name}_Roster.pdf`);
  };

  const handleLogout = () => {
    signOut(auth);
    navigate('/');
  };

  return (
    <div className="app-wrapper">
      <nav className="top-nav">
        <div className="nav-brand">
          <img src="/logos/APL logo.png" alt="APL Logo" className="nav-logo" />
          <div>APL <span>Auction</span></div>
        </div>
        
        {/* NEW: Hamburger Menu Button */}
        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
        
        {/* UPDATED: Mobile Menu Classes & Nav Handlers */}
        <div className={`nav-links ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
          <button className={`nav-btn ${currentPath === '/' ? 'active-nav' : ''}`} onClick={() => handleNavClick('/')}>Home</button>
          
          {user && (
            <>
              <button className={`nav-btn ${currentPath === '/live' ? 'active-nav' : ''}`} onClick={() => handleNavClick('/live')}>Live Presentation</button>
              <button className={`nav-btn ${currentPath === '/dashboard' ? 'active-nav' : ''}`} onClick={() => handleNavClick('/dashboard')}>Management Dashboard</button>
            </>
          )}
          
          <button className={`nav-btn ${currentPath === '/players' ? 'active-nav' : ''}`} onClick={() => handleNavClick('/players')}>View Players</button>          
          <button className={`nav-btn ${currentPath === '/summary' || currentPath === '/roster' ? 'active-nav' : ''}`} onClick={() => handleNavClick('/summary')}>All Teams Summary</button>
          
          {user ? (
            <button className="nav-btn" style={{backgroundColor: '#dc2626', marginLeft: '1rem'}} onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>Logout</button>
          ) : (
            <button className="nav-btn" style={{backgroundColor: '#2563eb', marginLeft: '1rem'}} onClick={() => handleNavClick('/login')}>Admin Login</button>
          )}
        </div>
      </nav>

      <div className="page-content">
        <Routes>
          <Route 
            path="/" 
            element={
              <Home 
                setCurrentView={setCurrentView} 
                user={user} 
                news={news} 
                onAddNews={handleAddNews} 
                onRemoveNews={handleRemoveNews} 
                teams={teams}
                setActiveTeamId={setActiveTeamId}
              />
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/players" element={<ViewPlayers teams={teams} unsoldPlayers={unsoldPlayers} />} />          
          <Route path="/summary" element={<Summary teams={teams} setActiveTeamId={setActiveTeamId} setCurrentView={setCurrentView} />} />
          <Route path="/roster" element={<Roster activeTeam={activeTeam} setCurrentView={setCurrentView} handleDownloadPDF={handleDownloadPDF} />} />
          
          <Route path="/live" element={
            <ProtectedRoute user={user}>
              <LiveAuction 
                teams={teams}
                unsoldPlayers={unsoldPlayers}
                setUnsoldPlayers={setUnsoldPlayers}
                setPlayerId={setPlayerId}
                setCurrentView={setCurrentView}
              />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute user={user}>
              <Dashboard 
                teams={teams} activeTeamId={activeTeamId} activeTeam={activeTeam}
                handleSwitchTeam={handleSwitchTeam}
                playerId={playerId} setPlayerId={setPlayerId}
                price={price} setPrice={setPrice}
                error={error} setError={setError}
                boostAmount={boostAmount} setBoostAmount={setBoostAmount}
                playerToSell={playerToSell}
                handleSellPlayer={handleSellPlayer} handleMarkUnsold={handleMarkUnsold}
                handleIncreaseBudget={handleIncreaseBudget} handleRemovePlayer={handleRemovePlayer}
                handleDownloadPDF={handleDownloadPDF}
              />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}