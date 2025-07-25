import React, { useState, useEffect } from 'react';
import API from '../../api/axios'; // Corrected import path
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaUsers, FaMapMarkerAlt, FaTrophy, FaCheckCircle, FaExclamationCircle, FaPlusCircle } from 'react-icons/fa';
import LoadingSpinner from "../components/LoadingSpinner";

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
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch tournaments and teams for dropdowns
    const fetchData = async () => {
      try {
        const [tournamentRes, teamsRes] = await Promise.all([
          API.get('/auctions/all-auctions'), // Assuming auctions endpoint for tournaments
          API.get('/teams/all-teams'),
        ]);
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
    setSuccess('');
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
      const res = await API.post('/matches/create', formData);
      if (res.data.success) {
        setSuccess('Match created successfully!');
        setFormData({
          tournament: '',
          team1: '',
          team2: '',
          matchDate: '',
          venue: '',
        });
        navigate(`/matches/${res.data.match._id}`);
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
      <form onSubmit={handleSubmit} className="bg-gray-800 shadow-xl rounded-2xl p-8 space-y-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="tournament" className="block text-gray-300 text-sm font-bold mb-2">
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
              <option value="">Select Tournament</option>
              {Array.isArray(tournaments) && tournaments.map(t => (
                <option key={t._id} value={t._id}>{t.tournamentName || t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="team1" className="block text-gray-300 text-sm font-bold mb-2">
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
              {teams.map(team => (
                <option key={team._id} value={team._id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="team2" className="block text-gray-300 text-sm font-bold mb-2">
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
              {teams.map(team => (
                <option key={team._id} value={team._id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="matchDate" className="block text-gray-300 text-sm font-bold mb-2">
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
            <label htmlFor="venue" className="block text-gray-300 text-sm font-bold mb-2">
              <FaMapMarkerAlt className="inline-block mr-2 text-purple-400" />
              Venue
            </label>
            <input
              type="text"
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="Venue (optional)"
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
    </div>
  );
};

export default CreateMatch;