import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaUserClock,
  FaSync,
  FaFilter,
} from 'react-icons/fa';

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
    <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md m-4 text-white">
      <p className="mb-6 text-lg text-center">{message}</p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors font-semibold"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-semibold"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

const PendingPlayerRequests = () => {
  const [pendingPlayers, setPendingPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState(null); // playerId being reviewed
  const [modal, setModal] = useState({
    isOpen: false,
    playerId: null,
    status: null,
  });
  const [filterSport, setFilterSport] = useState('all');
  const [sortedPlayers, setSortedPlayers] = useState([]);

  const sportsOptions = [
    { value: 'all', label: 'All Sports' },
    { value: 'cricket', label: 'Cricket' },
    { value: 'football', label: 'Football' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'volleyball', label: 'Volleyball' },
    { value: 'kabaddi', label: 'Kabaddi' },
  ];

  const fetchPendingPlayers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/players/pending-requests');
      if (response.data && response.data.requestingPlayers) {
        setPendingPlayers(response.data.requestingPlayers);
      } else {
        setPendingPlayers([]);
        setError('Invalid data format received from server');
      }
    } catch {
      setError('Failed to fetch pending player requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPlayers();
  }, []);

  useEffect(() => {
    // Sort and filter players by sport
    let filtered = [...pendingPlayers];

    // Filter by selected sport
    if (filterSport !== 'all') {
      filtered = filtered.filter((player) => player.sport === filterSport);
    }

    // Group by sport and sort within each group
    const groupedBySport = filtered.reduce((acc, player) => {
      const sport = player.sport || 'unknown';
      if (!acc[sport]) {
        acc[sport] = [];
      }
      acc[sport].push(player);
      return acc;
    }, {});

    // Convert groups back to array with sports in a specific order
    const sportsOrder = [
      'cricket',
      'football',
      'basketball',
      'volleyball',
      'kabaddi',
      'unknown',
    ];
    const sortedArray = [];

    sportsOrder.forEach((sport) => {
      if (groupedBySport[sport]) {
        sortedArray.push(...groupedBySport[sport]);
      }
    });

    setSortedPlayers(sortedArray);
  }, [pendingPlayers, filterSport]);

  const reviewPlayer = async (playerId, status) => {
    setReviewing(playerId);
    setError('');
    try {
      const response = await API.post('/players/review-request', {
        playerId,
        status,
      });
      alert(response.data.message || `Player ${status}`);
      // Refresh the list after review
      await fetchPendingPlayers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to review player request');
    } finally {
      setReviewing(null);
      setModal({ isOpen: false, playerId: null, status: null });
    }
  };

  const openModal = (playerId, status) => {
    setModal({ isOpen: true, playerId, status });
  };

  const closeModal = () => {
    setModal({ isOpen: false, playerId: null, status: null });
  };

  const handleFilterChange = (e) => {
    setFilterSport(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen text-white flex flex-col items-center justify-center">
        <div className="h-[5vh]"></div>
        <p className="text-red-500 text-lg font-semibold mb-4 flex items-center gap-2">
          <FaExclamationCircle /> {error}
        </p>
        <button
          onClick={fetchPendingPlayers}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FaSync /> Retry
        </button>
      </div>
    );
  }

  if (pendingPlayers.length === 0) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <p className="text-center text-gray-400 text-xl">
          No pending player registration requests.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        <FaUserClock className="inline-block mr-3" />
        Pending Player Requests
      </h2>

      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <label className="text-gray-300 mr-3 flex items-center">
            <FaFilter className="inline-block mr-2 text-purple-400" />
            Filter by Sport:
          </label>
          <select
            value={filterSport}
            onChange={handleFilterChange}
            className="bg-gray-700 text-white border border-gray-600 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors appearance-none"
          >
            {sportsOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={fetchPendingPlayers}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
        >
          <FaSync /> Refresh
        </button>
      </div>

      <div className="overflow-x-auto bg-gray-800 rounded-2xl shadow-xl p-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-700 text-gray-300 uppercase text-sm leading-normal">
              <th className="py-3 px-6 text-left">Player Name</th>
              <th className="py-3 px-6 text-left">Sport</th>
              <th className="py-3 px-6 text-left">Email</th>
              <th className="py-3 px-6 text-left">Phone</th>
              <th className="py-3 px-6 text-left">Age</th>
              <th className="py-3 px-6 text-left">Role</th>
              <th className="py-3 px-6 text-left">Country</th>
              <th className="py-3 px-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-200 text-sm font-light">
            {sortedPlayers.length > 0 ? (
              sortedPlayers.map((player, index) => (
                <tr
                  key={player._id}
                  className={`border-b border-gray-700 ${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'} hover:bg-gray-600 transition-colors duration-200`}
                >
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    {player.playerName}
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        player.sport === 'cricket'
                          ? 'bg-blue-900'
                          : player.sport === 'football'
                            ? 'bg-green-900'
                            : player.sport === 'basketball'
                              ? 'bg-orange-900'
                              : player.sport === 'volleyball'
                                ? 'bg-pink-900'
                                : player.sport === 'kabaddi'
                                  ? 'bg-purple-900'
                                  : 'bg-gray-900'
                      }`}
                    >
                      {player.sport
                        ? player.sport.charAt(0).toUpperCase() +
                          player.sport.slice(1)
                        : 'Unknown'}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-left">{player.email}</td>
                  <td className="py-3 px-6 text-left">{player.phone}</td>
                  <td className="py-3 px-6 text-left">{player.age}</td>
                  <td className="py-3 px-6 text-left">{player.playerRole}</td>
                  <td className="py-3 px-6 text-left">{player.country}</td>
                  <td className="py-3 px-6 text-center space-x-2">
                    <button
                      disabled={reviewing === player._id}
                      onClick={() => openModal(player._id, 'accepted')}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex-inline items-center gap-1"
                      title="Approve Player"
                    >
                      <FaCheckCircle className="inline-block mr-1" />
                      Approve
                    </button>
                    <button
                      disabled={reviewing === player._id}
                      onClick={() => openModal(player._id, 'rejected')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex-inline items-center gap-1"
                      title="Reject Player"
                    >
                      <FaTimesCircle className="inline-block mr-1" />
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="py-6 text-center text-gray-400">
                  {filterSport !== 'all'
                    ? `No pending player requests for ${filterSport}`
                    : 'No pending player requests found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {modal.isOpen && (
        <ConfirmationModal
          message={`Are you sure you want to ${modal.status} this player?`}
          onConfirm={() => reviewPlayer(modal.playerId, modal.status)}
          onCancel={closeModal}
        />
      )}
    </div>
  );
};

export default PendingPlayerRequests;
