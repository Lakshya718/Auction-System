import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';

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

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white"><p className="text-red-500 text-xl">{error}</p></div>;
  if (!team) return <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white"><p className="text-gray-400 text-xl">Team not found.</p></div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 pt-20">
      <div className="max-w-6xl mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden md:flex">
        {team.teamLogo && (
          <div className="md:flex-shrink-0">
            <img
              src={team.teamLogo}
              alt={team.teamName}
              className="w-full h-64 object-cover md:w-64 md:h-full rounded-l-lg"
            />
          </div>
        )}
        <div className="p-8 flex-grow">
          <h2 className="text-4xl font-extrabold text-purple-400 mb-4 border-b-2 border-purple-600 pb-2">
            {team.teamName}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <p className="text-lg">
              <strong className="text-pink-400">Owner Name:</strong> {team.owner?.name || 'N/A'}
            </p>
            <p className="text-lg">
              <strong className="text-pink-400">Owner Email:</strong> {team.owner?.email || 'N/A'}
            </p>
            <p className="text-lg">
              <strong className="text-pink-400">Purse Remaining:</strong> ${team.remainingBudget || 'N/A'}
            </p>
          </div>

          <h3 className="text-3xl font-bold text-purple-400 mt-8 mb-4 border-b-2 border-purple-600 pb-2">
            Players List
          </h3>
          {team.players && team.players.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {team.players.map((player) => (
                <div
                  key={player._id}
                  className="bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <p className="text-lg font-semibold text-white">
                    Player Name: <span className="text-pink-300">{player.playerName}</span>
                  </p>
                  <p className="text-md text-gray-300">
                    Purchase Price: <span className="text-green-400">${player.purchasePrice}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-lg">No players found for this team.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamDetails;
