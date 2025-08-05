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
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        const res = await API.get(`/matches/${id}`);
        setMatch(res.data.match);
        setFormData({
          ...res.data.match,
          matchStatus: res.data.match.matchStatus || '',
          matchResult: res.data.match.matchResult || '',
          tossWinner: res.data.match.tossWinner || '',
          electedTo: res.data.match.electedTo || '',
          manOfTheMatch: res.data.match.manOfTheMatch || '',
        });
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await API.patch(`/matches/update/${id}`, formData);
      if (res.data.success) {
        setSuccess('Match updated successfully!');
        setMatch(res.data.match);
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

  if (error) {
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
        Update Match Result
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
            <option value="upcoming">Upcoming</option>
            <option value="in-progress">In-Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

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
            <option value="team1">{match.team1.name} Won</option>
            <option value="team2">{match.team2.name} Won</option>
            <option value="tie">Tie</option>
            <option value="no-result">No Result</option>
          </select>
        </div>
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
            <option value={match.team1._id}>{match.team1.name}</option>
            <option value={match.team2._id}>{match.team2.name}</option>
          </select>
        </div>
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
            <option value="bat">Bat</option>
            <option value="bowl">Bowl</option>
          </select>
        </div>
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
            <option value="">Select a player</option>
            {(match.tournament?.players || []).map((auctionPlayer) => (
              auctionPlayer.player ? (
                <option key={auctionPlayer.player._id} value={auctionPlayer.player._id}>
                  {auctionPlayer.player.playerName}
                </option>
              ) : null
            ))}
          </select>
        </div>

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