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

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatusError("");
    setStatusUpdating(true);
    try {
      const response = await API.patch(`/auctions/${id}/status`, { status: newStatus });
      setAuction((prev) => ({ ...prev, status: response.data.auction.status }));
      if (isEditing) {
        setEditData((prev) => ({ ...prev, status: response.data.auction.status }));
      }
    } catch (err) {
      setStatusError(err.response?.data?.error || "Failed to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

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
    <div className="max-w-3xl mx-auto p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
      >
        Back
      </button>
      {!isEditing ? (
        <>
          <button
            onClick={handleEditClick}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
          <h2 className="text-3xl font-bold mb-4">{auction.tournamentName}</h2>
          <p className="mb-2"><strong>Description:</strong> {auction.description}</p>
          <p className="mb-2">
            <strong>Date:</strong> {new Date(auction.date).toLocaleDateString()}
          </p>
          <p className="mb-2"><strong>Start Time:</strong> {auction.startTime}</p>
          <p className="mb-2"><strong>Minimum Bid Increment:</strong> {auction.minBidIncrement}</p>
          <p className="mb-2"><strong>Max Budget:</strong> {auction.maxBudget}</p>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Teams:</h3>
            {auction.teams && auction.teams.length > 0 ? (
              <ul className="list-disc list-inside">
                {auction.teams.map((team) => (
                  <li key={team._id}>{team.name}</li>
                ))}
              </ul>
            ) : (
              <p>No teams registered.</p>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Players:</h3>
            {auction.players && auction.players.length > 0 ? (
              <ul className="list-disc list-inside">
                {auction.players.map((player) => (
                  <li key={player.player._id}>{player.player.playerName}</li>
                ))}
              </ul>
            ) : (
              <p>No players registered.</p>
            )}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold mb-4">Edit Auction</h2>
          <div className="mb-2">
            <label className="block font-semibold mb-1" htmlFor="tournamentName">Tournament Name:</label>
            <input
              type="text"
              id="tournamentName"
              name="tournamentName"
              value={editData.tournamentName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-2 py-1"
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold mb-1" htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              value={editData.description}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-2 py-1"
              rows={3}
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold mb-1" htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={editData.date}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-2 py-1"
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold mb-1" htmlFor="startTime">Start Time:</label>
            <input
              type="text"
              id="startTime"
              name="startTime"
              value={editData.startTime}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-2 py-1"
              placeholder="e.g. 10:00 AM"
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold mb-1" htmlFor="minBidIncrement">Minimum Bid Increment:</label>
            <input
              type="number"
              id="minBidIncrement"
              name="minBidIncrement"
              value={editData.minBidIncrement}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-2 py-1"
            />
          </div>
          <div className="mb-2">
            <label className="block font-semibold mb-1" htmlFor="maxBudget">Max Budget:</label>
            <input
              type="number"
              id="maxBudget"
              name="maxBudget"
              value={editData.maxBudget}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-2 py-1"
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1" htmlFor="status">Status:</label>
            <select
              id="status"
              name="status"
              value={editData.status}
              onChange={handleInputChange}
              disabled={statusUpdating}
              className="border border-gray-300 rounded px-2 py-1"
            >
              {validStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            {statusUpdating && <span className="ml-2 text-blue-600">Updating...</span>}
            {statusError && <p className="text-red-600 mt-1">{statusError}</p>}
          </div>
          <button
            onClick={handleSaveClick}
            disabled={statusUpdating}
            className="mr-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
          <button
            onClick={handleCancelClick}
            disabled={statusUpdating}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </>
      )}
    </div>
  );
};

export default AuctionDetails;
