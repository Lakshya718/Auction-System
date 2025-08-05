import React, { useState, useEffect } from 'react';
import API from '../../api/axios';

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
        const response = await API.get('/teams/my-team');
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
      const response = await API.patch('teams/' + team._id, formData);
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
    return <div className="p-4 text-center">Loading team data...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  if (!team) {
    return <div className="p-4 text-center">No team data available.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
      <div className='h-[5vh]'></div>
      <h2 className="text-3xl font-bold mb-6 text-center">{team.name}</h2>
      {team.logo && !editMode && (
        <div className="flex justify-center mb-6">
          <img
            src={team.logo}
            alt={team.name + ' logo'}
            className="w-40 h-40 object-contain rounded-lg shadow-md"
          />
        </div>
      )}

      {!editMode ? (
        <>
          <p className="mb-6 text-gray-700 text-center">{team.bio}</p>
          <div className="flex justify-center">
            <button
              onClick={handleEditToggle}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
              Edit Team
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleFormSubmit} className="max-w-md mx-auto space-y-6">
          <div>
            <label className="block mb-2 font-semibold text-gray-800" htmlFor="name">Team Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-800" htmlFor="logo">Logo URL</label>
            <input
              type="text"
              id="logo"
              name="logo"
              value={formData.logo}
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            {formData.logo && (
              <div className="mt-4 flex justify-center">
                <img
                  src={formData.logo}
                  alt="Logo Preview"
                  className="w-32 h-32 object-contain rounded-lg shadow-md"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block mb-2 font-semibold text-gray-800" htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
          {updateError && <p className="text-red-600 mb-2">{updateError}</p>}
          {updateSuccess && <p className="text-green-600 mb-2">Team updated successfully!</p>}
          <div className="flex justify-center space-x-4">
            <button
              type="submit"
              disabled={updateLoading}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
            >
              {updateLoading ? 'Updating...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={handleEditToggle}
              disabled={updateLoading}
              className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <h3 className="text-2xl font-semibold mt-10 mb-4 text-center">Players</h3>
      {team.players && team.players.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {team.players.map((player) => (
            <div key={player._id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
              <p className="font-semibold text-lg">{player.playerName}</p>
              <p className="text-gray-700">Role: {player.playerRole}</p>
              {player.purchasePrice && (
                <p className="text-gray-700">Purchase Price: ${player.purchasePrice}</p>
              )}
              {player.stats && (
                <div className="mt-2">
                  <strong>Stats:</strong>
                  <ul className="list-disc list-inside text-gray-600">
                    {Object.entries(player.stats).map(([key, value]) => (
                      <li key={key}>
                        {key}: {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No players found for this team.</p>
      )}
    </div>
  );
};

export default TeamProfile;
