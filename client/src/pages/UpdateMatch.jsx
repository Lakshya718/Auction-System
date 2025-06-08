import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const UpdateMatch = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    matchStatus: '',
    matchResult: '',
    tossWinner: '',
    electedTo: '',
    manOfTheMatch: '',
    scorecard: [],
    teamStats: {},
  });

  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchRes, teamsRes, playersRes] = await Promise.all([
          axios.get(`/api/matches/${id}`),
          axios.get('/api/teams'),
          axios.get('/api/players'),
        ]);
        if (matchRes.data.success) {
          const match = matchRes.data.match;
          setFormData({
            matchStatus: match.matchStatus || '',
            matchResult: match.matchResult || '',
            tossWinner: match.tossWinner?._id || '',
            electedTo: match.electedTo || '',
            manOfTheMatch: match.manOfTheMatch?._id || '',
            scorecard: match.scorecard || [],
            teamStats: match.teamStats || {},
          });
        } else {
          setError(matchRes.data.error || 'Failed to load match');
        }
        setTeams(teamsRes.data.teams || teamsRes.data);
        setPlayers(playersRes.data.players || playersRes.data);
      } catch {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleScorecardChange = (index, field, value) => {
    const newScorecard = [...formData.scorecard];
    newScorecard[index] = { ...newScorecard[index], [field]: value };
    setFormData(prev => ({ ...prev, scorecard: newScorecard }));
  };

  const addScorecardEntry = () => {
    setFormData(prev => ({
      ...prev,
      scorecard: [...prev.scorecard, { player: '', runs: 0, wicketsTaken: 0 }],
    }));
  };

  const removeScorecardEntry = (index) => {
    const newScorecard = formData.scorecard.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, scorecard: newScorecard }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        matchStatus: formData.matchStatus,
        matchResult: formData.matchResult,
        tossWinner: formData.tossWinner,
        electedTo: formData.electedTo,
        manOfTheMatch: formData.manOfTheMatch,
        scorecard: formData.scorecard.map(entry => ({
          player: entry.player,
          runs: Number(entry.runs),
          wicketsTaken: Number(entry.wicketsTaken),
        })),
        teamStats: formData.teamStats,
      };
      const res = await axios.patch(`/api/matches/${id}`, payload);
      if (res.data.success) {
        navigate(`/matches/${id}`);
      } else {
        setError(res.data.error || 'Failed to update match');
      }
    } catch {
      setError('Failed to update match');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading match data...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Update Match</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="matchStatus" className="block font-medium">Match Status</label>
          <input
            type="text"
            id="matchStatus"
            name="matchStatus"
            value={formData.matchStatus}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </div>
        <div>
          <label htmlFor="matchResult" className="block font-medium">Match Result</label>
          <input
            type="text"
            id="matchResult"
            name="matchResult"
            value={formData.matchResult}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </div>
        <div>
          <label htmlFor="tossWinner" className="block font-medium">Toss Winner</label>
          <select
            id="tossWinner"
            name="tossWinner"
            value={formData.tossWinner}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-2 py-1"
          >
            <option value="">Select Team</option>
            {teams.map(team => (
              <option key={team._id} value={team._id}>{team.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="electedTo" className="block font-medium">Elected To</label>
          <input
            type="text"
            id="electedTo"
            name="electedTo"
            value={formData.electedTo}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </div>
        <div>
          <label htmlFor="manOfTheMatch" className="block font-medium">Man of the Match</label>
          <select
            id="manOfTheMatch"
            name="manOfTheMatch"
            value={formData.manOfTheMatch}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-2 py-1"
          >
            <option value="">Select Player</option>
            {players.map(player => (
              <option key={player._id} value={player._id}>{player.playerName}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-2">Scorecard</label>
          {formData.scorecard.map((entry, index) => (
            <div key={index} className="flex space-x-2 mb-2 items-center">
              <select
                value={entry.player}
                onChange={(e) => handleScorecardChange(index, 'player', e.target.value)}
                className="border border-gray-300 rounded px-2 py-1 flex-1"
              >
                <option value="">Select Player</option>
                {players.map(player => (
                  <option key={player._id} value={player._id}>{player.playerName}</option>
                ))}
              </select>
              <input
                type="number"
                value={entry.runs}
                onChange={(e) => handleScorecardChange(index, 'runs', e.target.value)}
                placeholder="Runs"
                className="border border-gray-300 rounded px-2 py-1 w-20"
              />
              <input
                type="number"
                value={entry.wicketsTaken}
                onChange={(e) => handleScorecardChange(index, 'wicketsTaken', e.target.value)}
                placeholder="Wickets"
                className="border border-gray-300 rounded px-2 py-1 w-20"
              />
              <button
                type="button"
                onClick={() => removeScorecardEntry(index)}
                className="text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addScorecardEntry}
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            Add Entry
          </button>
        </div>
        <div>
          <label htmlFor="teamStats" className="block font-medium">Team Stats (JSON)</label>
          <textarea
            id="teamStats"
            name="teamStats"
            value={JSON.stringify(formData.teamStats, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setFormData(prev => ({ ...prev, teamStats: parsed }));
                setError('');
              } catch {
                setError('Invalid JSON in Team Stats');
              }
            }}
            rows={6}
            className="w-full border border-gray-300 rounded px-2 py-1 font-mono"
          />
        </div>
        {error && <p className="text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Update Match'}
        </button>
      </form>
    </div>
  );
};

export default UpdateMatch;
