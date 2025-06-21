import React, { useState, useEffect } from 'react';
import axios from '../../api/axios'; // Assuming axios instance is configured here
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Tooltip } from 'react-tooltip'; // Assuming react-tooltip is installed
import { FaTrophy, FaAlignLeft, FaCalendarAlt, FaClock, FaSortAmountUp, FaDollarSign, FaUsers, FaUser } from 'react-icons/fa';

const animatedComponents = makeAnimated();

const CreateAuction = () => {
  const [formData, setFormData] = useState({
    tournamentName: '',
    description: '',
    date: null,
    startTime: null,
    minBidIncrement: 500000,
    maxBudget: 150000000,
    teams: [],
    players: [],
    retainedPlayers: []
  });

  const [allTeams, setAllTeams] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  
  // Add select all state for teams and players
  const [selectAllTeams, setSelectAllTeams] = useState(false);
  const [selectAllPlayers, setSelectAllPlayers] = useState(false);

  const [error, setError] = useState({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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

  const validate = () => {
    const newErrors = {};
    if (!formData.tournamentName.trim()) {
      newErrors.tournamentName = 'Tournament name is required';
    }
    if (!formData.date) {
      newErrors.date = 'Auction date is required';
    }
    if (!formData.startTime) {
      newErrors.startTime = 'Auction start time is required';
    }
    if (formData.maxBudget <= 0) {
      newErrors.maxBudget = 'Max budget must be greater than zero';
    }
    if (formData.minBidIncrement <= 0) {
      newErrors.minBidIncrement = 'Minimum bid increment must be greater than zero';
    }
    if (formData.teams.length === 0) {
      newErrors.teams = 'At least one team must be selected';
    }
    if (formData.players.length === 0) {
      newErrors.players = 'At least one player must be selected';
    }
    setError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    if (!validate()) {
      return;
    }
    setLoading(true);
    try {
      // Prepare data for API
      const payload = {
        ...formData,
        date: formData.date ? formData.date.toISOString().split('T')[0] : '',
        startTime: formData.startTime ? formData.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true}) : '',
        teams: formData.teams.map(t => t.value),
        players: formData.players.map(p => p.value),
      };
      const response = await axios.post('/auctions/create', payload);
      if (response.data.success) {
        setSuccess('Auction created successfully');
        alert('Auction created successfully');
        // Reset form or redirect as needed
      } else {
        setError({form: response.data.error || 'Failed to create auction'});
      }
    } catch (err) {
      setError({form: err.response?.data?.error || 'Server error'});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center">Create Auction</h2>
      {error.form && <div className="mb-4 text-red-600">{error.form}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="tournamentName" className="font-semibold mb-1 flex items-center gap-2">
            <FaTrophy className="text-blue-600" />
            Tournament Name *
          </label>
          <input
            type="text"
            id="tournamentName"
            name="tournamentName"
            value={formData.tournamentName}
            onChange={e => setFormData({...formData, tournamentName: e.target.value})}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error.tournamentName ? 'border-red-500' : 'border-gray-300'}`}
          />
          {error.tournamentName && <p className="text-red-500 text-sm mt-1">{error.tournamentName}</p>}
        </div>

        <div>
          <label htmlFor="description" className="font-semibold mb-1 flex items-center gap-2">
            <FaAlignLeft className="text-blue-600" />
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div>
          <label htmlFor="date" className="font-semibold mb-1 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-600" />
            Auction Date *
          </label>
          <DatePicker
            selected={formData.date}
            onChange={date => setFormData({...formData, date})}
            dateFormat="yyyy-MM-dd"
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error.date ? 'border-red-500' : 'border-gray-300'}`}
            placeholderText="Select a date"
          />
          {error.date && <p className="text-red-500 text-sm mt-1">{error.date}</p>}
        </div>

        <div>
          <label htmlFor="startTime" className="font-semibold mb-1 flex items-center gap-2">
            <FaClock className="text-blue-600" />
            Auction Start Time *
          </label>
          <DatePicker
            selected={formData.startTime}
            onChange={time => setFormData({...formData, startTime: time})}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="h:mm aa"
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error.startTime ? 'border-red-500' : 'border-gray-300'}`}
            placeholderText="Select start time"
          />
          {error.startTime && <p className="text-red-500 text-sm mt-1">{error.startTime}</p>}
        </div>

        <div>
          <label htmlFor="minBidIncrement" className="font-semibold mb-1 flex items-center gap-2">
            <FaSortAmountUp className="text-blue-600" />
            Minimum Bid Increment *
            <span data-tooltip-id="minBidTooltip" className="ml-1 text-blue-500 cursor-pointer">?</span>
            <Tooltip id="minBidTooltip" place="top" effect="solid">
              Minimum amount by which bids must increase.
            </Tooltip>
          </label>
          <input
            type="number"
            id="minBidIncrement"
            name="minBidIncrement"
            value={formData.minBidIncrement}
            onChange={e => setFormData({...formData, minBidIncrement: Number(e.target.value)})}
            min={1}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error.minBidIncrement ? 'border-red-500' : 'border-gray-300'}`}
          />
          {error.minBidIncrement && <p className="text-red-500 text-sm mt-1">{error.minBidIncrement}</p>}
        </div>

        <div>
          <label htmlFor="maxBudget" className="font-semibold mb-1 flex items-center gap-2">
            <FaDollarSign className="text-blue-600" />
            Max Budget *
            <span data-tooltip-id="maxBudgetTooltip" className="ml-1 text-blue-500 cursor-pointer">?</span>
            <Tooltip id="maxBudgetTooltip" place="top" effect="solid">
              Maximum budget allowed for the auction.
            </Tooltip>
          </label>
          <input
            type="number"
            id="maxBudget"
            name="maxBudget"
            value={formData.maxBudget}
            onChange={e => setFormData({...formData, maxBudget: Number(e.target.value)})}
            min={1}
            className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${error.maxBudget ? 'border-red-500' : 'border-gray-300'}`}
          />
          {error.maxBudget && <p className="text-red-500 text-sm mt-1">{error.maxBudget}</p>}
        </div>

        <div>
          <label className="font-semibold mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <FaUsers className="text-blue-600" />
              Select Teams *
            </span>
            <button
              type="button"
              className="text-sm text-blue-600 underline"
              onClick={() => {
                if (selectAllTeams) {
                  setFormData({...formData, teams: []});
                } else {
                  setFormData({...formData, teams: allTeams.map(team => ({ value: team._id, label: team.name }))});
                }
                setSelectAllTeams(!selectAllTeams);
              }}
            >
              {selectAllTeams ? 'Deselect All' : 'Select All'}
            </button>
          </label>
          <Select
            closeMenuOnSelect={false}
            components={animatedComponents}
            isMulti
            options={allTeams.map(team => ({ value: team._id, label: team.name }))}
            value={formData.teams}
            onChange={selected => {
              setFormData({...formData, teams: selected || []});
              setSelectAllTeams(selected?.length === allTeams.length);
            }}
            className={error.teams ? 'border-red-500' : ''}
          />
          {error.teams && <p className="text-red-500 text-sm mt-1">{error.teams}</p>}
        </div>

        <div>
          <label className="font-semibold mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <FaUser className="text-blue-600" />
              Select Players *
            </span>
            <button
              type="button"
              className="text-sm text-blue-600 underline"
              onClick={() => {
                if (selectAllPlayers) {
                  setFormData({...formData, players: []});
                } else {
                  setFormData({...formData, players: allPlayers.map(player => ({ value: player._id, label: player.playerName }))});
                }
                setSelectAllPlayers(!selectAllPlayers);
              }}
            >
              {selectAllPlayers ? 'Deselect All' : 'Select All'}
            </button>
          </label>
          <Select
            closeMenuOnSelect={false}
            components={animatedComponents}
            isMulti
            options={allPlayers.map(player => ({ value: player._id, label: player.playerName }))}
            value={formData.players}
            onChange={selected => {
              setFormData({...formData, players: selected || []});
              setSelectAllPlayers(selected?.length === allPlayers.length);
            }}
            className={error.players ? 'border-red-500' : ''}
          />
          {error.players && <p className="text-red-500 text-sm mt-1">{error.players}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Creating...' : 'Create Auction'}
        </button>
      </form>
    </div>
  );
};

export default CreateAuction;
