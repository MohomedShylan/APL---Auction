import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import './App.css';

import { MASTER_PLAYERS } from './playersData';
import { TEAM_CAPTAINS } from './captainsData';
import { GLADIATORS_SQUAD } from './gladiatorsData';
import { FOREIGN_PLAYERS } from './foreignPlayersData';

import Home from './components/Home';
import Dashboard from './components/Dashboard';
import UnsoldPool from './components/UnsoldPool';
import Summary from './components/Summary';
import Roster from './components/Roster';
import LiveAuction from './components/LiveAuction';

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

export default function App() {
  const [teams, setTeams] = useState(INITIAL_TEAMS);
  const [unsoldPlayers, setUnsoldPlayers] = useState([]); 
  const [activeTeamId, setActiveTeamId] = useState('falcons');
  const [currentView, setCurrentView] = useState('home');
  
  const [playerId, setPlayerId] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [boostAmount, setBoostAmount] = useState('');

  const activeTeam = teams.find(t => t.id === activeTeamId);
  const parsedId = parseInt(playerId, 10);
  
  let playerToSell = null;
  if (!isNaN(parsedId)) {
    playerToSell = MASTER_PLAYERS.find(p => p.id === parsedId) || FOREIGN_PLAYERS.find(p => p.id === parsedId);
  }

  const handleMarkUnsold = () => {
    setError('');
    if (!playerId) return setError("Please enter a Player ID.");
    if (!playerToSell) return setError("Player ID not found.");

    const isAlreadySold = teams.some(team => team.players.some(p => p.id === parsedId));
    if (isAlreadySold) return setError(`${playerToSell.name} has already been sold!`);

    const isAlreadyUnsold = unsoldPlayers.some(p => p.id === parsedId);
    if (isAlreadyUnsold) return setError(`${playerToSell.name} is already in the Unsold Pool!`);

    setUnsoldPlayers([...unsoldPlayers, playerToSell]);
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

    setTeams(teams.map(team => {
      if (team.id === activeTeamId) {
        return {
          ...team,
          budget: team.budget - sellPrice,
          players: [...team.players, { 
            id: parsedId, name: playerToSell.name, role: playerToSell.role, price: sellPrice, isForeign: playerToSell.isForeign
          }]
        };
      }
      return team;
    }));

    setUnsoldPlayers(unsoldPlayers.filter(p => p.id !== parsedId));
    setPlayerId('');
    setPrice('');
  };

  const handleIncreaseBudget = (e) => {
    e.preventDefault();
    const amount = parseInt(boostAmount, 10);
    if (isNaN(amount) || amount <= 0) return;
    setTeams(teams.map(team => team.id === activeTeamId ? { ...team, budget: team.budget + amount } : team));
    setBoostAmount('');
    setError('');
  };

  const handleRemovePlayer = (teamId, playerIdToRemove) => {
    setTeams(teams.map(team => {
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
    }));
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

  return (
    <div className="app-wrapper">
      <nav className="top-nav">
        <div className="nav-brand">
          <img src="/logos/APL logo.png" alt="APL Logo" className="nav-logo" />
          <div>APL <span>Auction</span></div>
        </div>
        <div className="nav-links">
          <button className={`nav-btn ${currentView === 'home' ? 'active-nav' : ''}`} onClick={() => setCurrentView('home')}>Home</button>
          <button className={`nav-btn ${currentView === 'live' ? 'active-nav' : ''}`} onClick={() => setCurrentView('live')}>Live Presentation</button>
          <button className={`nav-btn ${currentView === 'dashboard' ? 'active-nav' : ''}`} onClick={() => setCurrentView('dashboard')}>Management Dashboard</button>
          <button className={`nav-btn ${currentView === 'unsold' ? 'active-nav' : ''}`} onClick={() => setCurrentView('unsold')}>Unsold Pool</button>
          <button className={`nav-btn ${currentView === 'summary' || currentView === 'roster' ? 'active-nav' : ''}`} onClick={() => setCurrentView('summary')}>All Teams Summary</button>
        </div>
      </nav>

      <div className="page-content">
        {currentView === 'home' && <Home setCurrentView={setCurrentView} />}
        {currentView === 'live' && (
          <LiveAuction 
            teams={teams}
            unsoldPlayers={unsoldPlayers}
            setUnsoldPlayers={setUnsoldPlayers}
            setPlayerId={setPlayerId}
            setCurrentView={setCurrentView}
          />
        )}
        {currentView === 'dashboard' && (
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
        )}
        
        {currentView === 'unsold' && <UnsoldPool unsoldPlayers={unsoldPlayers} setPlayerId={setPlayerId} setCurrentView={setCurrentView} />}
        
        {currentView === 'summary' && <Summary teams={teams} setActiveTeamId={setActiveTeamId} setCurrentView={setCurrentView} />}
        
        {currentView === 'roster' && <Roster activeTeam={activeTeam} setCurrentView={setCurrentView} handleDownloadPDF={handleDownloadPDF} />}

        
      </div>
    </div>
  );
}
