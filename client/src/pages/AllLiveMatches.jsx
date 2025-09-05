import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from '../../api/axios';

const AllLiveMatches = () => {
  const navigate = useNavigate();
  const role = useSelector((state) => state.user.role);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await axios.get('/live-matches/all');
      if (response.data.success) {
        setMatches(response.data.matches);
      } else {
        setError('Failed to fetch matches');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live':
        return 'text-green-600 bg-green-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      case 'upcoming':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Live Cricket Matches
            </h1>
            {role === 'admin' && (
              <button
                onClick={() => navigate('/create-live-match')}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create New Match
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {matches.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg
                  className="mx-auto h-24 w-24"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No matches found
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first live cricket match to get started!
              </p>
              {role === 'admin' && (
                <button
                  onClick={() => navigate('/create-live-match')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create First Match
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => (
                <div
                  key={match._id}
                  className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    {/* Match Status */}
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(match.status)}`}
                      >
                        {match.status.toUpperCase()}
                      </span>
                      {match.status === 'live' && (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                          <span className="text-sm text-red-600 font-medium">
                            LIVE
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Match Title */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                      {match.matchTitle}
                    </h3>

                    {/* Teams */}
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex-1 text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-blue-600 font-bold text-lg">
                            {match.team1.charAt(0)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-800">
                          {match.team1}
                        </p>
                      </div>

                      <div className="px-4">
                        <span className="text-gray-400 font-bold text-lg">
                          VS
                        </span>
                      </div>

                      <div className="flex-1 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-red-600 font-bold text-lg">
                            {match.team2.charAt(0)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-800">
                          {match.team2}
                        </p>
                      </div>
                    </div>

                    {/* Match Details */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                        <span>Venue:</span>
                        <span className="font-medium">
                          {match.venue || 'TBD'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                        <span>Created:</span>
                        <span className="font-medium">
                          {formatDate(match.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/live-scorecard/${match._id}`)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                      >
                        View Scorecard
                      </button>

                      {match.status === 'upcoming' && (
                        <button
                          onClick={() =>
                            navigate(`/live-match/${match._id}/setup`)
                          }
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                        >
                          Start Match
                        </button>
                      )}

                      {match.status === 'live' && role === 'admin' && (
                        <button
                          onClick={() =>
                            navigate(`/live-match/${match._id}/scoring`)
                          }
                          className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 text-sm font-medium"
                        >
                          Live Scoring
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Refresh Button */}
          <div className="text-center mt-8">
            <button
              onClick={fetchMatches}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              🔄 Refresh Matches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllLiveMatches;
