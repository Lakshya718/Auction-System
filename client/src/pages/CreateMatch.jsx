import React, { useState, useEffect } from 'react';
import API from '../../api/axios'; // Corrected import path
import {
  FaCalendarAlt,
  FaUsers,
  FaMapMarkerAlt,
  FaTrophy,
  FaCheckCircle,
  FaExclamationCircle,
  FaPlusCircle,
  FaFutbol,
  FaVolleyballBall,
  FaBaseballBall,
  FaBasketballBall,
  FaRunning,
} from 'react-icons/fa';
import { GiCricketBat } from 'react-icons/gi';
import LoadingSpinner from '../components/LoadingSpinner';

const CreateMatch = () => {
  const [formData, setFormData] = useState({
    tournament: '',
    team1: '',
    team2: '',
    matchDate: '',
    venue: '',
    sport: '',
  });
  const [tournaments, setTournaments] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamsFiltered, setTeamsFiltered] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [sportSelected, setSportSelected] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);

  const sportOptions = [
    {
      value: 'cricket',
      label: 'Cricket',
      icon: <GiCricketBat className="inline-block mr-2 text-purple-400" />,
    },
    {
      value: 'football',
      label: 'Football',
      icon: <FaFutbol className="inline-block mr-2 text-purple-400" />,
    },
    {
      value: 'basketball',
      label: 'Basketball',
      icon: <FaBasketballBall className="inline-block mr-2 text-purple-400" />,
    },
    {
      value: 'volleyball',
      label: 'Volleyball',
      icon: <FaVolleyballBall className="inline-block mr-2 text-purple-400" />,
    },
    {
      value: 'kabaddi',
      label: 'Kabaddi',
      icon: <FaRunning className="inline-block mr-2 text-purple-400" />,
    },
  ];

  useEffect(() => {
    // If sport is selected, fetch data for that sport
    if (formData.sport && !sportSelected) {
      fetchSportSpecificData(formData.sport);
    }
  }, [formData.sport, sportSelected]);

  // Function to fetch sport-specific data
  const fetchSportSpecificData = async (sport) => {
    setFetchingData(true);

    try {
      // Call both APIs in parallel
      const [tournamentRes, teamsRes] = await Promise.all([
        API.get(`/auctions/sport/${sport}/tournaments`),
        API.get(`/teams/sport/${sport}/teams`),
      ]);

      // Update state with fetched data
      setTournaments(
        Array.isArray(tournamentRes.data.auctions)
          ? tournamentRes.data.auctions
          : []
      );

      setTeams(Array.isArray(teamsRes.data) ? teamsRes.data : []);
      setTeamsFiltered(Array.isArray(teamsRes.data) ? teamsRes.data : []);

      // Mark sport as selected and fetching complete
      setSportSelected(true);
    } catch (error) {
      console.error('Error fetching sport-specific data:', error);
      setError(`Failed to load ${sport} data. Please try again.`);
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset form if sport changes
    if (name === 'sport') {
      setSportSelected(false);
      setFormData({
        tournament: '',
        team1: '',
        team2: '',
        matchDate: '',
        venue: '',
        sport: value,
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form data
    if (formData.team1 === formData.team2) {
      setError('Teams cannot be the same');
      return;
    }

    if (
      !formData.tournament ||
      !formData.team1 ||
      !formData.team2 ||
      !formData.matchDate ||
      !formData.venue ||
      !formData.sport
    ) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Use the sport-specific endpoint to create the match
      const res = await API.post(`/matches/create/${formData.sport}`, formData);

      if (res.data.success) {
        setSuccess('Match created successfully!');
        // Reset form after successful creation
        setFormData({
          tournament: '',
          team1: '',
          team2: '',
          matchDate: '',
          venue: '',
          sport: '',
        });
        setSportSelected(false);
      } else {
        setError(res.data.error || 'Failed to create match');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className="h-[5vh]"></div>
      <h2 className="text-4xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Create New Match
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

      {/* Initial sport selection form */}
      {!formData.sport && (
        <div className="bg-gray-800 shadow-xl rounded-2xl p-8 space-y-8 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-purple-400">
              Select a Sport to Start
            </h3>
            <p className="text-gray-400 mt-2">
              Choose the sport for this match to load relevant options
            </p>
          </div>

          <div>
            <label
              htmlFor="sport"
              className="block text-gray-300 text-sm font-bold mb-4"
            >
              Sport <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sportOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    handleChange({
                      target: { name: 'sport', value: option.value },
                    })
                  }
                  className="flex items-center justify-center p-4 bg-gray-700 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <div className="text-2xl mr-3">{option.icon}</div>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading screen while fetching sport-specific data */}
      {formData.sport && fetchingData && (
        <div className="bg-gray-800 shadow-xl rounded-2xl p-8 space-y-8 max-w-2xl mx-auto">
          <div className="text-center">
            {sportOptions.find((s) => s.value === formData.sport)?.icon && (
              <div className="text-4xl mb-4">
                {sportOptions.find((s) => s.value === formData.sport)?.icon}
              </div>
            )}
            <h3 className="text-xl font-bold text-purple-400 mb-2">
              Loading{' '}
              {sportOptions.find((s) => s.value === formData.sport)?.label ||
                'Sport'}{' '}
              Data
            </h3>
            <p className="text-gray-400">
              Fetching tournaments and teams for {formData.sport}...
            </p>
          </div>
          <div className="flex justify-center mt-6">
            <LoadingSpinner size="large" />
          </div>
        </div>
      )}

      {/* Sport-specific form */}
      {formData.sport && !fetchingData && sportSelected && (
        <form
          onSubmit={handleSubmit}
          className="bg-gray-800 shadow-xl rounded-2xl p-8 space-y-8 max-w-4xl mx-auto"
        >
          <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
            <h3 className="text-xl font-bold text-purple-400 flex items-center">
              {sportOptions.find((s) => s.value === formData.sport)?.icon}
              {sportOptions.find((s) => s.value === formData.sport)?.label}{' '}
              Match
            </h3>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, sport: '' }))}
              className="text-gray-400 hover:text-white"
            >
              Change Sport
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="tournament"
                className="block text-gray-300 text-sm font-bold mb-2"
              >
                <FaTrophy className="inline-block mr-2 text-purple-400" />
                Tournament <span className="text-red-500">*</span>
              </label>
              <select
                id="tournament"
                name="tournament"
                value={formData.tournament}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors appearance-none"
              >
                <option value="">Select a Tournament</option>
                {Array.isArray(tournaments) &&
                  tournaments.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.tournamentName}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="team1"
                className="block text-gray-300 text-sm font-bold mb-2"
              >
                <FaUsers className="inline-block mr-2 text-purple-400" />
                Team 1 <span className="text-red-500">*</span>
              </label>
              <select
                id="team1"
                name="team1"
                value={formData.team1}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors appearance-none"
              >
                <option value="">Select Team 1</option>
                {teamsFiltered.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="team2"
                className="block text-gray-300 text-sm font-bold mb-2"
              >
                <FaUsers className="inline-block mr-2 text-purple-400" />
                Team 2 <span className="text-red-500">*</span>
              </label>
              <select
                id="team2"
                name="team2"
                value={formData.team2}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors appearance-none"
              >
                <option value="">Select Team 2</option>
                {teamsFiltered.map((team) => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="matchDate"
                className="block text-gray-300 text-sm font-bold mb-2"
              >
                <FaCalendarAlt className="inline-block mr-2 text-purple-400" />
                Match Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="matchDate"
                name="matchDate"
                value={formData.matchDate}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label
                htmlFor="venue"
                className="block text-gray-300 text-sm font-bold mb-2"
              >
                <FaMapMarkerAlt className="inline-block mr-2 text-purple-400" />
                Venue
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="Venue"
                required
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
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
                <FaPlusCircle className="mr-2" />
                Create Match
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default CreateMatch;
