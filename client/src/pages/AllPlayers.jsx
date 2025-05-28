import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../api/axios';

const AllPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await API.get('players/all');
        setPlayers(response.data);
      } catch {
        setError('Failed to fetch players.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const handlePlayerClick = (playerId) => {
    navigate(`/players/${playerId}`);
  };

  if (loading) return <p>Loading players...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center">All Players</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {players.map((player) => (
          <div
            key={player._id}
            className="cursor-pointer border border-gray-300 rounded p-4 shadow hover:shadow-lg transition"
            onClick={() => handlePlayerClick(player._id)}
          >
            <img
              src={player.profilePhoto || '/default-profile.png'}
              alt={player.name}
              className="w-full h-48 object-cover rounded mb-2"
            />
            <h3 className="text-xl font-semibold">{player.playerName}</h3>
            <p>Age: {player.age}</p>
            <p>Role: {player.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllPlayers;
