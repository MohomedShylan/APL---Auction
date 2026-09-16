import React from 'react';
import AirplaneIcon from './AirplaneIcon';
import './UnsoldPlayers.css';

export default function UnsoldPlayers({ unsoldPlayers }) {
  return (
    <div className="unsold-page">
      <header className="unsold-header">
        <h1>Unsold Players Pool</h1>
        <p>{unsoldPlayers.length} players currently unsold</p>
      </header>

      <div className="unsold-content">
        {unsoldPlayers.length === 0 ? (
          <div className="empty-state-card">
            <h2>No Unsold Players</h2>
            <p>All presented players have been sold so far!</p>
          </div>
        ) : (
          <div className="full-width-card">
            <table className="large-table">
              <thead>
                <tr>
                  <th>Player ID</th>
                  <th>Player Name</th>
                  <th>Specialty Role</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {unsoldPlayers.map((player, index) => (
                  <tr key={index}>
                    <td data-label="Player ID" className="id-col">#{player.id}</td>
                    <td data-label="Player Name" className="name-col">
                      <strong>{player.name}</strong>
                      {player.isForeign && <AirplaneIcon />}
                    </td>
                    <td data-label="Specialty Role" className="role-col">
                      <span className="role-badge">{player.role}</span>
                    </td>
                    <td data-label="Status" className="price-col text-right">
                      Unsold
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}