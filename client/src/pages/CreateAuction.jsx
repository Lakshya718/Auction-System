import React, { useState, useEffect } from 'react';
import axios from '../../api/axios'; // Assuming axios instance is configured here

const CreateAuction = () => {
  const [formData, setFormData] = useState({
    tournamentName: '',
    description: '',
    date: '',
    startTime: '',
    minBidIncrement: 500000,
    maxBudget: 150000000,
    teams: [],
    players: [],
    retainedPlayers: []
  });

  // Ensure teams is always an array
  useEffect(() => {
    if (!Array.isArray(formData.teams)) {
      setFormData(prev => ({ ...prev, teams: [] }));
    }
  }, [formData.teams]);

  const [allTeams, setAllTeams] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch teams and players for selection
    const fetchTeamsAndPlayers = async () => {
      try {
        const teamsResponse = await axios.get('/teams/all-teams');
        const playersResponse = await axios.get('/players/verified');
        setAllTeams(teamsResponse.data || []);
        setAllPlayers(playersResponse.data.players || []);
      } catch (err) {
        console.error('Error fetching teams or players:', err);
      }
    };
    fetchTeamsAndPlayers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };


  const validateTimeFormat = (time) => {
    const regex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
    return regex.test(time);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.tournamentName.trim()) {
      setError('Tournament name is required');
      return;
    }
    if (!formData.date) {
      setError('Auction date is required');
      return;
    }
    if (!validateTimeFormat(formData.startTime)) {
      setError('Auction start time must be in HH:MM AM/PM format');
      return;
    }
    if (formData.maxBudget <= 0) {
      setError('Max budget must be greater than zero');
      return;
    }
    if (formData.minBidIncrement <= 0) {
      setError('Minimum bid increment must be greater than zero');
      return;
    }
    if (formData.teams.length === 0) {
      setError('At least one team must be selected');
      return;
    }
    if (formData.players.length === 0) {
      setError('At least one player must be selected');
      return;
    }

    try {
      const response = await axios.post('/auctions/create', formData);
      if (response.data.success) {
        setSuccess('Auction created successfully');
        alert('Auction created successfully');
      } else {
        setError(response.data.error || 'Failed to create auction');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Server error');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create Auction</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="tournamentName" className="block font-medium">Tournament Name *</label>
          <input
            type="text"
            id="tournamentName"
            name="tournamentName"
            value={formData.tournamentName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="description" className="block font-medium">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={3}
          />
        </div>
        <div>
          <label htmlFor="date" className="block font-medium">Auction Date *</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="startTime" className="block font-medium">Auction Start Time (HH:MM AM/PM) *</label>
          <input
            type="text"
            id="startTime"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            placeholder="e.g. 10:30 AM"
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="minBidIncrement" className="block font-medium">Minimum Bid Increment *</label>
          <input
            type="number"
            id="minBidIncrement"
            name="minBidIncrement"
            value={formData.minBidIncrement}
            onChange={handleChange}
            min={1}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="maxBudget" className="block font-medium">Max Budget *</label>
          <input
            type="number"
            id="maxBudget"
            name="maxBudget"
            value={formData.maxBudget}
            onChange={handleChange}
            min={1}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Select Teams *</label>
          <div className="border border-gray-300 rounded p-2 max-h-48 overflow-y-auto">
            {allTeams.map(team => (
              <label key={team._id} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  value={team._id}
                  checked={formData.teams.includes(team._id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData(prev => {
                      const teams = new Set(prev.teams);
                      if (checked) {
                        teams.add(team._id);
                      } else {
                        teams.delete(team._id);
                      }
                      return { ...prev, teams: Array.from(teams) };
                    });
                  }}
                  className="mr-2"
                />
                {team.name}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Select Players *</label>
          <div className="border border-gray-300 rounded p-2 max-h-48 overflow-y-auto">
            {allPlayers.map(player => (
              <label key={player._id} className="flex items-center mb-1">
                <input
                  type="checkbox"
                  value={player._id}
                  checked={formData.players.includes(player._id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setFormData(prev => {
                      const players = new Set(prev.players);
                      if (checked) {
                        players.add(player._id);
                      } else {
                        players.delete(player._id);
                      }
                      return { ...prev, players: Array.from(players) };
                    });
                  }}
                  className="mr-2"
                />
                {player.playerName}
              </label>
            ))}
          </div>
        </div>
        {/* Retained players input can be added here if needed */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Auction
        </button>
      </form>
    </div>
  );
};

export default CreateAuction;
