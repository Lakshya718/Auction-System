import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";

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
  const [previewPhoto, setPreviewPhoto] = useState(null);

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
      setPreviewPhoto(URL.createObjectURL(e.target.files[0]));
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
        setPreviewPhoto(null);
        setProfilePhotoFile(null);
      } else {
        setUpdateError("Failed to update player.");
      }
    } catch (error) {
      setUpdateError(error.response?.data?.error || error.message || "Error updating player.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-600 text-center mt-4">{error}</p>;
  if (!player) return <p className="text-center mt-4">Player not found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {!editMode ? (
        <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden md:flex">
          <div className="md:flex-shrink-0 p-6 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
            <img
              src={player.profilePhoto || "/default-profile.png"}
              alt={player.playerName}
              className="w-64 h-64 object-cover rounded-full border-4 border-white shadow-lg"
            />
          </div>
          <div className="p-8 flex-grow">
            <h2 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
              {player.playerName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-blue-700">Age</p>
                <p className="text-2xl font-semibold text-gray-800">{player.age}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-blue-700">Role</p>
                <p className="text-2xl font-semibold text-gray-800">{player.playerRole}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-blue-700">Status</p>
                <p className="text-2xl font-semibold text-gray-800">{player.status}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-blue-700">Base Price</p>
                <p className="text-2xl font-semibold text-gray-800">${player.basePrice}</p>
              </div>
            </div>
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">About {player.playerName}</h3>
              <p className="text-gray-700 leading-relaxed">
                {player.description || "No description available."}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
              >
                Edit Player Profile
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 p-8 bg-white shadow-xl rounded-xl max-w-2xl mx-auto my-8">
          <h2 className="text-4xl font-extrabold mb-8 text-center text-blue-800">Edit Player: {player.playerName}</h2>

          <div className="flex flex-col items-center mb-8">
            <img
              src={previewPhoto || player.profilePhoto || "/default-profile.png"}
              alt={player.playerName}
              className="w-56 h-56 object-cover rounded-full border-4 border-blue-400 shadow-md mb-6"
            />
            <label
              htmlFor="profilePhoto"
              className="cursor-pointer bg-blue-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-600 transition duration-300 ease-in-out shadow-lg"
            >
              Upload New Photo
              <input
                type="file"
                id="profilePhoto"
                name="profilePhoto"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="playerName">Player Name</label>
              <input
                type="text"
                id="playerName"
                name="playerName"
                value={formData.playerName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition duration-200"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="playerRole">Player Role</label>
              <input
                type="text"
                id="playerRole"
                name="playerRole"
                value={formData.playerRole}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="basePrice">Base Price</label>
              <input
                type="number"
                id="basePrice"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition duration-200"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition duration-200"
              rows="5"
            />
          </div>

          {updateError && <p className="text-red-600 text-center text-sm mt-4">{updateError}</p>}
          {updateSuccess && <p className="text-green-600 text-center text-sm mt-4">{updateSuccess}</p>}

          <div className="flex justify-center gap-6 mt-8">
            <button
              type="submit"
              disabled={updating}
              className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            >
              {updating ? "Updating..." : "Update Player"}
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="bg-gray-400 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-500 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
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
