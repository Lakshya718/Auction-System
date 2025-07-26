import React, { useEffect, useState } from 'react';
import API from '../../api/axios'; 
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaCalendarAlt, FaUsers, FaTrophy, FaEdit } from 'react-icons/fa';

const AllMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await API.get('/matches/all-matches');
        setMatches(response.data.matches);
      } catch (err) {
        setError('Failed to fetch matches.');
        console.error('Error fetching matches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-900"><LoadingSpinner /></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10 text-xl">{error}</div>;
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        All Matches
      </h2>
      {matches.length === 0 ? (
        <p className="text-center text-gray-400 text-xl">No matches found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {matches.map((match) => (
            <div key={match._id} className="bg-gray-800 rounded-lg shadow-lg p-6 transform transition duration-300 hover:scale-105 hover:shadow-2xl">
              <h3 className="text-2xl font-bold mb-2 text-purple-300">{match.tournament?.tournamentName || 'N/A'}</h3>
              <p className="text-gray-300 mb-4 flex items-center"><FaCalendarAlt className="mr-2 text-purple-400" /> {new Date(match.matchDate).toLocaleString()}</p>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <FaUsers className="mr-2 text-purple-400" />
                  <span className="text-xl font-semibold">{match.team1?.name || 'N/A'}</span>
                </div>
                <span className="text-gray-400 text-lg">vs</span>
                <div className="flex items-center">
                  <span className="text-xl font-semibold">{match.team2?.name || 'N/A'}</span>
                  <FaUsers className="ml-2 text-purple-400" />
                </div>
              </div>
              <p className={`text-lg font-semibold ${match.matchStatus === 'completed' ? 'text-green-500' : match.matchStatus === 'in-progress' ? 'text-yellow-500' : 'text-blue-400'}`}>
                Status: {match.matchStatus}
              </p>
              {match.matchStatus === 'completed' && match.matchResult && (
                <p className="text-md text-gray-400 mt-2">Result: {match.matchResult === 'team1' ? match.team1?.name : match.team2?.name} won</p>
              )}
              <div className="mt-4 flex justify-end">
                <Link
                  to={`/matches/update/${match._id}`}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full flex items-center transition duration-300"
                >
                  <FaEdit className="mr-2" /> Update Result
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllMatches;
