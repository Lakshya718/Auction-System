import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AddPlayer = () => {
  const [formData, setFormData] = useState({
    playerName: 'p9',
    email: 'p9@gmail.com',
    phone: '1',
    age: '24',
    playerRole: 'batsman',
    battingStyle: 'right-handed',
    bowlingStyle: 'none',
    playingExperience: "7",
    country: 'India',
    basePrice: '12345678',
    description: 'null',
    contractEndDate: '',
    profilePhoto: null,
    matches: "15",
    runs: "500",
    wickets: "2",
    average: '100',
    strikeRate: '120',
    economy: '8.1',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const playerRoles = [
    'batsman',
    'pace-bowler',
    'medium-pace-bowler',
    'spinner',
    'batting all-rounder',
    'bowling all-rounder',
    'wicket-keeper',
  ];

  const battingStyles = ['right-handed', 'left-handed'];

  const bowlingStyles = [
    'right-arm-fast',
    'right-arm-medium',
    'right-arm-off-spin',
    'left-arm-fast',
    'left-arm-medium',
    'left-arm-spin',
    'none',
  ];

  const role = useSelector((state) => state.user.role);
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== 'admin') {
      navigate('/'); // Redirect non-admin users to home or login page
    }
  }, [role, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePhoto') {
      setFormData({ ...formData, profilePhoto: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = new FormData();
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      }

      // Convert contractEndDate to ISO string if present
      if (formData.contractEndDate) {
        data.set('contractEndDate', new Date(formData.contractEndDate).toISOString());
      }

      // Convert numeric fields to numbers
      ['age', 'playingExperience', 'basePrice', 'matches', 'runs', 'wickets', 'average', 'strikeRate', 'economy'].forEach(field => {
        if (formData[field]) {
          data.set(field, Number(formData[field]));
        }
      });

      const response = await API.post('/players/add-player', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccess('Player added successfully!');
        setFormData({
          playerName: '',
          email: '',
          phone: '',
          age: '',
          playerRole: 'batsman',
          battingStyle: 'right-handed',
          bowlingStyle: 'none',
          playingExperience: '',
          country: '',
          basePrice: '',
          description: '',
          contractEndDate: '',
          profilePhoto: null,
          matches: '',
          runs: '',
          wickets: '',
          average: '',
          strikeRate: '',
          economy: '',
        });
      } else {
        setError('Failed to add player.');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Add Player</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        <div>
          <label className="block font-semibold">Player Name *</label>
          <input
            type="text"
            name="playerName"
            value={formData.playerName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Phone *</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Age *</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            min="0"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Player Role *</label>
          <select
            name="playerRole"
            value={formData.playerRole}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            {playerRoles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold">Batting Style *</label>
          <select
            name="battingStyle"
            value={formData.battingStyle}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            {battingStyles.map((style) => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold">Bowling Style</label>
          <select
            name="bowlingStyle"
            value={formData.bowlingStyle}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            {bowlingStyles.map((style) => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-semibold">Playing Experience (years)</label>
          <input
            type="number"
            name="playingExperience"
            value={formData.playingExperience}
            onChange={handleChange}
            min="0"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Country *</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Base Price *</label>
          <input
            type="number"
            name="basePrice"
            value={formData.basePrice}
            onChange={handleChange}
            required
            min="0"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows="3"
          />
        </div>
        <div>
          <label className="block font-semibold">Contract End Date</label>
          <input
            type="date"
            name="contractEndDate"
            value={formData.contractEndDate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Profile Photo</label>
          <input
            type="file"
            name="profilePhoto"
            accept="image/*"
            onChange={handleChange}
            className="w-full"
          />
        </div>
        <h3 className="text-lg font-semibold mt-6 mb-2">Stats</h3>
        <div>
          <label className="block font-semibold">Matches</label>
          <input
            type="number"
            name="matches"
            value={formData.matches}
            onChange={handleChange}
            min="0"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Runs</label>
          <input
            type="number"
            name="runs"
            value={formData.runs}
            onChange={handleChange}
            min="0"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Wickets</label>
          <input
            type="number"
            name="wickets"
            value={formData.wickets}
            onChange={handleChange}
            min="0"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Average</label>
          <input
            type="number"
            name="average"
            value={formData.average}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Strike Rate</label>
          <input
            type="number"
            name="strikeRate"
            value={formData.strikeRate}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block font-semibold">Economy</label>
          <input
            type="number"
            name="economy"
            value={formData.economy}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Adding...' : 'Add Player'}
        </button>
      </form>
    </div>
  );
};

export default AddPlayer;
