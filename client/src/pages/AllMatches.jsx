import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaCalendarAlt,
  FaUsers,
  FaTrophy,
  FaEdit,
  FaEye,
  FaFutbol,
  FaVolleyballBall,
  FaBasketballBall,
} from 'react-icons/fa';
import { GiCricketBat, GiBasketballBall, GiRunningNinja } from 'react-icons/gi';

const AllMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sportFilter, setSportFilter] = useState('all');

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
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-10 text-xl">{error}</div>
    );
  }

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-white">
      <div className="h-[4vh]"></div>
      <h2 className="text-3xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        All Matches
      </h2>

      {/* Sport filter */}
      <div className="mb-4 flex justify-center">
        <div className="inline-flex bg-gray-800 rounded-lg p-0.5 overflow-x-auto custom-scrollbar max-w-full text-xs">
          <button
            onClick={() => setSportFilter('all')}
            className={`px-2 py-1 rounded-md ${
              sportFilter === 'all'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSportFilter('cricket')}
            className={`px-2 py-1 rounded-md flex items-center ${
              sportFilter === 'cricket'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <GiCricketBat className="mr-1 text-xs" /> Cricket
          </button>
          <button
            onClick={() => setSportFilter('football')}
            className={`px-2 py-1 rounded-md flex items-center ${
              sportFilter === 'football'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaFutbol className="mr-1 text-xs" /> Football
          </button>
          <button
            onClick={() => setSportFilter('basketball')}
            className={`px-2 py-1 rounded-md flex items-center ${
              sportFilter === 'basketball'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <GiBasketballBall className="mr-1 text-xs" /> Basketball
          </button>
          <button
            onClick={() => setSportFilter('volleyball')}
            className={`px-2 py-1 rounded-md flex items-center ${
              sportFilter === 'volleyball'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FaVolleyballBall className="mr-1 text-xs" /> Volleyball
          </button>
          <button
            onClick={() => setSportFilter('kabaddi')}
            className={`px-2 py-1 rounded-md flex items-center ${
              sportFilter === 'kabaddi'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <GiRunningNinja className="mr-1 text-xs" /> Kabaddi
          </button>
        </div>
      </div>

      {matches.length === 0 ? (
        <p className="text-center text-gray-400 text-base">No matches found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {matches
            .filter(
              (match) => sportFilter === 'all' || match.sport === sportFilter
            )
            .map((match) => (
              <div
                key={match._id}
                className="bg-gray-800 rounded-lg shadow p-3 transform transition duration-200 hover:scale-102 border border-gray-700"
              >
                <h3 className="text-lg font-bold mb-1 text-purple-300 truncate">
                  {match.tournament?.tournamentName || 'N/A'}
                </h3>
                <p className="text-gray-300 mb-2 flex items-center text-xs">
                  <FaCalendarAlt className="mr-1 text-purple-400" />{' '}
                  {new Date(match.matchDate).toLocaleString()}
                </p>

                <div className="flex justify-between mb-3">
                  <div className="flex flex-col items-center w-2/5">
                    {match.team1?.logo && (
                      <img
                        src={match.team1.logo}
                        alt={match.team1.name}
                        className="w-12 h-12 object-contain rounded-full bg-white p-1 mb-1"
                      />
                    )}
                    <span className="text-sm font-medium text-center truncate max-w-full">
                      {match.team1?.name || 'N/A'}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <span className="text-gray-400 text-base font-bold">
                      VS
                    </span>
                    <span className="text-xxs px-2 py-0.5 rounded-full bg-gray-700 text-center max-w-[60px] truncate">
                      {match.venue || 'TBD'}
                    </span>
                    {match.sport && (
                      <div className="mt-1 flex items-center">
                        {match.sport === 'cricket' && (
                          <GiCricketBat className="text-green-400 text-xs" />
                        )}
                        {match.sport === 'football' && (
                          <FaFutbol className="text-blue-400 text-xs" />
                        )}
                        {match.sport === 'basketball' && (
                          <GiBasketballBall className="text-orange-400 text-xs" />
                        )}
                        {match.sport === 'volleyball' && (
                          <FaVolleyballBall className="text-yellow-400 text-xs" />
                        )}
                        {match.sport === 'kabaddi' && (
                          <GiRunningNinja className="text-red-400 text-xs" />
                        )}
                        <span className="text-xxs capitalize ml-1">
                          {match.sport}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center w-2/5">
                    {match.team2?.logo && (
                      <img
                        src={match.team2.logo}
                        alt={match.team2.name}
                        className="w-12 h-12 object-contain rounded-full bg-white p-1 mb-1"
                      />
                    )}
                    <span className="text-sm font-medium text-center truncate max-w-full">
                      {match.team2?.name || 'N/A'}
                    </span>
                  </div>
                </div>

                <p
                  className={`text-xs font-medium ${
                    match.matchStatus === 'completed'
                      ? 'text-green-500'
                      : match.matchStatus === 'in-progress'
                        ? 'text-yellow-500'
                        : 'text-blue-400'
                  }`}
                >
                  Status: {match.matchStatus}
                </p>

                {match.matchStatus === 'completed' && match.scoreSummary && (
                  <div className="mt-1 bg-gray-700 p-1.5 rounded text-xs">
                    <p className="text-white">
                      <span className="font-medium">{match.team1?.name}:</span>{' '}
                      {match.scoreSummary.team1Score}
                    </p>
                    <p className="text-white">
                      <span className="font-medium">{match.team2?.name}:</span>{' '}
                      {match.scoreSummary.team2Score}
                    </p>
                    <p className="text-green-400 text-center mt-0.5 font-medium text-xs">
                      {match.matchResult === 'team1'
                        ? `${match.team1?.name} won`
                        : match.matchResult === 'team2'
                          ? `${match.team2?.name} won`
                          : match.matchResult === 'tie'
                            ? 'Match Tied'
                            : 'No Result'}
                    </p>
                  </div>
                )}

                <div className="mt-2 flex justify-between">
                  <Link
                    to={`/matches/view/${match._id}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 rounded flex items-center transition duration-200"
                  >
                    <FaEye className="mr-1 text-xs" /> View
                  </Link>
                  <Link
                    to={`/matches/update/${match._id}`}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs py-1 px-2 rounded flex items-center transition duration-200"
                  >
                    <FaEdit className="mr-1 text-xs" /> Update
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
