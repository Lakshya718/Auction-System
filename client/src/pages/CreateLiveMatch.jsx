import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';

const CreateLiveMatch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    matchTitle: '',
    team1: '',
    team2: '',
    totalOvers: 20,
    tossWinner: '',
    tossDecision: 'bat',
    venue: '',
  });

  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addPlayer = (team, playerName, role = 'batsman') => {
    if (!playerName.trim()) return;

    const player = {
      playerName: playerName.trim(),
      role,
    };

    if (team === 'team1') {
      if (team1Players.length < 11) {
        setTeam1Players((prev) => [...prev, player]);
      }
    } else {
      if (team2Players.length < 11) {
        setTeam2Players((prev) => [...prev, player]);
      }
    }
  };

  const removePlayer = (team, index) => {
    if (team === 'team1') {
      setTeam1Players((prev) => prev.filter((_, i) => i !== index));
    } else {
      setTeam2Players((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const PlayerInput = ({ team, teamName, players }) => {
    const [playerName, setPlayerName] = useState('');
    const [playerRole, setPlayerRole] = useState('batsman');

    const handleAdd = () => {
      addPlayer(team, playerName, playerRole);
      setPlayerName('');
      setPlayerRole('batsman');
    };

    const getRoleColor = (role) => {
      const colors = {
        batsman: 'bg-blue-100 text-blue-800',
        bowler: 'bg-red-100 text-red-800',
        'all-rounder': 'bg-green-100 text-green-800',
        'wicket-keeper': 'bg-purple-100 text-purple-800',
      };
      return colors[role] || 'bg-gray-100 text-gray-800';
    };

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium mb-3 text-gray-800 flex items-center gap-2">
          <span className="text-blue-600">👥</span>
          {teamName}
          <span className="text-sm text-gray-500">({players.length}/11)</span>
        </h3>

        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Player name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          />
          <select
            value={playerRole}
            onChange={(e) => setPlayerRole(e.target.value)}
            className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="batsman">Batsman</option>
            <option value="bowler">Bowler</option>
            <option value="all-rounder">All-rounder</option>
            <option value="wicket-keeper">Wicket-keeper</option>
          </select>
          <button
            onClick={handleAdd}
            disabled={players.length >= 11 || !playerName.trim()}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {players.map((player, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-2 bg-white rounded-lg shadow-sm"
            >
              <span className="font-medium text-sm">{player.playerName}</span>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${getRoleColor(player.role)}`}
                >
                  {player.role}
                </span>
                <button
                  onClick={() => removePlayer(team, index)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (team1Players.length < 11 || team2Players.length < 11) {
      setError('Both teams must have exactly 11 players');
      return;
    }

    if (!formData.tossWinner) {
      setError('Please select toss winner');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/live-matches/create', {
        ...formData,
        team1Players,
        team2Players,
      });

      if (response.data.success) {
        setSuccess('Live match created successfully!');
        setTimeout(() => {
          navigate(`/live-match/${response.data.match._id}/setup`);
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  const canProceedToStep2 = () => {
    return (
      formData.matchTitle &&
      formData.team1 &&
      formData.team2 &&
      formData.totalOvers &&
      formData.venue
    );
  };

  const canSubmit = () => {
    return (
      canProceedToStep2() &&
      team1Players.length === 11 &&
      team2Players.length === 11 &&
      formData.tossWinner
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center flex items-center justify-center gap-2">
            <span className="text-blue-600">🏏</span>
            Create Live Cricket Match
          </h1>

          {/* Compact Progress Steps */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  currentStep >= 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                1
              </div>
              <div
                className={`w-8 h-0.5 mx-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'}`}
              ></div>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  currentStep >= 2
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                2
              </div>
              <div
                className={`w-8 h-0.5 mx-1 ${currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'}`}
              ></div>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  currentStep >= 3
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                3
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-l-4 border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Match Details */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-blue-600">📋</span>
                  Match Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Match Title *
                    </label>
                    <input
                      type="text"
                      name="matchTitle"
                      value={formData.matchTitle}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Mumbai vs Chennai - IPL 2024"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team 1 *
                    </label>
                    <input
                      type="text"
                      name="team1"
                      value={formData.team1}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Team 1 name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Team 2 *
                    </label>
                    <input
                      type="text"
                      name="team2"
                      value={formData.team2}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Team 2 name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue
                    </label>
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Stadium name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Overs *
                    </label>
                    <select
                      name="totalOvers"
                      value={formData.totalOvers}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={5}>5 Overs</option>
                      <option value={10}>10 Overs</option>
                      <option value={20}>20 Overs (T20)</option>
                      <option value={50}>50 Overs (ODI)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    disabled={!canProceedToStep2()}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Next: Add Players →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Add Players */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-blue-600">👥</span>
                  Add Players
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <PlayerInput
                    team="team1"
                    teamName={formData.team1}
                    players={team1Players}
                    setPlayers={setTeam1Players}
                  />
                  <PlayerInput
                    team="team2"
                    teamName={formData.team2}
                    players={team2Players}
                    setPlayers={setTeam2Players}
                  />
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    disabled={
                      team1Players.length !== 11 || team2Players.length !== 11
                    }
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Next: Toss →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Toss */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-blue-600">🪙</span>
                  Toss Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Toss Winner *
                    </label>
                    <select
                      name="tossWinner"
                      value={formData.tossWinner}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select toss winner</option>
                      <option value={formData.team1}>{formData.team1}</option>
                      <option value={formData.team2}>{formData.team2}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Toss Decision *
                    </label>
                    <select
                      name="tossDecision"
                      value={formData.tossDecision}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="bat">Chose to Bat</option>
                      <option value="bowl">Chose to Bowl</option>
                    </select>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                    <span>📋</span>
                    Match Summary
                  </h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>
                      <strong>{formData.matchTitle}</strong> -{' '}
                      {formData.totalOvers} overs
                    </p>
                    <p>
                      {formData.team1} vs {formData.team2} at {formData.venue}
                    </p>
                    {formData.tossWinner && (
                      <p>
                        <strong>{formData.tossWinner}</strong> won the toss and
                        chose to <strong>{formData.tossDecision}</strong>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmit() || loading}
                    className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating Match...' : 'Create Match 🚀'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLiveMatch;
