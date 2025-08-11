import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBirthdayCake,
  FaUserTie,
  FaHandPaper,
  FaBowlingBall,
  FaClock,
  FaGlobe,
  FaDollarSign,
  FaAlignLeft,
  FaCalendarAlt,
  FaFileImage,
  FaListOl,
  FaRunning,
  FaMedal,
  FaChartLine,
  FaTachometerAlt,
  FaBalanceScale,
  FaUserPlus,
  FaCheckCircle,
  FaExclamationCircle,
  FaRuler,
  FaRulerHorizontal,
  FaFootballBall,
  FaBasketballBall,
  FaVolleyballBall,
  FaSquare,
  FaUsers,
} from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';

const AddPlayer = () => {
  const [formData, setFormData] = useState({
    playerName: '',
    email: '',
    phone: '',
    age: '',
    sport: 'cricket',
    playerRole: 'batsman',
    battingStyle: 'right-handed',
    bowlingStyle: 'none',
    footedness: 'not-applicable',
    height: '',
    wingspan: '',
    playingExperience: '',
    country: '',
    basePrice: '',
    description: '',
    contractEndDate: '',
    profilePhoto: null,
    // Cricket stats
    matches: '',
    runs: '',
    wickets: '',
    average: '',
    strikeRate: '',
    economy: '',
    // Football stats
    goals: '',
    assists: '',
    cleanSheets: '',
    yellowCards: '',
    redCards: '',
    // Basketball stats
    points: '',
    rebounds: '',
    steals: '',
    blocks: '',
    // Volleyball stats
    aces: '',
    digs: '',
    // Kabaddi stats
    raidPoints: '',
    tacklePoints: '',
    allOutPoints: '',
    superRaids: '',
    superTackles: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Define sport-specific player roles
  const sportRoles = {
    cricket: [
      'batsman',
      'pace-bowler',
      'medium-pace-bowler',
      'spinner',
      'batting all-rounder',
      'bowling all-rounder',
      'wicket-keeper',
    ],
    football: [
      'goalkeeper',
      'defender',
      'midfielder',
      'forward',
      'striker',
      'winger',
      'center-back',
      'full-back',
    ],
    basketball: [
      'point-guard',
      'shooting-guard',
      'small-forward',
      'power-forward',
      'center',
    ],
    volleyball: [
      'setter',
      'outside-hitter',
      'opposite',
      'middle-blocker',
      'libero',
    ],
    kabaddi: ['raider', 'defender', 'all-rounder', 'corner', 'cover'],
  };

  // Get player roles for the selected sport
  const playerRoles = sportRoles[formData.sport] || [];

  const battingStyles = ['right-handed', 'left-handed', 'not-applicable'];

  const bowlingStyles = [
    'right-arm-fast',
    'right-arm-medium',
    'right-arm-off-spin',
    'left-arm-fast',
    'left-arm-medium',
    'left-arm-spin',
    'none',
  ];

  const footednessOptions = ['right', 'left', 'both', 'not-applicable'];

  const role = useSelector((state) => state.user.role);
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== 'admin') {
      navigate('/'); // Redirect non-admin users to home or login page
    }
  }, [role, navigate]);

  // Handle sport change
  const handleSportChange = (e) => {
    const sport = e.target.value;
    // Reset role to first role of the selected sport
    const defaultRole = sportRoles[sport][0] || '';

    setFormData({
      ...formData,
      sport,
      playerRole: defaultRole,
      // Reset sport-specific fields that don't apply
      battingStyle: sport === 'cricket' ? 'right-handed' : 'not-applicable',
      bowlingStyle: sport === 'cricket' ? 'none' : 'none',
      footedness: sport === 'football' ? 'right' : 'not-applicable',
    });
  };

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

    // Validation
    if (formData.phone.length !== 10) {
      setLoading(false);
      setError('Phone number must be exactly 10 digits.');
      return;
    }
    const ageNum = Number(formData.age);
    if (ageNum < 5 || ageNum > 70) {
      setLoading(false);
      setError('Age must be between 5 and 70.');
      return;
    }
    const playingExpNum = Number(formData.playingExperience);
    if (playingExpNum < 0 || playingExpNum > 60) {
      setLoading(false);
      setError('Playing experience must be between 0 and 60.');
      return;
    }
    const basePriceNum = Number(formData.basePrice);
    if (basePriceNum < 1000000 || basePriceNum > 20000000) {
      setLoading(false);
      setError('Base price must be between 1,000,000 and 20,000,000.');
      return;
    }
    const allowedCountries = [
      'India',
      'China',
      'USA',
      'Brazil',
      'Sri Lanka',
      'Pakistan',
      'Nepal',
      'Bangladesh',
      'Afghanistan',
    ];
    if (!allowedCountries.includes(formData.country)) {
      setLoading(false);
      setError('Country must be one of the allowed options.');
      return;
    }

    try {
      const data = new FormData();
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      }

      if (formData.contractEndDate) {
        data.set(
          'contractEndDate',
          new Date(formData.contractEndDate).toISOString()
        );
      }

      [
        'age',
        'playingExperience',
        'basePrice',
        'height',
        'wingspan',
        // Sport-specific stat fields
        // Cricket
        'matches',
        'runs',
        'wickets',
        'average',
        'strikeRate',
        'economy',
        // Football
        'goals',
        'assists',
        'cleanSheets',
        'yellowCards',
        'redCards',
        // Basketball
        'points',
        'rebounds',
        'steals',
        'blocks',
        // Volleyball
        'aces',
        'digs',
        // Kabaddi
        'raidPoints',
        'tacklePoints',
        'allOutPoints',
        'superRaids',
        'superTackles',
      ].forEach((field) => {
        if (formData[field]) {
          data.set(field, Number(formData[field]));
        }
      });

      const response = await API.post('/players/registration-request', data, {
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
          sport: 'cricket',
          playerRole: 'batsman',
          battingStyle: 'right-handed',
          bowlingStyle: 'none',
          footedness: 'not-applicable',
          height: '',
          wingspan: '',
          playingExperience: '',
          country: '',
          basePrice: '',
          description: '',
          contractEndDate: '',
          profilePhoto: null,
          // Cricket stats
          matches: '',
          runs: '',
          wickets: '',
          average: '',
          strikeRate: '',
          economy: '',
          // Football stats
          goals: '',
          assists: '',
          cleanSheets: '',
          yellowCards: '',
          redCards: '',
          // Basketball stats
          points: '',
          rebounds: '',
          steals: '',
          blocks: '',
          // Volleyball stats
          aces: '',
          digs: '',
          // Kabaddi stats
          raidPoints: '',
          tacklePoints: '',
          allOutPoints: '',
          superRaids: '',
          superTackles: '',
        });
        navigate('/pending-players');
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
    <div className="p-4 bg-gray-900 min-h-screen text-white">
      <div className="h-[4vh]"></div>
      <h2 className="text-3xl font-bold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Add New Player
      </h2>
      {error && (
        <p className="bg-red-800 text-white p-2 rounded text-sm flex items-center justify-center mb-4">
          <FaExclamationCircle className="mr-1" />
          {error}
        </p>
      )}
      {success && (
        <p className="bg-green-800 text-white p-2 rounded text-sm flex items-center justify-center mb-4">
          <FaCheckCircle className="mr-1" />
          {success}
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="bg-gray-800 shadow rounded-lg p-4 space-y-5 max-w-5xl mx-auto"
      >
        <section>
          <h3 className="text-xl font-medium mb-3 pb-2 border-b border-gray-700 text-purple-300">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative">
              <label className="block text-gray-300 text-xs font-medium mb-1">
                <FaUser className="inline-block mr-1 text-purple-400 text-xs" />
                Player Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="playerName"
                value={formData.playerName}
                onChange={handleChange}
                required
                placeholder="Enter player name"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-xs font-medium mb-1">
                <FaEnvelope className="inline-block mr-1 text-purple-400 text-xs" />
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-xs font-medium mb-1">
                <FaPhone className="inline-block mr-1 text-purple-400 text-xs" />
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-xs font-medium mb-1">
                <FaBirthdayCake className="inline-block mr-1 text-purple-400 text-xs" />
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="5"
                max="70"
                placeholder="Enter age"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-xs font-medium mb-1">
                <FaUserTie className="inline-block mr-1 text-purple-400 text-xs" />
                Sport <span className="text-red-500">*</span>
              </label>
              <select
                name="sport"
                value={formData.sport}
                onChange={handleSportChange}
                required
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors appearance-none"
              >
                <option value="cricket">Cricket</option>
                <option value="football">Football</option>
                <option value="basketball">Basketball</option>
                <option value="volleyball">Volleyball</option>
                <option value="kabaddi">Kabaddi</option>
              </select>
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-xs font-medium mb-1">
                <FaUserTie className="inline-block mr-1 text-purple-400 text-xs" />
                Player Role <span className="text-red-500">*</span>
              </label>
              <select
                name="playerRole"
                value={formData.playerRole}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors appearance-none"
              >
                {playerRoles.map((role) => (
                  <option key={role} value={role}>
                    {role.replace(/-/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            {/* Cricket specific fields */}
            {formData.sport === 'cricket' && (
              <>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaHandPaper className="inline-block mr-1 text-purple-400 text-xs" />
                    Batting Style <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="battingStyle"
                    value={formData.battingStyle}
                    onChange={handleChange}
                    required
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors appearance-none"
                  >
                    {battingStyles.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaBowlingBall className="inline-block mr-1 text-purple-400 text-xs" />
                    Bowling Style
                  </label>
                  <select
                    name="bowlingStyle"
                    value={formData.bowlingStyle}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors appearance-none"
                  >
                    {bowlingStyles.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* Football specific fields */}
            {formData.sport === 'football' && (
              <div className="relative">
                <label className="block text-gray-300 text-xs font-medium mb-1">
                  <FaHandPaper className="inline-block mr-1 text-purple-400 text-xs" />
                  Footedness <span className="text-red-500">*</span>
                </label>
                <select
                  name="footedness"
                  value={formData.footedness}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors appearance-none"
                >
                  {footednessOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Basketball specific fields */}
            {formData.sport === 'basketball' && (
              <>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaRuler className="inline-block mr-1 text-purple-400 text-xs" />
                    Height (cm) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    required
                    min="150"
                    max="250"
                    placeholder="Enter height in cm"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaRulerHorizontal className="inline-block mr-1 text-purple-400 text-xs" />
                    Wingspan (cm)
                  </label>
                  <input
                    type="number"
                    name="wingspan"
                    value={formData.wingspan}
                    onChange={handleChange}
                    min="150"
                    max="250"
                    placeholder="Enter wingspan in cm"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <label className="block text-gray-300 text-xs font-medium mb-1">
                <FaClock className="inline-block mr-1 text-purple-400 text-xs" />
                Playing Experience (years)
              </label>
              <input
                type="number"
                name="playingExperience"
                value={formData.playingExperience}
                onChange={handleChange}
                min="0"
                max="60"
                placeholder="Enter years of experience"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-xs font-medium mb-1">
                <FaGlobe className="inline-block mr-1 text-purple-400 text-xs" />
                Country <span className="text-red-500">*</span>
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors appearance-none"
              >
                <option value="" disabled>
                  Select country
                </option>
                <option value="India">India</option>
                <option value="China">China</option>
                <option value="USA">USA</option>
                <option value="Brazil">Brazil</option>
                <option value="Sri Lanka">Sri Lanka</option>
                <option value="Pakistan">Pakistan</option>
                <option value="Nepal">Nepal</option>
                <option value="Bangladesh">Bangladesh</option>
                <option value="Afghanistan">Afghanistan</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-medium mb-3 pb-2 border-b border-gray-700 text-purple-300">
            Contract & Description
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative">
              <label className="block text-gray-300 text-xs font-medium mb-1">
                <FaDollarSign className="inline-block mr-1 text-purple-400 text-xs" />
                Base Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                required
                min="1000000"
                max="20000000"
                placeholder="Enter base price"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative col-span-1 md:col-span-2">
              <label className="block text-gray-300 text-xs font-medium mb-1">
                <FaAlignLeft className="inline-block mr-1 text-purple-400 text-xs" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                placeholder="Enter description"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-xs font-medium mb-1">
                <FaCalendarAlt className="inline-block mr-1 text-purple-400 text-xs" />
                Contract End Date
              </label>
              <input
                type="date"
                name="contractEndDate"
                value={formData.contractEndDate}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-xs font-medium mb-1">
                <FaFileImage className="inline-block mr-1 text-purple-400 text-xs" />
                Profile Photo
              </label>
              <input
                type="file"
                name="profilePhoto"
                accept="image/*"
                onChange={handleChange}
                className="w-full text-white text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-purple-500 file:text-white hover:file:bg-purple-600"
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-medium mb-3 pb-2 border-b border-gray-700 text-purple-300">
            Performance Stats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="relative">
              <label className="block text-gray-300 text-xs font-medium mb-1">
                <FaListOl className="inline-block mr-1 text-purple-400 text-xs" />
                Matches
              </label>
              <input
                type="number"
                name="matches"
                value={formData.matches}
                onChange={handleChange}
                min="0"
                placeholder="Enter matches played"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
              />
            </div>

            {/* Cricket specific stats */}
            {formData.sport === 'cricket' && (
              <>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaRunning className="inline-block mr-1 text-purple-400 text-xs" />
                    Runs
                  </label>
                  <input
                    type="number"
                    name="runs"
                    value={formData.runs}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter total runs"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaMedal className="inline-block mr-1 text-purple-400 text-xs" />
                    Wickets
                  </label>
                  <input
                    type="number"
                    name="wickets"
                    value={formData.wickets}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter total wickets"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaChartLine className="inline-block mr-1 text-purple-400 text-xs" />
                    Average
                  </label>
                  <input
                    type="number"
                    name="average"
                    value={formData.average}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Enter batting average"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaTachometerAlt className="inline-block mr-1 text-purple-400 text-xs" />
                    Strike Rate
                  </label>
                  <input
                    type="number"
                    name="strikeRate"
                    value={formData.strikeRate}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Enter strike rate"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaBalanceScale className="inline-block mr-1 text-purple-400 text-xs" />
                    Economy
                  </label>
                  <input
                    type="number"
                    name="economy"
                    value={formData.economy}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="Enter economy rate"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
              </>
            )}

            {/* Football specific stats */}
            {formData.sport === 'football' && (
              <>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaFootballBall className="inline-block mr-1 text-purple-400 text-xs" />
                    Goals
                  </label>
                  <input
                    type="number"
                    name="goals"
                    value={formData.goals}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter total goals"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaHandPaper className="inline-block mr-1 text-purple-400 text-xs" />
                    Assists
                  </label>
                  <input
                    type="number"
                    name="assists"
                    value={formData.assists}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter total assists"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    Clean Sheets
                  </label>
                  <input
                    type="number"
                    name="cleanSheets"
                    value={formData.cleanSheets}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter clean sheets"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaSquare className="inline-block mr-1 text-yellow-400 text-xs" />
                    Yellow Cards
                  </label>
                  <input
                    type="number"
                    name="yellowCards"
                    value={formData.yellowCards}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter yellow cards"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaSquare className="inline-block mr-1 text-red-500 text-xs" />
                    Red Cards
                  </label>
                  <input
                    type="number"
                    name="redCards"
                    value={formData.redCards}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter red cards"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
              </>
            )}

            {/* Basketball specific stats */}
            {formData.sport === 'basketball' && (
              <>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaBasketballBall className="inline-block mr-1 text-purple-400 text-xs" />
                    Points
                  </label>
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter total points"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaHandPaper className="inline-block mr-1 text-purple-400 text-xs" />
                    Rebounds
                  </label>
                  <input
                    type="number"
                    name="rebounds"
                    value={formData.rebounds}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter total rebounds"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaHandPaper className="inline-block mr-1 text-purple-400 text-xs" />
                    Assists
                  </label>
                  <input
                    type="number"
                    name="assists"
                    value={formData.assists}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter total assists"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaHandPaper className="inline-block mr-1 text-purple-400 text-xs" />
                    Steals
                  </label>
                  <input
                    type="number"
                    name="steals"
                    value={formData.steals}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter total steals"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaHandPaper className="inline-block mr-1 text-purple-400 text-xs" />
                    Blocks
                  </label>
                  <input
                    type="number"
                    name="blocks"
                    value={formData.blocks}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter total blocks"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
              </>
            )}

            {/* Volleyball specific stats */}
            {formData.sport === 'volleyball' && (
              <>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaVolleyballBall className="inline-block mr-1 text-purple-400 text-xs" />
                    Points
                  </label>
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter total points"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaHandPaper className="inline-block mr-1 text-purple-400 text-xs" />
                    Aces
                  </label>
                  <input
                    type="number"
                    name="aces"
                    value={formData.aces}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter total aces"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaHandPaper className="inline-block mr-1 text-purple-400 text-xs" />
                    Blocks
                  </label>
                  <input
                    type="number"
                    name="blocks"
                    value={formData.blocks}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter total blocks"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaHandPaper className="inline-block mr-1 text-purple-400 text-xs" />
                    Digs
                  </label>
                  <input
                    type="number"
                    name="digs"
                    value={formData.digs}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter total digs"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaHandPaper className="inline-block mr-1 text-purple-400 text-xs" />
                    Assists
                  </label>
                  <input
                    type="number"
                    name="assists"
                    value={formData.assists}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter total assists"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
              </>
            )}

            {/* Kabaddi specific stats */}
            {formData.sport === 'kabaddi' && (
              <>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    Raid Points
                  </label>
                  <input
                    type="number"
                    name="raidPoints"
                    value={formData.raidPoints}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter total raid points"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaHandPaper className="inline-block mr-1 text-purple-400 text-xs" />
                    Tackle Points
                  </label>
                  <input
                    type="number"
                    name="tacklePoints"
                    value={formData.tacklePoints}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter total tackle points"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaUsers className="inline-block mr-1 text-purple-400 text-xs" />
                    All Out Points
                  </label>
                  <input
                    type="number"
                    name="allOutPoints"
                    value={formData.allOutPoints}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter all out points"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaRunning className="inline-block mr-1 text-purple-400 text-xs" />
                    Super Raids
                  </label>
                  <input
                    type="number"
                    name="superRaids"
                    value={formData.superRaids}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter super raids"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
                <div className="relative">
                  <label className="block text-gray-300 text-xs font-medium mb-1">
                    <FaHandPaper className="inline-block mr-1 text-purple-400 text-xs" />
                    Super Tackles
                  </label>
                  <input
                    type="number"
                    name="superTackles"
                    value={formData.superTackles}
                    onChange={handleChange}
                    min="0"
                    placeholder="Enter super tackles"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  />
                </div>
              </>
            )}
          </div>
        </section>

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2.5 rounded-md shadow-md hover:from-purple-700 hover:to-pink-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto text-sm h-10 min-h-[2.5rem] max-h-[2.5rem]"
          >
            {loading ? (
              <LoadingSpinner inButton />
            ) : (
              <>
                <FaUserPlus className="inline-block mr-1 text-white text-xs" />
                Add Player
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPlayer;
