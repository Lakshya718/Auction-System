import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api/axios';

const TeamDetails = () => {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await API.get(`teams/${id}`);
        setTeam(response.data);
      } catch {
        setError('Failed to fetch team details.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [id]);

  if (loading) return <p>Loading team details...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!team) return <p>Team not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-4">{team.teamName}</h2>
      {team.teamLogo && (
        <div className="mb-4">
          <img src={team.teamLogo} alt={team.teamName} className="w-48 h-48 object-cover rounded" />
        </div>
      )}
      <p><strong>Owner Name:</strong> {team.owner?.name || 'N/A'}</p>
      <p><strong>Owner Email:</strong> {team.owner?.email || 'N/A'}</p>
      <p><strong>Purse Remaining:</strong> ${team.remainingBudget || 'N/A'}</p>
      <h3 className="text-2xl font-semibold mt-6 mb-2">Players List</h3>
      {team.players && team.players.length > 0 ? (
        <ul className="list-disc list-inside">
          {team.players.map((player) => (
            <li key={player._id}>
              Player Name : {player.playerName} and 
               Purchase Price: ${player.purchasePrice}
            </li>
          ))}
        </ul>
      ) : (
        <p>No players found for this team.</p>
      )}
    </div>
  );
};

export default TeamDetails;
