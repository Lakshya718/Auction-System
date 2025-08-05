import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";

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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!auction) return <p>No auction found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className='h-[8vh]'></div>

      {!isEditing ? (
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 p-6 text-white relative">
            <h2 className="text-3xl font-bold mb-1">{auction.tournamentName}</h2>
            <p className="text-blue-100 text-sm">{auction.description}</p>
            <button
              onClick={handleEditClick}
              className="absolute top-4 right-4 bg-white text-blue-600 px-4 py-2 rounded-md text-xs font-semibold hover:bg-blue-100 transition duration-300 flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.828-2.829z" />
              </svg>
              <span>Edit</span>
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-xs font-medium text-gray-500">Date</p>
                <p className="text-base font-semibold text-gray-800">{new Date(auction.date).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-xs font-medium text-gray-500">Start Time</p>
                <p className="text-base font-semibold text-gray-800">{auction.startTime}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-xs font-medium text-gray-500">Min Bid Increment</p>
                <p className="text-base font-semibold text-gray-800">${auction.minBidIncrement}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-xs font-medium text-gray-500">Max Budget</p>
                <p className="text-base font-semibold text-gray-800">${auction.maxBudget}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-xs font-medium text-gray-500">Status</p>
                <p className="text-base font-semibold text-gray-800">{auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-3">Participating Teams</h3>
              {auction.teams && auction.teams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {auction.teams.map((team) => (
                    <div key={team._id} className="bg-gray-50 p-3 rounded-md flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h-2A4 4 0 0011 16V8a4 4 0 004-4h2a4 4 0 014 4v8a4 4 0 01-4 4z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{team.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No teams registered for this auction yet.</p>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">Players in Auction</h3>
              {auction.players && auction.players.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {auction.players.map((player) => (
                    <div key={player.player._id} className="bg-gray-50 p-3 rounded-md flex items-center space-x-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{player.player.playerName}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No players listed for this auction yet.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">Edit Auction</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="tournamentName">Tournament Name:</label>
              <input
                type="text"
                id="tournamentName"
                name="tournamentName"
                value={editData.tournamentName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="date">Date:</label>
              <input
                type="date"
                id="date"
                name="date"
                value={editData.date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="startTime">Start Time:</label>
              <input
                type="text"
                id="startTime"
                name="startTime"
                value={editData.startTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="e.g. 10:00 AM"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="minBidIncrement">Minimum Bid Increment:</label>
              <input
                type="number"
                id="minBidIncrement"
                name="minBidIncrement"
                value={editData.minBidIncrement}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="maxBudget">Max Budget:</label>
              <input
                type="number"
                id="maxBudget"
                name="maxBudget"
                value={editData.maxBudget}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="status">Status:</label>
              <select
                id="status"
                name="status"
                value={editData.status}
                onChange={handleInputChange}
                disabled={statusUpdating}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {validStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-1" htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={editData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              rows={3}
            />
          </div>

          {statusUpdating && <p className="text-blue-600 text-center mb-2">Updating...</p>}
          {statusError && <p className="text-red-600 text-center mb-2">{statusError}</p>}

          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={handleSaveClick}
              disabled={statusUpdating}
              className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition duration-300 flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Save</span>
            </button>
            <button
              onClick={handleCancelClick}
              disabled={statusUpdating}
              className="bg-gray-400 text-white px-6 py-2 rounded-md text-sm font-semibold hover:bg-gray-500 transition duration-300 flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
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