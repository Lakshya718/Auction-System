import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateMatch = () => {
  const [formData, setFormData] = useState({
    tournament: '',
    team1: '',
    team2: '',
    matchDate: '',
    venue: '',
  });
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch tournaments and teams for dropdowns
    const fetchData = async () => {
      try {
        const [tournamentRes, teamsRes] = await Promise.all([
          axios.get('/api/auctions/all-auctions'), // Assuming auctions endpoint for tournaments
          axios.get('/api/teams/all-teams'),
        ]);
        // console.log('Tournaments data:', tournamentRes.data);
        // console.log('Teams data:', teamsRes.data);
        setTournaments(Array.isArray(tournamentRes.data.auctions) ? tournamentRes.data.auctions : []);
        setTeams(Array.isArray(teamsRes.data) ? teamsRes.data : []);
      } catch {
        setError('Failed to load tournaments or teams');
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.team1 === formData.team2) {
      setError('Teams cannot be the same');
      return;
    }
    if (!formData.tournament || !formData.team1 || !formData.team2 || !formData.matchDate) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/matches/create', formData);
      if (res.data.success) {
        navigate(`/matches/${res.data.match._id}`);
      } else {
        setError(res.data.error || 'Failed to create match');
      }
    } catch {
      setError('Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create Match</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tournament" className="block font-medium">Tournament *</label>
          <select
            id="tournament"
            name="tournament"
            value={formData.tournament}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-2 py-1"
          >
            <option value="">Select Tournament</option>
            {Array.isArray(tournaments) && tournaments.map(t => (
              <option key={t._id} value={t._id}>{t.tournamentName || t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="team1" className="block font-medium">Team 1 *</label>
          <select
            id="team1"
            name="team1"
            value={formData.team1}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-2 py-1"
          >
            <option value="">Select Team 1</option>
            {teams.map(team => (
              <option key={team._id} value={team._id}>{team.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="team2" className="block font-medium">Team 2 *</label>
          <select
            id="team2"
            name="team2"
            value={formData.team2}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-2 py-1"
          >
            <option value="">Select Team 2</option>
            {teams.map(team => (
              <option key={team._id} value={team._id}>{team.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="matchDate" className="block font-medium">Match Date *</label>
          <input
            type="datetime-local"
            id="matchDate"
            name="matchDate"
            value={formData.matchDate}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </div>
        <div>
          <label htmlFor="venue" className="block font-medium">Venue</label>
          <input
            type="text"
            id="venue"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            placeholder="Venue (optional)"
            className="w-full border border-gray-300 rounded px-2 py-1"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Match'}
        </button>
      </form>
    </div>
  );
};

export default CreateMatch;
