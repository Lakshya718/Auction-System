import React, { useEffect, useState } from 'react';
import API from '../../api/axios';

const PendingPlayerRequests = () => {
  const [pendingPlayers, setPendingPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState(null); // playerId being reviewed

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

  const reviewPlayer = async (playerId, status) => {
    setReviewing(playerId);
    setError('');
    try {
      const response = await API.post('/players/review-request', { playerId, status });
      alert(response.data.message || `Player ${status}`);
      // Refresh the list after review
      await fetchPendingPlayers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to review player request');
    } finally {
      setReviewing(null);
    }
  };

  if (loading) {
    return <p>Loading pending player requests...</p>;
  }

  if (error) {
    return <p className="text-red-600">{error}</p>;
  }

  if (pendingPlayers.length === 0) {
    return <p>No pending player registration requests.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Pending Player Registration Requests</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2">Player Name</th>
            <th className="border border-gray-300 px-4 py-2">Email</th>
            <th className="border border-gray-300 px-4 py-2">Phone</th>
            <th className="border border-gray-300 px-4 py-2">Age</th>
            <th className="border border-gray-300 px-4 py-2">Role</th>
            <th className="border border-gray-300 px-4 py-2">Country</th>
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingPlayers.map(player => (
            <tr key={player._id} className="text-center">
              <td className="border border-gray-300 px-4 py-2">{player.playerName}</td>
              <td className="border border-gray-300 px-4 py-2">{player.email}</td>
              <td className="border border-gray-300 px-4 py-2">{player.phone}</td>
              <td className="border border-gray-300 px-4 py-2">{player.age}</td>
              <td className="border border-gray-300 px-4 py-2">{player.playerRole}</td>
              <td className="border border-gray-300 px-4 py-2">{player.country}</td>
              <td className="border border-gray-300 px-4 py-2 space-x-2">
                <button
                  disabled={reviewing === player._id}
                  onClick={() => reviewPlayer(player._id, 'accepted')}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  disabled={reviewing === player._id}
                  onClick={() => reviewPlayer(player._id, 'rejected')}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PendingPlayerRequests;
