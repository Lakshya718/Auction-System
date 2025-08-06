import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaTrophy,
  FaUserAlt,
  FaHistory,
  FaFutbol,
  FaVolleyballBall,
} from 'react-icons/fa';

const MatchDetails = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await API.get(`/matches/${id}`);
        if (res.data.success) {
          setMatch(res.data.match);
        } else {
          setError(res.data.error || 'Failed to load match details');
        }
      } catch (err) {
        console.error('Error fetching match details:', err);
        setError('Failed to load match details');
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 min-h-screen text-white p-6">
        <div className="h-[5vh]"></div>
        <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
          <p className="text-red-500 text-xl text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="bg-gray-900 min-h-screen text-white p-6">
        <div className="h-[5vh]"></div>
        <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
          <p className="text-xl text-center">No match found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <div className="h-[5vh]"></div>
      <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          {match.tournament?.tournamentName || 'Tournament Match'}
        </h2>

        <div className="mb-8 flex flex-col md:flex-row items-center justify-between p-4 bg-gray-700 rounded-lg">
          <div className="flex flex-col items-center mb-4 md:mb-0">
            <img
              src={match.team1?.logo || '/placeholder-logo.png'}
              alt={match.team1?.name}
              className="w-24 h-24 object-contain rounded-full bg-white p-2"
            />
            <p className="mt-2 font-bold text-xl">
              {match.team1?.name || 'Team 1'}
            </p>
          </div>

          <div className="flex flex-col items-center mb-4 md:mb-0">
            <div className="text-2xl font-bold text-purple-400 mb-2">VS</div>
            <div className="text-sm bg-gray-600 px-3 py-1 rounded-full">
              {match.matchStatus === 'completed'
                ? 'Match Completed'
                : match.matchStatus === 'in-progress'
                  ? 'In Progress'
                  : 'Upcoming'}
            </div>
            {match.sport && (
              <div className="mt-3 flex items-center text-xl">
                {match.sport === 'cricket' && (
                  <GiCricketBat className="text-green-400 mr-2" />
                )}
                {match.sport === 'football' && (
                  <FaFutbol className="text-blue-400 mr-2" />
                )}
                {match.sport === 'volleyball' && (
                  <FaVolleyballBall className="text-yellow-400 mr-2" />
                )}
                {match.sport === 'kabaddi' && (
                  <SiKabaddi className="text-red-400 mr-2" />
                )}
                <span className="capitalize">{match.sport}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center">
            <img
              src={match.team2?.logo || '/placeholder-logo.png'}
              alt={match.team2?.name}
              className="w-24 h-24 object-contain rounded-full bg-white p-2"
            />
            <p className="mt-2 font-bold text-xl">
              {match.team2?.name || 'Team 2'}
            </p>
          </div>
        </div>

        {match.matchStatus === 'completed' && match.scoreSummary && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Match Result
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-800 rounded">
                <p className="font-bold">{match.team1?.name}: </p>
                <p className="text-lg">{match.scoreSummary.team1Score}</p>
              </div>
              <div className="p-3 bg-gray-800 rounded">
                <p className="font-bold">{match.team2?.name}: </p>
                <p className="text-lg">{match.scoreSummary.team2Score}</p>
              </div>
            </div>
            <div className="mt-4 text-center text-lg font-bold text-green-400">
              {match.matchResult === 'team1'
                ? `${match.team1?.name} won`
                : match.matchResult === 'team2'
                  ? `${match.team2?.name} won`
                  : match.matchResult === 'tie'
                    ? 'Match Tied'
                    : 'No Result'}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Match Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2 text-purple-400" />
                <span className="font-semibold mr-2">Date:</span>
                <span>{new Date(match.matchDate).toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2 text-purple-400" />
                <span className="font-semibold mr-2">Venue:</span>
                <span>{match.venue || 'TBD'}</span>
              </div>
              <div className="flex items-center">
                <FaHistory className="mr-2 text-purple-400" />
                <span className="font-semibold mr-2">Status:</span>
                <span
                  className={`${
                    match.matchStatus === 'completed'
                      ? 'text-green-400'
                      : match.matchStatus === 'in-progress'
                        ? 'text-yellow-400'
                        : 'text-blue-400'
                  }`}
                >
                  {match.matchStatus || 'Scheduled'}
                </span>
              </div>
              {match.sport && (
                <div className="flex items-center">
                  {match.sport === 'cricket' && (
                    <GiCricketBat className="mr-2 text-purple-400" />
                  )}
                  {match.sport === 'football' && (
                    <FaFutbol className="mr-2 text-purple-400" />
                  )}
                  {match.sport === 'volleyball' && (
                    <FaVolleyballBall className="mr-2 text-purple-400" />
                  )}
                  {match.sport === 'kabaddi' && (
                    <SiKabaddi className="mr-2 text-purple-400" />
                  )}
                  <span className="font-semibold mr-2">Sport:</span>
                  <span className="capitalize">{match.sport}</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Toss Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <FaTrophy className="mr-2 text-purple-400" />
                <span className="font-semibold mr-2">Toss Winner:</span>
                <span>{match.tossWinner?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">Elected To:</span>
                <span>{match.electedTo || 'N/A'}</span>
              </div>
              {match.manOfTheMatch && (
                <div className="flex items-center">
                  <FaUserAlt className="mr-2 text-purple-400" />
                  <span className="font-semibold mr-2">Man of the Match:</span>
                  <span>{match.manOfTheMatch?.playerName || 'N/A'}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {match.scorecard && match.scorecard.length > 0 && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-purple-300">
              Scorecard
            </h3>
            <div className="overflow-x-auto">
              {match.sport === 'cricket' && (
                <table className="w-full table-auto">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left">Player</th>
                      <th className="px-4 py-2 text-left">Team</th>
                      <th className="px-4 py-2 text-right">Runs</th>
                      <th className="px-4 py-2 text-right">Wickets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {match.scorecard.map((entry, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'
                        }
                      >
                        <td className="px-4 py-2">
                          {entry.player?.playerName || 'N/A'}
                        </td>
                        <td className="px-4 py-2">
                          {entry.team === match.team1?._id
                            ? match.team1?.name
                            : entry.team === match.team2?._id
                              ? match.team2?.name
                              : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {entry.runs || 0}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {entry.wicketsTaken || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {match.sport === 'football' && (
                <table className="w-full table-auto">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left">Player</th>
                      <th className="px-4 py-2 text-left">Team</th>
                      <th className="px-4 py-2 text-right">Goals</th>
                      <th className="px-4 py-2 text-right">Assists</th>
                    </tr>
                  </thead>
                  <tbody>
                    {match.scorecard.map((entry, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'
                        }
                      >
                        <td className="px-4 py-2">
                          {entry.player?.playerName || 'N/A'}
                        </td>
                        <td className="px-4 py-2">
                          {entry.team === match.team1?._id
                            ? match.team1?.name
                            : entry.team === match.team2?._id
                              ? match.team2?.name
                              : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {entry.goals || 0}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {entry.assists || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {match.sport === 'basketball' && (
                <table className="w-full table-auto">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left">Player</th>
                      <th className="px-4 py-2 text-left">Team</th>
                      <th className="px-4 py-2 text-right">Points</th>
                      <th className="px-4 py-2 text-right">Rebounds</th>
                      <th className="px-4 py-2 text-right">Assists</th>
                    </tr>
                  </thead>
                  <tbody>
                    {match.scorecard.map((entry, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'
                        }
                      >
                        <td className="px-4 py-2">
                          {entry.player?.playerName || 'N/A'}
                        </td>
                        <td className="px-4 py-2">
                          {entry.team === match.team1?._id
                            ? match.team1?.name
                            : entry.team === match.team2?._id
                              ? match.team2?.name
                              : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {entry.points || 0}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {entry.rebounds || 0}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {entry.assists || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {match.sport === 'volleyball' && (
                <table className="w-full table-auto">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left">Player</th>
                      <th className="px-4 py-2 text-left">Team</th>
                      <th className="px-4 py-2 text-right">Points</th>
                      <th className="px-4 py-2 text-right">Blocks</th>
                      <th className="px-4 py-2 text-right">Aces</th>
                    </tr>
                  </thead>
                  <tbody>
                    {match.scorecard.map((entry, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'
                        }
                      >
                        <td className="px-4 py-2">
                          {entry.player?.playerName || 'N/A'}
                        </td>
                        <td className="px-4 py-2">
                          {entry.team === match.team1?._id
                            ? match.team1?.name
                            : entry.team === match.team2?._id
                              ? match.team2?.name
                              : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {entry.points || 0}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {entry.blocks || 0}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {entry.aces || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {match.sport === 'kabaddi' && (
                <table className="w-full table-auto">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left">Player</th>
                      <th className="px-4 py-2 text-left">Team</th>
                      <th className="px-4 py-2 text-right">Raid Points</th>
                      <th className="px-4 py-2 text-right">Tackle Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {match.scorecard.map((entry, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'
                        }
                      >
                        <td className="px-4 py-2">
                          {entry.player?.playerName || 'N/A'}
                        </td>
                        <td className="px-4 py-2">
                          {entry.team === match.team1?._id
                            ? match.team1?.name
                            : entry.team === match.team2?._id
                              ? match.team2?.name
                              : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {entry.raidPoints || 0}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {entry.tacklePoints || 0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {!match.sport && (
                <table className="w-full table-auto">
                  <thead className="bg-gray-800">
                    <tr>
                      <th className="px-4 py-2 text-left">Player</th>
                      <th className="px-4 py-2 text-left">Team</th>
                      <th className="px-4 py-2 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {match.scorecard.map((entry, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'
                        }
                      >
                        <td className="px-4 py-2">
                          {entry.player?.playerName || 'N/A'}
                        </td>
                        <td className="px-4 py-2">
                          {entry.team === match.team1?._id
                            ? match.team1?.name
                            : entry.team === match.team2?._id
                              ? match.team2?.name
                              : 'N/A'}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {entry.score ||
                            entry.runs ||
                            entry.points ||
                            entry.goals ||
                            0}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Link
            to="/all-matches"
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-full transition duration-300"
          >
            Back to All Matches
          </Link>
          <Link
            to={`/matches/update/${match._id}`}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition duration-300"
          >
            Update Match
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MatchDetails;
