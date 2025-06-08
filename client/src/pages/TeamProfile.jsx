import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeamProfile = () => {
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    bio: '',
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const fetchMyTeam = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/my-team');
        setTeam(response.data);
        setFormData({
          name: response.data.name || '',
          logo: response.data.logo || '',
          bio: response.data.bio || '',
        });
        setError(null);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch team data');
        setTeam(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMyTeam();
  }, []);

  const handleEditToggle = () => {
    setEditMode(!editMode);
    setUpdateError(null);
    setUpdateSuccess(false);
    if (team) {
      setFormData({
        name: team.name || '',
        logo: team.logo || '',
        bio: team.bio || '',
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!team) return;
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);
    try {
      const response = await axios.patch('/team/' + team._id, formData);
      setTeam(response.data);
      setUpdateSuccess(true);
      setEditMode(false);
    } catch (err) {
      setUpdateError(err.response?.data?.error || 'Failed to update team');
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading team data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  if (!team) {
    return <div className="p-4">No team data available.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{team.name}</h2>
      {team.logo && !editMode && (
        <img
          src={team.logo}
          alt={team.name + ' logo'}
          className="w-32 h-32 object-contain mb-4"
        />
      )}

      {!editMode ? (
        <>
          <p className="mb-6">{team.bio}</p>
          <button
            onClick={handleEditToggle}
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit Team
          </button>
        </>
      ) : (
        <form onSubmit={handleFormSubmit} className="mb-6 max-w-md">
          <div className="mb-4">
            <label className="block mb-1 font-semibold" htmlFor="name">Team Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold" htmlFor="logo">Logo URL</label>
            <input
              type="text"
              id="logo"
              name="logo"
              value={formData.logo}
              onChange={handleInputChange}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-semibold" htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full border px-3 py-2 rounded"
            />
          </div>
          {updateError && <p className="text-red-600 mb-2">{updateError}</p>}
          {updateSuccess && <p className="text-green-600 mb-2">Team updated successfully!</p>}
          <div>
            <button
              type="submit"
              disabled={updateLoading}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2"
            >
              {updateLoading ? 'Updating...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleEditToggle}
              disabled={updateLoading}
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <h3 className="text-xl font-semibold mb-2">Players</h3>
      {team.players && team.players.length > 0 ? (
        <ul className="space-y-4">
          {team.players.map((player) => (
            <li key={player._id} className="border p-4 rounded shadow-sm">
              <p><strong>Name:</strong> {player.playerName}</p>
              <p><strong>Role:</strong> {player.playerRole}</p>
              {player.purchasePrice && (
                <p><strong>Purchase Price:</strong> ${player.purchasePrice}</p>
              )}
              {/* Display stats if available */}
              {player.stats && (
                <div className="mt-2">
                  <strong>Stats:</strong>
                  <ul className="list-disc list-inside">
                    {Object.entries(player.stats).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No players found for this team.</p>
      )}
    </div>
  );
};

export default TeamProfile;
