import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const LiveMatchSetup = () => {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const [setupData, setSetupData] = useState({
    striker: '',
    nonStriker: '',
    openingBowler: '',
  });

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await axios.get(`/live-matches/${matchId}`);
        if (response.data.success) {
          setMatch(response.data.match);
        } else {
          setError('Failed to fetch match details');
        }
      } catch (error) {
        setError(
          error.response?.data?.message || 'Failed to fetch match details'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  const getBattingTeamPlayers = () => {
    if (!match) return [];

    const firstInnings = match.innings[0];
    const battingTeam = firstInnings.battingTeam;

    if (battingTeam === match.team1) {
      return match.team1Players;
    } else {
      return match.team2Players;
    }
  };

  const getBowlingTeamPlayers = () => {
    if (!match) return [];

    const firstInnings = match.innings[0];
    const bowlingTeam = firstInnings.bowlingTeam;

    if (bowlingTeam === match.team1) {
      return match.team1Players;
    } else {
      return match.team2Players;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSetupData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStartMatch = async (e) => {
    e.preventDefault();

    if (
      !setupData.striker ||
      !setupData.nonStriker ||
      !setupData.openingBowler
    ) {
      setError('Please select opening batsmen and bowler');
      return;
    }

    if (setupData.striker === setupData.nonStriker) {
      setError('Striker and non-striker cannot be the same player');
      return;
    }

    setStarting(true);
    setError('');

    try {
      const response = await axios.put(
        `/live-matches/${matchId}/start`,
        setupData
      );

      if (response.data.success) {
        navigate(`/live-match/${matchId}/scoring`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to start match');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Match not found
          </h2>
          <button
            onClick={() => navigate('/live-matches')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  const battingPlayers = getBattingTeamPlayers();
  const bowlingPlayers = getBowlingTeamPlayers();
  const firstInnings = match.innings[0];

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Match Setup
          </h1>

          {/* Match Info */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">
              {match.matchTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
              <div>
                <p>
                  <strong>Teams:</strong> {match.team1} vs {match.team2}
                </p>
                <p>
                  <strong>Overs:</strong> {match.totalOvers}
                </p>
                <p>
                  <strong>Venue:</strong> {match.venue}
                </p>
              </div>
              <div>
                <p>
                  <strong>Toss Winner:</strong> {match.tossWinner}
                </p>
                <p>
                  <strong>Toss Decision:</strong> Chose to {match.tossDecision}
                </p>
                <p>
                  <strong>Batting First:</strong> {firstInnings.battingTeam}
                </p>
                <p>
                  <strong>Bowling First:</strong> {firstInnings.bowlingTeam}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleStartMatch}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Opening Batsmen */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-green-800 mb-4">
                  Opening Batsmen ({firstInnings.battingTeam})
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Striker *
                    </label>
                    <select
                      name="striker"
                      value={setupData.striker}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select striker</option>
                      {battingPlayers.map((player, index) => (
                        <option key={index} value={player.playerName}>
                          {player.playerName} ({player.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Non-Striker *
                    </label>
                    <select
                      name="nonStriker"
                      value={setupData.nonStriker}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="">Select non-striker</option>
                      {battingPlayers
                        .filter(
                          (player) => player.playerName !== setupData.striker
                        )
                        .map((player, index) => (
                          <option key={index} value={player.playerName}>
                            {player.playerName} ({player.role})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Opening Bowler */}
              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-red-800 mb-4">
                  Opening Bowler ({firstInnings.bowlingTeam})
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bowler *
                  </label>
                  <select
                    name="openingBowler"
                    value={setupData.openingBowler}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select opening bowler</option>
                    {bowlingPlayers
                      .filter((player) =>
                        ['bowler', 'all-rounder'].includes(player.role)
                      )
                      .map((player, index) => (
                        <option key={index} value={player.playerName}>
                          {player.playerName} ({player.role})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="mt-4 p-3 bg-yellow-100 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> Only bowlers and all-rounders are
                    shown for bowling selection.
                  </p>
                </div>
              </div>
            </div>

            {/* Team Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  {match.team1} Squad
                </h4>
                <div className="bg-gray-50 rounded p-4">
                  {match.team1Players.map((player, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-1"
                    >
                      <span>{player.playerName}</span>
                      <span className="text-sm text-gray-600 bg-gray-200 px-2 py-1 rounded">
                        {player.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  {match.team2} Squad
                </h4>
                <div className="bg-gray-50 rounded p-4">
                  {match.team2Players.map((player, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-1"
                    >
                      <span>{player.playerName}</span>
                      <span className="text-sm text-gray-600 bg-gray-200 px-2 py-1 rounded">
                        {player.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => navigate('/live-matches')}
                className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  starting ||
                  !setupData.striker ||
                  !setupData.nonStriker ||
                  !setupData.openingBowler
                }
                className="px-8 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {starting ? 'Starting Match...' : 'Start Match'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LiveMatchSetup;
