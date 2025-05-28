import React, { useState } from 'react';
import axios from '../../api/axios'; // Assuming axios instance is configured here

const CreateAuction = () => {
  const [formData, setFormData] = useState({
    auctionName: '',
    auctionDescription: '',
    auctionDate: '',
    auctionStartTime: '',
    playerBasePrice: 2000000,
    teamTotalBudget: 150000000,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateTimeFormat = (time) => {
    const regex = /^(0?[1-9]|1[0-2]):[0-5][0-9] (AM|PM)$/;
    return regex.test(time);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.auctionName.trim()) {
      setError('Auction name is required');
      return;
    }
    if (!formData.auctionDate) {
      setError('Auction date is required');
      return;
    }
    if (!validateTimeFormat(formData.auctionStartTime)) {
      setError('Auction start time must be in HH:MM AM/PM format');
      return;
    }
    if (formData.teamTotalBudget <= 0) {
      setError('Team total budget must be greater than zero');
      return;
    }

    try {
      const response = await axios.post('/auctions/create', formData);
      if (response.data.success) {
        setSuccess('Auction created successfully');
        alert('Auction ');
      } else {
        setError(response.data.error || 'Failed to create auction');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Server error');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create Auction</h2>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="auctionName" className="block font-medium">Auction Name *</label>
          <input
            type="text"
            id="auctionName"
            name="auctionName"
            value={formData.auctionName}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="auctionDescription" className="block font-medium">Auction Description</label>
          <textarea
            id="auctionDescription"
            name="auctionDescription"
            value={formData.auctionDescription}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={3}
          />
        </div>
        <div>
          <label htmlFor="auctionDate" className="block font-medium">Auction Date *</label>
          <input
            type="date"
            id="auctionDate"
            name="auctionDate"
            value={formData.auctionDate}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="auctionStartTime" className="block font-medium">Auction Start Time (HH:MM AM/PM) *</label>
          <input
            type="text"
            id="auctionStartTime"
            name="auctionStartTime"
            value={formData.auctionStartTime}
            onChange={handleChange}
            placeholder="e.g. 10:30 AM"
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="playerBasePrice" className="block font-medium">Player Base Price</label>
          <input
            type="number"
            id="playerBasePrice"
            name="playerBasePrice"
            value={formData.playerBasePrice}
            onChange={handleChange}
            min={0}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="teamTotalBudget" className="block font-medium">Team Total Budget *</label>
          <input
            type="number"
            id="teamTotalBudget"
            name="teamTotalBudget"
            value={formData.teamTotalBudget}
            onChange={handleChange}
            min={1}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Auction
        </button>
      </form>
    </div>
  );
};

export default CreateAuction;
