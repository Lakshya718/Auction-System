import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaSave,
  FaTimesCircle,
  FaCheckCircle,
  FaExclamationCircle,
} from 'react-icons/fa';

const MatchResult = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    matchStatus: '',
    matchResult: '',
    tossWinner: '',
    electedTo: '',
    manOfTheMatch: '',
    scorecard: [],
    teamStats: [],
  });
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const matchRes = await API.get(`/matches/${id}`);
        setMatch(matchRes.data.match);
        setFormData({
          matchStatus: matchRes.data.match.matchStatus || '',
          matchResult: matchRes.data.match.matchResult || '',
          tossWinner: matchRes.data.match.tossWinner?._id || '',
          electedTo: matchRes.data.match.electedTo || '',
          manOfTheMatch: matchRes.data.match.manOfTheMatch?._id || '',
          scorecard: matchRes.data.match.scorecard || [],
          teamStats: matchRes.data.match.teamStats || [],
        });

        const [teamsRes, playersRes] = await Promise.all([
          API.get('/teams/all-teams'),
          API.get('/players/verified'),
        ]);
        setTeams(teamsRes.data);
        setPlayers(playersRes.data);
      } catch (err) {
        setError('Failed to fetch match details.');
        console.error('Error fetching match details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatchDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleScorecardChange = (playerIndex, field, value) => {
    const updatedScorecard = [...formData.scorecard];
    updatedScorecard[playerIndex] = {
      ...updatedScorecard[playerIndex],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, scorecard: updatedScorecard }));
  };

  const handleTeamStatsChange = (teamIndex, field, value) => {
    const updatedTeamStats = [...formData.teamStats];
    updatedTeamStats[teamIndex] = {
      ...updatedTeamStats[teamIndex],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, teamStats: updatedTeamStats }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await API.patch(`/matches/${id}`, formData);
      if (res.data.success) {
        setSuccess('Match updated successfully!');
        setMatch(res.data.match); // Update local match state with new data
      } else {
        setError(res.data.error || 'Failed to update match.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update match.');
      console.error('Error updating match:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !match) {
    return (
      <div className="text-red-500 text-center mt-10 text-xl">{error}</div>
    );
  }

  if (!match) {
    return (
      <div className="text-gray-400 text-center mt-10 text-xl">
        Match not found.
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="h-[5vh]"></div>
      <h2 className="text-4xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Update Match Result for {match.tournament?.tournamentName} -{' '}
        {match.team1?.name} vs {match.team2?.name}
      </h2>

      {error && (
        <p className="bg-red-800 text-white p-3 rounded-lg flex items-center justify-center mb-6">
          <FaExclamationCircle className="mr-2" />
          {error}
        </p>
      )}
      {success && (
        <p className="bg-green-800 text-white p-3 rounded-lg flex items-center justify-center mb-6">
          <FaCheckCircle className="mr-2" />
          {success}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 shadow-xl rounded-2xl p-8 space-y-6 max-w-4xl mx-auto"
      >
        {/* Match Status */}
        <div>
          <label
            htmlFor="matchStatus"
            className="block text-gray-300 text-sm font-bold mb-2"
          >
            Match Status
          </label>
          <select
            id="matchStatus"
            name="matchStatus"
            value={formData.matchStatus}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors appearance-none"
          >
            <option value="">Select Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="in-progress">In-Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Match Result (only if completed) */}
        {formData.matchStatus === 'completed' && (
          <div>
            <label
              htmlFor="matchResult"
              className="block text-gray-300 text-sm font-bold mb-2"
            >
              Match Result
            </label>
            <select
              id="matchResult"
              name="matchResult"
              value={formData.matchResult}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors appearance-none"
            >
              <option value="">Select Result</option>
              <option value="team1">{match.team1?.name} Won</option>
              <option value="team2">{match.team2?.name} Won</option>
              <option value="tie">Tie</option>
              <option value="no-result">No Result</option>
            </select>
          </div>
        )}

        {/* Toss Winner */}
        <div>
          <label
            htmlFor="tossWinner"
            className="block text-gray-300 text-sm font-bold mb-2"
          >
            Toss Winner
          </label>
          <select
            id="tossWinner"
            name="tossWinner"
            value={formData.tossWinner}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors appearance-none"
          >
            <option value="">Select Toss Winner</option>
            <option value={match.team1?._id}>{match.team1?.name}</option>
            <option value={match.team2?._id}>{match.team2?.name}</option>
          </select>
        </div>

        {/* Elected To */}
        {formData.tossWinner && (
          <div>
            <label
              htmlFor="electedTo"
              className="block text-gray-300 text-sm font-bold mb-2"
            >
              Elected To
            </label>
            <select
              id="electedTo"
              name="electedTo"
              value={formData.electedTo}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors appearance-none"
            >
              <option value="">Select Option</option>
              <option value="bat">Bat</option>
              <option value="bowl">Bowl</option>
            </select>
          </div>
        )}

        {/* Man of the Match */}
        <div>
          <label
            htmlFor="manOfTheMatch"
            className="block text-gray-300 text-sm font-bold mb-2"
          >
            Man of the Match
          </label>
          <select
            id="manOfTheMatch"
            name="manOfTheMatch"
            value={formData.manOfTheMatch}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors appearance-none"
          >
            <option value="">Select Player</option>
            {players.map((player) => (
              <option key={player._id} value={player._id}>
                {player.playerName}
              </option>
            ))}
          </select>
        </div>

        {/* Team Stats */}
        <h3 className="text-2xl font-bold text-white mt-8 mb-4">
          Team Statistics
        </h3>
        {['team1', 'team2'].map((teamKey, index) => {
          const team = match[teamKey];
          const teamStat = formData.teamStats.find(
            (ts) => ts.team === team?._id
          ) || { team: team?._id, score: 0, overs: 0, wickets: 0, extras: {} };
          return (
            <div key={teamKey} className="bg-gray-700 p-4 rounded-lg mb-4">
              <h4 className="text-xl font-semibold mb-3">
                {team?.name || `Team ${index + 1}`}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-1">
                    Score
                  </label>
                  <input
                    type="number"
                    value={teamStat.score}
                    onChange={(e) =>
                      handleTeamStatsChange(
                        formData.teamStats.findIndex(
                          (ts) => ts.team === team?._id
                        ),
                        'score',
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-1">
                    Overs
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={teamStat.overs}
                    onChange={(e) =>
                      handleTeamStatsChange(
                        formData.teamStats.findIndex(
                          (ts) => ts.team === team?._id
                        ),
                        'overs',
                        parseFloat(e.target.value)
                      )
                    }
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-1">
                    Wickets
                  </label>
                  <input
                    type="number"
                    value={teamStat.wickets}
                    onChange={(e) =>
                      handleTeamStatsChange(
                        formData.teamStats.findIndex(
                          (ts) => ts.team === team?._id
                        ),
                        'wickets',
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          );
        })}

        {/* Scorecard (simplified for now) */}
        <h3 className="text-2xl font-bold text-white mt-8 mb-4">
          Player Scorecard
        </h3>
        {match.team1?.players
          ?.map((playerId) => players.find((p) => p._id === playerId))
          ?.filter(Boolean)
          .map((player, index) => (
            <div key={player._id} className="bg-gray-700 p-4 rounded-lg mb-2">
              <h4 className="text-xl font-semibold mb-2">
                {player.playerName}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-1">
                    Runs
                  </label>
                  <input
                    type="number"
                    value={
                      formData.scorecard.find((s) => s.player === player._id)
                        ?.runs || 0
                    }
                    onChange={(e) =>
                      handleScorecardChange(
                        formData.scorecard.findIndex(
                          (s) => s.player === player._id
                        ),
                        'runs',
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-bold mb-1">
                    Wickets Taken
                  </label>
                  <input
                    type="number"
                    value={
                      formData.scorecard.find((s) => s.player === player._id)
                        ?.wicketsTaken || 0
                    }
                    onChange={(e) =>
                      handleScorecardChange(
                        formData.scorecard.findIndex(
                          (s) => s.player === player._id
                        ),
                        'wicketsTaken',
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {/* Add more scorecard fields as needed */}
              </div>
            </div>
          ))}

        <div className="flex justify-end gap-4 mt-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors flex items-center"
          >
            <FaTimesCircle className="mr-2" /> Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <FaSave className="mr-2" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MatchResult;
