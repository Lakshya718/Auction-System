import React, { useEffect, useState } from 'react';
import API from '../../api/axios';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
  </div>
);

const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg">
      <p className="mb-4 text-lg">{message}</p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
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
  const [modal, setModal] = useState({ isOpen: false, playerId: null, status: null });

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
      setModal({ isOpen: false, playerId: null, status: null });
    }
  };

  const openModal = (playerId, status) => {
    setModal({ isOpen: true, playerId, status });
  };

  const closeModal = () => {
    setModal({ isOpen: false, playerId: null, status: null });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchPendingPlayers}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (pendingPlayers.length === 0) {
    return <p className="max-w-4xl mx-auto p-4 text-center">No pending player registration requests.</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Pending Player Registration Requests</h2>
      <div className="overflow-x-auto">
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
            {pendingPlayers.map((player, index) => (
              <tr
                key={player._id}
                className={`text-center ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}
              >
                <td className="border border-gray-300 px-4 py-2">{player.playerName}</td>
                <td className="border border-gray-300 px-4 py-2">{player.email}</td>
                <td className="border border-gray-300 px-4 py-2">{player.phone}</td>
                <td className="border border-gray-300 px-4 py-2">{player.age}</td>
                <td className="border border-gray-300 px-4 py-2">{player.playerRole}</td>
                <td className="border border-gray-300 px-4 py-2">{player.country}</td>
                <td className="border border-gray-300 px-4 py-2 space-x-2">
                  <button
                    disabled={reviewing === player._id}
                    onClick={() => openModal(player._id, 'accepted')}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                    title="Approve Player"
                  >
                    Approve
                  </button>
                  <button
                    disabled={reviewing === player._id}
                    onClick={() => openModal(player._id, 'rejected')}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                    title="Reject Player"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
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
