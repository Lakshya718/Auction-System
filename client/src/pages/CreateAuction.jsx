import React, { useState, useEffect } from 'react';
import axios from '../../api/axios'; // Assuming axios instance is configured here
import Select from 'react-select';
import makeAnimated from 'react-select/animated';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Tooltip } from 'react-tooltip'; // Assuming react-tooltip is installed
import { FaTrophy, FaAlignLeft, FaCalendarAlt, FaClock, FaSortAmountUp, FaDollarSign, FaUsers, FaUser, FaCheckCircle, FaExclamationCircle, FaGavel } from 'react-icons/fa';
import LoadingSpinner from "../components/LoadingSpinner";

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
        // Reset form or redirect as needed
        setFormData({
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
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Create New Auction
      </h2>
      {error.form && (
        <p className="bg-red-800 text-white p-3 rounded-lg flex items-center justify-center mb-6">
          <FaExclamationCircle className="mr-2" />
          {error.form}
        </p>
      )}
      {success && (
        <p className="bg-green-800 text-white p-3 rounded-lg flex items-center justify-center mb-6">
          <FaCheckCircle className="mr-2" />
          {success}
        </p>
      )}
      <form onSubmit={handleSubmit} className="bg-gray-800 shadow-xl rounded-2xl p-8 space-y-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="tournamentName" className="block text-gray-300 text-sm font-bold mb-2">
              <FaTrophy className="inline-block mr-2 text-purple-400" />
              Tournament Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="tournamentName"
              name="tournamentName"
              value={formData.tournamentName}
              onChange={e => setFormData({...formData, tournamentName: e.target.value})}
              className={`w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${error.tournamentName ? 'border-red-500' : ''}`}
            />
            {error.tournamentName && <p className="text-red-500 text-sm mt-1">{error.tournamentName}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-gray-300 text-sm font-bold mb-2">
              <FaAlignLeft className="inline-block mr-2 text-purple-400" />
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              rows={3}
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-gray-300 text-sm font-bold mb-2">
              <FaCalendarAlt className="inline-block mr-2 text-purple-400" />
              Auction Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={formData.date}
              onChange={date => setFormData({...formData, date})}
              dateFormat="yyyy-MM-dd"
              className={`w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${error.date ? 'border-red-500' : ''}`}
              placeholderText="Select a date"
            />
            {error.date && <p className="text-red-500 text-sm mt-1">{error.date}</p>}
          </div>

          <div>
            <label htmlFor="startTime" className="block text-gray-300 text-sm font-bold mb-2">
              <FaClock className="inline-block mr-2 text-purple-400" />
              Auction Start Time <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={formData.startTime}
              onChange={time => setFormData({...formData, startTime: time})}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="h:mm aa"
              className={`w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${error.startTime ? 'border-red-500' : ''}`}
              placeholderText="Select start time"
            />
            {error.startTime && <p className="text-red-500 text-sm mt-1">{error.startTime}</p>}
          </div>

          <div>
            <label htmlFor="minBidIncrement" className="block text-gray-300 text-sm font-bold mb-2">
              <FaSortAmountUp className="inline-block mr-2 text-purple-400" />
              Minimum Bid Increment <span className="text-red-500">*</span>
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
              className={`w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${error.minBidIncrement ? 'border-red-500' : ''}`}
            />
            {error.minBidIncrement && <p className="text-red-500 text-sm mt-1">{error.minBidIncrement}</p>}
          </div>

          <div>
            <label htmlFor="maxBudget" className="block text-gray-300 text-sm font-bold mb-2">
              <FaDollarSign className="inline-block mr-2 text-purple-400" />
              Max Budget <span className="text-red-500">*</span>
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
              className={`w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${error.maxBudget ? 'border-red-500' : ''}`}
            />
            {error.maxBudget && <p className="text-red-500 text-sm mt-1">{error.maxBudget}</p>}
          </div>
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FaUsers className="inline-block mr-2 text-purple-400" />
              Select Teams <span className="text-red-500">*</span>
            </span>
            <button
              type="button"
              className="text-sm text-purple-400 underline hover:text-purple-300"
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
            classNamePrefix="react-select"
            className={`react-select-container ${error.teams ? 'border-red-500' : ''}`}
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                backgroundColor: '#374151',
                borderColor: state.isFocused ? '#A78BFA' : '#4B5563',
                color: 'white',
                boxShadow: state.isFocused ? '0 0 0 1px #A78BFA' : 'none',
                '&:hover': {
                  borderColor: '#A78BFA',
                },
              }),
              multiValue: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: '#8B5CF6',
                color: 'white',
              }),
              multiValueLabel: (baseStyles) => ({
                ...baseStyles,
                color: 'white',
              }),
              multiValueRemove: (baseStyles) => ({
                ...baseStyles,
                color: 'white',
                '&:hover': {
                  backgroundColor: '#EC4899',
                  color: 'white',
                },
              }),
              option: (baseStyles, state) => ({
                ...baseStyles,
                backgroundColor: state.isFocused ? '#4B5563' : '#374151',
                color: 'white',
                '&:active': {
                  backgroundColor: '#A78BFA',
                },
              }),
              menu: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: '#374151',
              }),
              singleValue: (baseStyles) => ({
                ...baseStyles,
                color: 'white',
              }),
              input: (baseStyles) => ({
                ...baseStyles,
                color: 'white',
              }),
            }}
          />
          {error.teams && <p className="text-red-500 text-sm mt-1">{error.teams}</p>}
        </div>

        <div>
          <label className="block text-gray-300 text-sm font-bold mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FaUser className="inline-block mr-2 text-purple-400" />
              Select Players <span className="text-red-500">*</span>
            </span>
            <button
              type="button"
              className="text-sm text-purple-400 underline hover:text-purple-300"
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
            classNamePrefix="react-select"
            className={`react-select-container ${error.players ? 'border-red-500' : ''}`}
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                backgroundColor: '#374151',
                borderColor: state.isFocused ? '#A78BFA' : '#4B5563',
                color: 'white',
                boxShadow: state.isFocused ? '0 0 0 1px #A78BFA' : 'none',
                '&:hover': {
                  borderColor: '#A78BFA',
                },
              }),
              multiValue: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: '#8B5CF6',
                color: 'white',
              }),
              multiValueLabel: (baseStyles) => ({
                ...baseStyles,
                color: 'white',
              }),
              multiValueRemove: (baseStyles) => ({
                ...baseStyles,
                color: 'white',
                '&:hover': {
                  backgroundColor: '#EC4899',
                  color: 'white',
                },
              }),
              option: (baseStyles, state) => ({
                ...baseStyles,
                backgroundColor: state.isFocused ? '#4B5563' : '#374151',
                color: 'white',
                '&:active': {
                  backgroundColor: '#A78BFA',
                },
              }),
              menu: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: '#374151',
              }),
              singleValue: (baseStyles) => ({
                ...baseStyles,
                color: 'white',
              }),
              input: (baseStyles) => ({
                ...baseStyles,
                color: 'white',
              }),
            }}
          />
          {error.players && <p className="text-red-500 text-sm mt-1">{error.players}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
        >
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <FaGavel className="mr-2" />
              Create Auction
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CreateAuction;