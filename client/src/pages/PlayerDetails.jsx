import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/axios";

const PlayerDetails = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    playerName: "",
    age: "",
    playerRole: "",
    basePrice: "",
    description: "",
  });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await API.get(`players/${id}`);
        const p = response.data.player || response.data;
        setPlayer(p);
        setFormData({
          playerName: p.playerName || "",
          age: p.age || "",
          playerRole: p.playerRole || "",
          basePrice: p.basePrice || "",
          description: p.description || "",
        });
      } catch {
        setError("Failed to fetch player details.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhotoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");

    try {
      const data = new FormData();
      data.append("playerName", formData.playerName);
      data.append("age", formData.age);
      data.append("playerRole", formData.playerRole);
      data.append("basePrice", formData.basePrice);
      data.append("description", formData.description);
      if (profilePhotoFile) {
        data.append("profilePhoto", profilePhotoFile);
      }

      const response = await API.patch(`players/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setUpdateSuccess("Player updated successfully.");
        setPlayer(response.data.player);
        setEditMode(false);
      } else {
        setUpdateError("Failed to update player.");
      }
    } catch (error) {
      setUpdateError(error.response?.data?.error || error.message || "Error updating player.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p>Loading player details...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!player) return <p>Player not found.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      {!editMode ? (
        <>
          <h2 className="text-3xl font-bold mb-4">{player.playerName}</h2>
          <img
            src={player.profilePhoto || "/default-profile.png"}
            alt={player.playerName}
            className="w-64 h-64 object-cover rounded mb-4"
          />
          <p><strong>Age:</strong> {player.age}</p>
          <p><strong>Role:</strong> {player.playerRole}</p>
          <p><strong>Status:</strong> {player.status}</p>
          <p><strong>Base Price:</strong> {player.basePrice}</p>
          <p><strong>Description:</strong> {player.description || "N/A"}</p>
          <button
            onClick={() => setEditMode(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit
          </button>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-3xl font-bold mb-4">Edit Player: {player.playerName}</h2>
          <img
            src={player.profilePhoto || "/default-profile.png"}
            alt={player.playerName}
            className="w-64 h-64 object-cover rounded mb-4"
          />
          <div>
            <label className="block font-semibold mb-1" htmlFor="playerName">Player Name</label>
            <input
              type="text"
              id="playerName"
              name="playerName"
              value={formData.playerName}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1" htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded p-2"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1" htmlFor="playerRole">Player Role</label>
            <input
              type="text"
              id="playerRole"
              name="playerRole"
              value={formData.playerRole}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1" htmlFor="basePrice">Base Price</label>
            <input
              type="number"
              id="basePrice"
              name="basePrice"
              value={formData.basePrice}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded p-2"
              min="0"
              required
            />
          </div>
          <div>
            <label className="block font-semibold mb-1" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded p-2"
              rows="4"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1" htmlFor="profilePhoto">Profile Photo</label>
            <input
              type="file"
              id="profilePhoto"
              name="profilePhoto"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
            />
          </div>
          {updateError && <p className="text-red-600">{updateError}</p>}
          {updateSuccess && <p className="text-green-600">{updateSuccess}</p>}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={updating}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {updating ? "Updating..." : "Update Player"}
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PlayerDetails;
