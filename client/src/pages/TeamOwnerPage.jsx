import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000'); // Adjust port if needed

const TeamOwnerPage = () => {
  const [player, setPlayer] = useState(() => {
    const saved = localStorage.getItem('player');
    return saved ? JSON.parse(saved) : null;
  });
  const [teamOwnerName, setTeamOwnerName] = useState(() => {
    return localStorage.getItem('teamOwnerName') || '';
  });
  const [nameSubmitted, setNameSubmitted] = useState(() => {
    return localStorage.getItem('nameSubmitted') === 'true';
  });

  useEffect(() => {
    socket.on('player-info', (player) => {
      setPlayer(player);
      localStorage.setItem('player', JSON.stringify(player));
    });

    return () => {
      socket.off('player-info');
    };
  }, []);

  const handleBidClick = () => {
    if (teamOwnerName && teamOwnerName.trim() !== '') {
      socket.emit('bid-clicked', teamOwnerName);
    }
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (teamOwnerName.trim() !== '') {
      setNameSubmitted(true);
      localStorage.setItem('nameSubmitted', 'true');
      localStorage.setItem('teamOwnerName', teamOwnerName);
    }
  };

  const handleNameChange = (e) => {
    setTeamOwnerName(e.target.value);
    localStorage.setItem('teamOwnerName', e.target.value);
  };

  return (
    <div>
      <h2>Team Owner Page</h2>
      <button
        onClick={() => window.location.href = '/live-auction'}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Live Auction
      </button>
      {!nameSubmitted ? (
        <form onSubmit={handleNameSubmit}>
          <label>
            Enter your team owner name:
            <input
              type="text"
              value={teamOwnerName}
              onChange={handleNameChange}
              required
            />
          </label>
          <button type="submit">Submit</button>
        </form>
      ) : (
        <>
          {player ? (
            <div>
              <p>Player: {player.playerName}</p>
              <button onClick={handleBidClick}>Bid</button>
            </div>
          ) : (
            <p>No player info received yet.</p>
          )}
        </>
      )}
    </div>
  );
};

export default TeamOwnerPage;
