import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

const MatchDetails = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const res = await axios.get(`/api/matches/${id}`);
        if (res.data.success) {
          setMatch(res.data.match);
        } else {
          setError(res.data.error || 'Failed to load match details');
        }
      } catch {
        setError('Failed to load match details');
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id]);

  if (loading) return <p>Loading match details...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!match) return <p>No match found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-4">Match Details</h2>
      <div className="mb-4">
        <strong>Tournament:</strong> {match.tournament?.tournamentName || 'N/A'}
      </div>
      <div className="mb-4 flex items-center space-x-4">
        <div>
          <img src={match.team1?.logo} alt={match.team1?.name} className="w-20 h-20 object-contain" />
          <p>{match.team1?.name}</p>
        </div>
        <span>vs</span>
        <div>
          <img src={match.team2?.logo} alt={match.team2?.name} className="w-20 h-20 object-contain" />
          <p>{match.team2?.name}</p>
        </div>
      </div>
      <div className="mb-4">
        <strong>Match Date:</strong> {new Date(match.matchDate).toLocaleString()}
      </div>
      <div className="mb-4">
        <strong>Venue:</strong> {match.venue || 'TBD'}
      </div>
      <div className="mb-4">
        <strong>Match Status:</strong> {match.matchStatus || 'N/A'}
      </div>
      <div className="mb-4">
        <strong>Match Result:</strong> {match.matchResult || 'N/A'}
      </div>
      <div className="mb-4">
        <strong>Toss Winner:</strong> {match.tossWinner?.name || 'N/A'}
      </div>
      <div className="mb-4">
        <strong>Elected To:</strong> {match.electedTo || 'N/A'}
      </div>
      <div className="mb-4">
        <strong>Man of the Match:</strong> {match.manOfTheMatch?.playerName || 'N/A'}
      </div>
      <div className="mb-4">
        <strong>Scorecard:</strong>
        {match.scorecard && match.scorecard.length > 0 ? (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 px-2 py-1">Player</th>
                <th className="border border-gray-300 px-2 py-1">Runs</th>
                <th className="border border-gray-300 px-2 py-1">Wickets</th>
              </tr>
            </thead>
            <tbody>
              {match.scorecard.map((entry, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-2 py-1">{entry.playerName || 'N/A'}</td>
                  <td className="border border-gray-300 px-2 py-1">{entry.runs || 0}</td>
                  <td className="border border-gray-300 px-2 py-1">{entry.wicketsTaken || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No scorecard available.</p>
        )}
      </div>
      <div className="mb-4">
        <strong>Team Stats:</strong>
        {match.teamStats ? (
          <pre className="whitespace-pre-wrap">{JSON.stringify(match.teamStats, null, 2)}</pre>
        ) : (
          <p>No team stats available.</p>
        )}
      </div>
      <Link
        to={`/matches/${id}/update`}
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Update Match
      </Link>
    </div>
  );
};

export default MatchDetails;
