import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaFootballBall,
  FaBasketballBall,
  FaVolleyballBall,
  FaUsers,
  FaRunning,
} from 'react-icons/fa';
import { GiCricketBat } from 'react-icons/gi';

const PlayerDetails = () => {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    playerName: '',
    age: '',
    sport: 'cricket',
    playerRole: '',
    basePrice: '',
    description: '',
    // Cricket stats
    matches: 0,
    runs: 0,
    wickets: 0,
    average: 0,
    strikeRate: 0,
    economy: 0,
    // Football stats
    goals: 0,
    assists: 0,
    cleanSheets: 0,
    yellowCards: 0,
    redCards: 0,
    // Basketball stats
    points: 0,
    rebounds: 0,
    steals: 0,
    blocks: 0,
    // Volleyball stats
    aces: 0,
    digs: 0,
    // Kabaddi stats
    raidPoints: 0,
    tacklePoints: 0,
    allOutPoints: 0,
    superRaids: 0,
    superTackles: 0,
  });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [previewPhoto, setPreviewPhoto] = useState(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const response = await API.get(`players/${id}`);
        const p = response.data.player || response.data;
        setPlayer(p);

        // Initialize form data with player information
        const initialFormData = {
          playerName: p.playerName || '',
          age: p.age || '',
          sport: p.sport || 'cricket',
          playerRole: p.playerRole || '',
          basePrice: p.basePrice || '',
          description: p.description || '',
          // Initialize all stats with default values
          matches: 0,
          runs: 0,
          wickets: 0,
          average: 0,
          strikeRate: 0,
          economy: 0,
          goals: 0,
          assists: 0,
          cleanSheets: 0,
          yellowCards: 0,
          redCards: 0,
          points: 0,
          rebounds: 0,
          steals: 0,
          blocks: 0,
          aces: 0,
          digs: 0,
          raidPoints: 0,
          tacklePoints: 0,
          allOutPoints: 0,
          superRaids: 0,
          superTackles: 0,
        };

        // Add sport-specific stats if they exist
        if (p.sport === 'cricket' && p.cricketStats) {
          Object.assign(initialFormData, {
            matches: p.cricketStats.matches || 0,
            runs: p.cricketStats.runs || 0,
            wickets: p.cricketStats.wickets || 0,
            average: p.cricketStats.average || 0,
            strikeRate: p.cricketStats.strikeRate || 0,
            economy: p.cricketStats.economy || 0,
          });
        } else if (p.sport === 'football' && p.footballStats) {
          Object.assign(initialFormData, {
            matches: p.footballStats.matches || 0,
            goals: p.footballStats.goals || 0,
            assists: p.footballStats.assists || 0,
            cleanSheets: p.footballStats.cleanSheets || 0,
            yellowCards: p.footballStats.yellowCards || 0,
            redCards: p.footballStats.redCards || 0,
          });
        } else if (p.sport === 'basketball' && p.basketballStats) {
          Object.assign(initialFormData, {
            matches: p.basketballStats.matches || 0,
            points: p.basketballStats.points || 0,
            rebounds: p.basketballStats.rebounds || 0,
            assists: p.basketballStats.assists || 0,
            steals: p.basketballStats.steals || 0,
            blocks: p.basketballStats.blocks || 0,
          });
        } else if (p.sport === 'volleyball' && p.volleyballStats) {
          Object.assign(initialFormData, {
            matches: p.volleyballStats.matches || 0,
            points: p.volleyballStats.points || 0,
            aces: p.volleyballStats.aces || 0,
            blocks: p.volleyballStats.blocks || 0,
            digs: p.volleyballStats.digs || 0,
            assists: p.volleyballStats.assists || 0,
          });
        } else if (p.sport === 'kabaddi' && p.kabaddiStats) {
          Object.assign(initialFormData, {
            matches: p.kabaddiStats.matches || 0,
            raidPoints: p.kabaddiStats.raidPoints || 0,
            tacklePoints: p.kabaddiStats.tacklePoints || 0,
            allOutPoints: p.kabaddiStats.allOutPoints || 0,
            superRaids: p.kabaddiStats.superRaids || 0,
            superTackles: p.kabaddiStats.superTackles || 0,
          });
        }

        setFormData(initialFormData);
      } catch {
        setError('Failed to fetch player details.');
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
    setUpdateError('');
    setUpdateSuccess('');

    try {
      const data = new FormData();
      data.append('playerName', formData.playerName);
      data.append('age', formData.age);
      data.append('sport', formData.sport);
      data.append('playerRole', formData.playerRole);
      data.append('basePrice', formData.basePrice);
      data.append('description', formData.description);

      // Add sport-specific stats
      if (formData.sport === 'cricket') {
        data.append('cricketStats[matches]', formData.matches);
        data.append('cricketStats[runs]', formData.runs);
        data.append('cricketStats[wickets]', formData.wickets);
        data.append('cricketStats[average]', formData.average);
        data.append('cricketStats[strikeRate]', formData.strikeRate);
        data.append('cricketStats[economy]', formData.economy);
      } else if (formData.sport === 'football') {
        data.append('footballStats[matches]', formData.matches);
        data.append('footballStats[goals]', formData.goals);
        data.append('footballStats[assists]', formData.assists);
        data.append('footballStats[cleanSheets]', formData.cleanSheets);
        data.append('footballStats[yellowCards]', formData.yellowCards);
        data.append('footballStats[redCards]', formData.redCards);
      } else if (formData.sport === 'basketball') {
        data.append('basketballStats[matches]', formData.matches);
        data.append('basketballStats[points]', formData.points);
        data.append('basketballStats[rebounds]', formData.rebounds);
        data.append('basketballStats[assists]', formData.assists);
        data.append('basketballStats[steals]', formData.steals);
        data.append('basketballStats[blocks]', formData.blocks);
      } else if (formData.sport === 'volleyball') {
        data.append('volleyballStats[matches]', formData.matches);
        data.append('volleyballStats[points]', formData.points);
        data.append('volleyballStats[aces]', formData.aces);
        data.append('volleyballStats[blocks]', formData.blocks);
        data.append('volleyballStats[digs]', formData.digs);
        data.append('volleyballStats[assists]', formData.assists);
      } else if (formData.sport === 'kabaddi') {
        data.append('kabaddiStats[matches]', formData.matches);
        data.append('kabaddiStats[raidPoints]', formData.raidPoints);
        data.append('kabaddiStats[tacklePoints]', formData.tacklePoints);
        data.append('kabaddiStats[allOutPoints]', formData.allOutPoints);
        data.append('kabaddiStats[superRaids]', formData.superRaids);
        data.append('kabaddiStats[superTackles]', formData.superTackles);
      }

      if (profilePhotoFile) {
        data.append('profilePhoto', profilePhotoFile);
      }

      const response = await API.patch(`players/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setUpdateSuccess('Player updated successfully.');
        setPlayer(response.data.player);
        setEditMode(false);
        setPreviewPhoto(null);
        setProfilePhotoFile(null);
      } else {
        setUpdateError('Failed to update player.');
      }
    } catch (error) {
      setUpdateError(
        error.response?.data?.error || error.message || 'Error updating player.'
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-600 text-center mt-4">{error}</p>;
  if (!player) return <p className="text-center mt-4">Player not found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="h-[10vh]"></div>
      {!editMode ? (
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl overflow-hidden md:flex">
          <div className="md:flex-shrink-0 p-6 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
            <img
              src={player.profilePhoto || '/default-profile.png'}
              alt={player.playerName}
              className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-lg"
            />
          </div>
          <div className="p-6 flex-grow">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4 leading-tight">
              {player.playerName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-blue-700">Sport</p>
                <p className="text-lg font-semibold text-gray-800 capitalize flex items-center gap-2">
                  {player.sport === 'cricket' && <GiCricketBat />}
                  {player.sport === 'football' && <FaFootballBall />}
                  {player.sport === 'basketball' && <FaBasketballBall />}
                  {player.sport === 'volleyball' && <FaVolleyballBall />}
                  {player.sport === 'kabaddi' && <GiKabaddi />}
                  {player.sport}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-blue-700">Age</p>
                <p className="text-lg font-semibold text-gray-800">
                  {player.age}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-blue-700">Role</p>
                <p className="text-lg font-semibold text-gray-800 capitalize">
                  {player.playerRole && player.playerRole.replace(/-/g, ' ')}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-blue-700">Status</p>
                <p className="text-lg font-semibold text-gray-800">
                  {player.status}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-blue-700">Base Price</p>
                <p className="text-lg font-semibold text-gray-800">
                  ${player.basePrice}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-medium text-blue-700">Country</p>
                <p className="text-lg font-semibold text-gray-800">
                  {player.country}
                </p>
              </div>
            </div>

            {/* Player Stats Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Player Statistics
              </h3>
              <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
                {player.sport === 'cricket' && player.cricketStats && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Matches
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.cricketStats.matches || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Runs</p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.cricketStats.runs || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Wickets
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.cricketStats.wickets || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Batting Average
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.cricketStats.average || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Strike Rate
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.cricketStats.strikeRate || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Economy
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.cricketStats.economy || 0}
                      </p>
                    </div>
                  </div>
                )}

                {player.sport === 'football' && player.footballStats && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Matches
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.footballStats.matches || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Goals</p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.footballStats.goals || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Assists
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.footballStats.assists || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Clean Sheets
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.footballStats.cleanSheets || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Yellow Cards
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.footballStats.yellowCards || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Red Cards
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.footballStats.redCards || 0}
                      </p>
                    </div>
                  </div>
                )}

                {player.sport === 'basketball' && player.basketballStats && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Matches
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.basketballStats.matches || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Points
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.basketballStats.points || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Rebounds
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.basketballStats.rebounds || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Assists
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.basketballStats.assists || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Steals
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.basketballStats.steals || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Blocks
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.basketballStats.blocks || 0}
                      </p>
                    </div>
                  </div>
                )}

                {player.sport === 'volleyball' && player.volleyballStats && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Matches
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.volleyballStats.matches || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Points
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.volleyballStats.points || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Aces</p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.volleyballStats.aces || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Blocks
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.volleyballStats.blocks || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">Digs</p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.volleyballStats.digs || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Assists
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.volleyballStats.assists || 0}
                      </p>
                    </div>
                  </div>
                )}

                {player.sport === 'kabaddi' && player.kabaddiStats && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Matches
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.kabaddiStats.matches || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Raid Points
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.kabaddiStats.raidPoints || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Tackle Points
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.kabaddiStats.tacklePoints || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        All Out Points
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.kabaddiStats.allOutPoints || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Super Raids
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.kabaddiStats.superRaids || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Super Tackles
                      </p>
                      <p className="text-xl font-semibold text-gray-800">
                        {player.kabaddiStats.superTackles || 0}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                About {player.playerName}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {player.description || 'No description available.'}
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-full text-base font-semibold hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
              >
                Edit Player Profile
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6 bg-white shadow-xl rounded-xl max-w-xl mx-auto my-8"
        >
          <h2 className="text-4xl font-extrabold mb-8 text-center text-blue-800">
            Edit Player: {player.playerName}
          </h2>

          <div className="flex flex-col items-center mb-8">
            <img
              src={
                previewPhoto || player.profilePhoto || '/default-profile.png'
              }
              alt={player.playerName}
              className="w-40 h-40 object-cover rounded-full border-4 border-blue-400 shadow-md mb-4"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-gray-700 text-lg font-bold mb-2"
                htmlFor="playerName"
              >
                Player Name
              </label>
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
              <label
                className="block text-gray-700 text-lg font-bold mb-2"
                htmlFor="age"
              >
                Age
              </label>
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
              <label
                className="block text-gray-700 text-lg font-bold mb-2"
                htmlFor="sport"
              >
                Sport
              </label>
              <select
                id="sport"
                name="sport"
                value={formData.sport}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition duration-200"
                required
              >
                <option value="cricket">Cricket</option>
                <option value="football">Football</option>
                <option value="basketball">Basketball</option>
                <option value="volleyball">Volleyball</option>
                <option value="kabaddi">Kabaddi</option>
              </select>
            </div>
            <div>
              <label
                className="block text-gray-700 text-lg font-bold mb-2"
                htmlFor="playerRole"
              >
                Player Role
              </label>
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
              <label
                className="block text-gray-700 text-lg font-bold mb-2"
                htmlFor="basePrice"
              >
                Base Price
              </label>
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

          {/* Stats section based on selected sport */}
          <div className="mt-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Player Statistics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Common stat for all sports */}
              <div>
                <label
                  className="block text-gray-700 font-bold mb-2"
                  htmlFor="matches"
                >
                  Matches
                </label>
                <input
                  type="number"
                  id="matches"
                  name="matches"
                  value={formData.matches}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                  min="0"
                />
              </div>

              {/* Cricket specific stats */}
              {formData.sport === 'cricket' && (
                <>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="runs"
                    >
                      Runs
                    </label>
                    <input
                      type="number"
                      id="runs"
                      name="runs"
                      value={formData.runs}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="wickets"
                    >
                      Wickets
                    </label>
                    <input
                      type="number"
                      id="wickets"
                      name="wickets"
                      value={formData.wickets}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="average"
                    >
                      Batting Average
                    </label>
                    <input
                      type="number"
                      id="average"
                      name="average"
                      value={formData.average}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="strikeRate"
                    >
                      Strike Rate
                    </label>
                    <input
                      type="number"
                      id="strikeRate"
                      name="strikeRate"
                      value={formData.strikeRate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="economy"
                    >
                      Economy
                    </label>
                    <input
                      type="number"
                      id="economy"
                      name="economy"
                      value={formData.economy}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </>
              )}

              {/* Football specific stats */}
              {formData.sport === 'football' && (
                <>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="goals"
                    >
                      Goals
                    </label>
                    <input
                      type="number"
                      id="goals"
                      name="goals"
                      value={formData.goals}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="assists"
                    >
                      Assists
                    </label>
                    <input
                      type="number"
                      id="assists"
                      name="assists"
                      value={formData.assists}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="cleanSheets"
                    >
                      Clean Sheets
                    </label>
                    <input
                      type="number"
                      id="cleanSheets"
                      name="cleanSheets"
                      value={formData.cleanSheets}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="yellowCards"
                    >
                      Yellow Cards
                    </label>
                    <input
                      type="number"
                      id="yellowCards"
                      name="yellowCards"
                      value={formData.yellowCards}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="redCards"
                    >
                      Red Cards
                    </label>
                    <input
                      type="number"
                      id="redCards"
                      name="redCards"
                      value={formData.redCards}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                </>
              )}

              {/* Basketball specific stats */}
              {formData.sport === 'basketball' && (
                <>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="points"
                    >
                      Points
                    </label>
                    <input
                      type="number"
                      id="points"
                      name="points"
                      value={formData.points}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="rebounds"
                    >
                      Rebounds
                    </label>
                    <input
                      type="number"
                      id="rebounds"
                      name="rebounds"
                      value={formData.rebounds}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="assists"
                    >
                      Assists
                    </label>
                    <input
                      type="number"
                      id="assists"
                      name="assists"
                      value={formData.assists}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="steals"
                    >
                      Steals
                    </label>
                    <input
                      type="number"
                      id="steals"
                      name="steals"
                      value={formData.steals}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="blocks"
                    >
                      Blocks
                    </label>
                    <input
                      type="number"
                      id="blocks"
                      name="blocks"
                      value={formData.blocks}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                </>
              )}

              {/* Volleyball specific stats */}
              {formData.sport === 'volleyball' && (
                <>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="points"
                    >
                      Points
                    </label>
                    <input
                      type="number"
                      id="points"
                      name="points"
                      value={formData.points}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="aces"
                    >
                      Aces
                    </label>
                    <input
                      type="number"
                      id="aces"
                      name="aces"
                      value={formData.aces}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="blocks"
                    >
                      Blocks
                    </label>
                    <input
                      type="number"
                      id="blocks"
                      name="blocks"
                      value={formData.blocks}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="digs"
                    >
                      Digs
                    </label>
                    <input
                      type="number"
                      id="digs"
                      name="digs"
                      value={formData.digs}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="assists"
                    >
                      Assists
                    </label>
                    <input
                      type="number"
                      id="assists"
                      name="assists"
                      value={formData.assists}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                </>
              )}

              {/* Kabaddi specific stats */}
              {formData.sport === 'kabaddi' && (
                <>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="raidPoints"
                    >
                      Raid Points
                    </label>
                    <input
                      type="number"
                      id="raidPoints"
                      name="raidPoints"
                      value={formData.raidPoints}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="tacklePoints"
                    >
                      Tackle Points
                    </label>
                    <input
                      type="number"
                      id="tacklePoints"
                      name="tacklePoints"
                      value={formData.tacklePoints}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="allOutPoints"
                    >
                      All Out Points
                    </label>
                    <input
                      type="number"
                      id="allOutPoints"
                      name="allOutPoints"
                      value={formData.allOutPoints}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="superRaids"
                    >
                      Super Raids
                    </label>
                    <input
                      type="number"
                      id="superRaids"
                      name="superRaids"
                      value={formData.superRaids}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                  <div>
                    <label
                      className="block text-gray-700 font-bold mb-2"
                      htmlFor="superTackles"
                    >
                      Super Tackles
                    </label>
                    <input
                      type="number"
                      id="superTackles"
                      name="superTackles"
                      value={formData.superTackles}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      min="0"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div>
            <label
              className="block text-gray-700 text-lg font-bold mb-2"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200 transition duration-200"
              rows="5"
            />
          </div>

          {updateError && (
            <p className="text-red-600 text-center text-sm mt-4">
              {updateError}
            </p>
          )}
          {updateSuccess && (
            <p className="text-green-600 text-center text-sm mt-4">
              {updateSuccess}
            </p>
          )}

          <div className="flex justify-center gap-6 mt-8">
            <button
              type="submit"
              disabled={updating}
              className="bg-blue-600 text-white px-6 py-2 rounded-full text-base font-semibold hover:bg-blue-700 disabled:opacity-50 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            >
              {updating ? 'Updating...' : 'Update Player'}
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="bg-gray-400 text-white px-6 py-2 rounded-full text-base font-semibold hover:bg-gray-500 transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
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
