import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";

const AuctionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  const validStatuses = ["pending", "active", "completed", "cancelled"];

  useEffect(() => {
    const fetchAuctionDetails = async () => {
      try {
        const response = await API.get(`/auctions/${id}`);
        setAuction(response.data.auction);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch auction details");
      } finally {
        setLoading(false);
      }
    };
    fetchAuctionDetails();
  }, [id]);

  

  const handleEditClick = () => {
    setEditData({
      tournamentName: auction.tournamentName,
      description: auction.description,
      date: auction.date ? new Date(auction.date).toISOString().slice(0, 10) : "",
      startTime: auction.startTime,
      minBidIncrement: auction.minBidIncrement,
      maxBudget: auction.maxBudget,
      status: auction.status,
    });
    setIsEditing(true);
    setStatusError("");
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditData(null);
    setStatusError("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    setStatusError("");
    setStatusUpdating(true);
    try {
      // Update all editable fields using new backend route
      const response = await API.patch(`/auctions/${id}`, {
        tournamentName: editData.tournamentName,
        description: editData.description,
        date: editData.date,
        startTime: editData.startTime,
        minBidIncrement: editData.minBidIncrement,
        maxBudget: editData.maxBudget,
        status: editData.status,
      });
      setAuction(response.data.auction);
      setIsEditing(false);
      setEditData(null);
    } catch (err) {
      setStatusError(err.response?.data?.error || "Failed to update auction");
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) return <p>Loading auction details...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!auction) return <p>No auction found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 px-6 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition duration-300 flex items-center space-x-2 shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <span>Back to Auctions</span>
      </button>

      {!isEditing ? (
        <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white">
            <h2 className="text-5xl font-extrabold mb-2 leading-tight">{auction.tournamentName}</h2>
            <p className="text-blue-200 text-lg">{auction.description}</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-5 rounded-lg shadow-sm border border-blue-100">
                <p className="text-sm font-medium text-blue-700">Date</p>
                <p className="text-xl font-semibold text-gray-800">{new Date(auction.date).toLocaleDateString()}</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg shadow-sm border border-blue-100">
                <p className="text-sm font-medium text-blue-700">Start Time</p>
                <p className="text-xl font-semibold text-gray-800">{auction.startTime}</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg shadow-sm border border-blue-100">
                <p className="text-sm font-medium text-blue-700">Min Bid Increment</p>
                <p className="text-xl font-semibold text-gray-800">${auction.minBidIncrement}</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg shadow-sm border border-blue-100">
                <p className="text-sm font-medium text-blue-700">Max Budget</p>
                <p className="text-xl font-semibold text-gray-800">${auction.maxBudget}</p>
              </div>
              <div className="bg-blue-50 p-5 rounded-lg shadow-sm border border-blue-100">
                <p className="text-sm font-medium text-blue-700">Status</p>
                <p className="text-xl font-semibold text-gray-800">{auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}</p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Participating Teams</h3>
              {auction.teams && auction.teams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {auction.teams.map((team) => (
                    <div key={team._id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex items-center space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h-2A4 4 0 0011 16V8a4 4 0 004-4h2a4 4 0 014 4v8a4 4 0 01-4 4z" />
                      </svg>
                      <span className="text-lg font-medium text-gray-700">{team.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No teams registered for this auction yet.</p>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Players in Auction</h3>
              {auction.players && auction.players.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {auction.players.map((player) => (
                    <div key={player.player._id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex items-center space-x-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-lg font-medium text-gray-700">{player.player.playerName}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No players listed for this auction yet.</p>
              )}
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={handleEditClick}
                className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.828-2.829z" />
                </svg>
                <span>Edit Auction Details</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">
          <h2 className="text-4xl font-extrabold mb-8 text-center text-blue-800">Edit Auction</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="tournamentName">Tournament Name:</label>
              <input
                type="text"
                id="tournamentName"
                name="tournamentName"
                value={editData.tournamentName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition duration-200"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="date">Date:</label>
              <input
                type="date"
                id="date"
                name="date"
                value={editData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition duration-200"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="startTime">Start Time:</label>
              <input
                type="text"
                id="startTime"
                name="startTime"
                value={editData.startTime}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition duration-200"
                placeholder="e.g. 10:00 AM"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="minBidIncrement">Minimum Bid Increment:</label>
              <input
                type="number"
                id="minBidIncrement"
                name="minBidIncrement"
                value={editData.minBidIncrement}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition duration-200"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="maxBudget">Max Budget:</label>
              <input
                type="number"
                id="maxBudget"
                name="maxBudget"
                value={editData.maxBudget}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition duration-200"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="status">Status:</label>
              <select
                id="status"
                name="status"
                value={editData.status}
                onChange={handleInputChange}
                disabled={statusUpdating}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition duration-200"
              >
                {validStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={editData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition duration-200"
              rows={4}
            />
          </div>

          {statusUpdating && <p className="text-blue-600 text-center mb-4">Updating...</p>}
          {statusError && <p className="text-red-600 text-center mb-4">{statusError}</p>}

          <div className="flex justify-center gap-6 mt-8">
            <button
              onClick={handleSaveClick}
              disabled={statusUpdating}
              className="bg-green-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Save Changes</span>
            </button>
            <button
              onClick={handleCancelClick}
              disabled={statusUpdating}
              className="bg-gray-400 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-500 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionDetails;
