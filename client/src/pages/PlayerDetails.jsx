import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api/axios';

const PlayerDetails = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await API.get(`players/${id}`);
        setPlayer(response.data);
      } catch {
        setError('Failed to fetch player details.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  if (loading) return <p>Loading player details...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!player) return <p>Player not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-4">{player.name}</h2>
      <img
        src={player.profilePhoto || '/default-profile.png'}
        alt={player.name}
        className="w-64 h-64 object-cover rounded mb-4"
      />
      <p><strong>Age:</strong> {player.age}</p>
      <p><strong>Role:</strong> {player.role}</p>
      <p><strong>Status:</strong> {player.status}</p>
      <p><strong>Base Price:</strong> {player.basePrice}</p>
      <p><strong>Description:</strong> {player.description || 'N/A'}</p>
    </div>
  );
};

export default PlayerDetails;
