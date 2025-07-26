import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
} from "react-icons/fa";
import LoadingSpinner from "../components/LoadingSpinner";

const AddPlayer = () => {
  const [formData, setFormData] = useState({
    playerName: "",
    email: "",
    phone: "",
    age: "",
    playerRole: "batsman",
    battingStyle: "right-handed",
    bowlingStyle: "none",
    playingExperience: "",
    country: "",
    basePrice: "",
    description: "",
    contractEndDate: "",
    profilePhoto: null,
    matches: "",
    runs: "",
    wickets: "",
    average: "",
    strikeRate: "",
    economy: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const playerRoles = [
    "batsman",
    "pace-bowler",
    "medium-pace-bowler",
    "spinner",
    "batting all-rounder",
    "bowling all-rounder",
    "wicket-keeper",
  ];

  const battingStyles = ["right-handed", "left-handed"];

  const bowlingStyles = [
    "right-arm-fast",
    "right-arm-medium",
    "right-arm-off-spin",
    "left-arm-fast",
    "left-arm-medium",
    "left-arm-spin",
    "none",
  ];

  const role = useSelector((state) => state.user.role);
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== "admin") {
      navigate("/"); // Redirect non-admin users to home or login page
    }
  }, [role, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePhoto") {
      setFormData({ ...formData, profilePhoto: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (formData.phone.length !== 10) {
      setLoading(false);
      setError("Phone number must be exactly 10 digits.");
      return;
    }
    const ageNum = Number(formData.age);
    if (ageNum < 5 || ageNum > 70) {
      setLoading(false);
      setError("Age must be between 5 and 70.");
      return;
    }
    const playingExpNum = Number(formData.playingExperience);
    if (playingExpNum < 0 || playingExpNum > 60) {
      setLoading(false);
      setError("Playing experience must be between 0 and 60.");
      return;
    }
    const basePriceNum = Number(formData.basePrice);
    if (basePriceNum < 1000000 || basePriceNum > 20000000) {
      setLoading(false);
      setError("Base price must be between 1,000,000 and 20,000,000.");
      return;
    }
    const allowedCountries = [
      "India",
      "China",
      "USA",
      "Brazil",
      "Sri Lanka",
      "Pakistan",
      "Nepal",
      "Bangladesh",
      "Afghanistan",
    ];
    if (!allowedCountries.includes(formData.country)) {
      setLoading(false);
      setError("Country must be one of the allowed options.");
      return;
    }

    try {
      const data = new FormData();
      for (const key in formData) {
        if (formData[key] !== null && formData[key] !== "") {
          data.append(key, formData[key]);
        }
      }

      if (formData.contractEndDate) {
        data.set(
          "contractEndDate",
          new Date(formData.contractEndDate).toISOString()
        );
      }

      [
        "age",
        "playingExperience",
        "basePrice",
        "matches",
        "runs",
        "wickets",
        "average",
        "strikeRate",
        "economy",
      ].forEach((field) => {
        if (formData[field]) {
          data.set(field, Number(formData[field]));
        }
      });

      const response = await API.post("/players/registration-request", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        setSuccess("Player added successfully!");
        setFormData({
          playerName: "",
          email: "",
          phone: "",
          age: "",
          playerRole: "batsman",
          battingStyle: "right-handed",
          bowlingStyle: "none",
          playingExperience: "",
          country: "",
          basePrice: "",
          description: "",
          contractEndDate: "",
          profilePhoto: null,
          matches: "",
          runs: "",
          wickets: "",
          average: "",
          strikeRate: "",
          economy: "",
        });
        navigate("/pending-players"); 
      } else {
        setError("Failed to add player.");
      }
    } catch (error) {
      setError(error.response?.data?.error || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        Add New Player
      </h2>
      {error && (
        <p className="bg-red-800 text-white p-3 rounded-lg flex items-center justify-center mb-6">
          <FaExclamationCircle className="mr-2" />
          {error}
        </p>
      )}
      {success && (
        <p className="bg-green-800 text-white p-3 rounded-lg flex items-center justify-center mb-6">
          <FaCheckCircle className="mr-2" />
          {success}
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="bg-gray-800 shadow-xl rounded-2xl p-8 space-y-8 max-w-6xl mx-auto"
      >
        <section>
          <h3 className="text-2xl font-semibold mb-6 pb-3 border-b border-gray-700 text-purple-300">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaUser className="inline-block mr-2 text-purple-400" />
                Player Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="playerName"
                value={formData.playerName}
                onChange={handleChange}
                required
                placeholder="Enter player name"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaEnvelope className="inline-block mr-2 text-purple-400" />
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaPhone className="inline-block mr-2 text-purple-400" />
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaBirthdayCake className="inline-block mr-2 text-purple-400" />
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
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaUserTie className="inline-block mr-2 text-purple-400" />
                Player Role <span className="text-red-500">*</span>
              </label>
              <select
                name="playerRole"
                value={formData.playerRole}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors appearance-none"
              >
                {playerRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaHandPaper className="inline-block mr-2 text-purple-400" />
                Batting Style <span className="text-red-500">*</span>
              </label>
              <select
                name="battingStyle"
                value={formData.battingStyle}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors appearance-none"
              >
                {battingStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaBowlingBall className="inline-block mr-2 text-purple-400" />
                Bowling Style
              </label>
              <select
                name="bowlingStyle"
                value={formData.bowlingStyle}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors appearance-none"
              >
                {bowlingStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaClock className="inline-block mr-2 text-purple-400" />
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
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaGlobe className="inline-block mr-2 text-purple-400" />
                Country <span className="text-red-500">*</span>
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors appearance-none"
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
          <h3 className="text-2xl font-semibold mb-6 pb-3 border-b border-gray-700 text-purple-300">
            Contract & Description
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaDollarSign className="inline-block mr-2 text-purple-400" />
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
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative col-span-1 md:col-span-2">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaAlignLeft className="inline-block mr-2 text-purple-400" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Enter description"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaCalendarAlt className="inline-block mr-2 text-purple-400" />
                Contract End Date
              </label>
              <input
                type="date"
                name="contractEndDate"
                value={formData.contractEndDate}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaFileImage className="inline-block mr-2 text-purple-400" />
                Profile Photo
              </label>
              <input
                type="file"
                name="profilePhoto"
                accept="image/*"
                onChange={handleChange}
                className="w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600"
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-2xl font-semibold mb-6 pb-3 border-b border-gray-700 text-purple-300">
            Performance Stats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="relative">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaListOl className="inline-block mr-2 text-purple-400" />
                Matches
              </label>
              <input
                type="number"
                name="matches"
                value={formData.matches}
                onChange={handleChange}
                min="0"
                placeholder="Enter matches played"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaRunning className="inline-block mr-2 text-purple-400" />
                Runs
              </label>
              <input
                type="number"
                name="runs"
                value={formData.runs}
                onChange={handleChange}
                min="0"
                placeholder="Enter runs scored"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaMedal className="inline-block mr-2 text-purple-400" />
                Wickets
              </label>
              <input
                type="number"
                name="wickets"
                value={formData.wickets}
                onChange={handleChange}
                min="0"
                placeholder="Enter wickets taken"
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaChartLine className="inline-block mr-2 text-purple-400" />
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
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaTachometerAlt className="inline-block mr-2 text-purple-400" />
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
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
            <div className="relative">
              <label className="block text-gray-300 text-sm font-bold mb-2">
                <FaBalanceScale className="inline-block mr-2 text-purple-400" />
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
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              />
            </div>
          </div>
        </section>

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="mt-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <FaUserPlus className="inline-block mr-2 text-purple-400" />
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