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
} from "react-icons/fa";

const AddPlayer = () => {
  const [formData, setFormData] = useState({
    playerName: "p9",
    email: "p9@gmail.com",
    phone: "1",
    age: "24",
    playerRole: "batsman",
    battingStyle: "right-handed",
    bowlingStyle: "none",
    playingExperience: "7",
    country: "India",
    basePrice: "12345678",
    description: "null",
    contractEndDate: "",
    profilePhoto: null,
    matches: "15",
    runs: "500",
    wickets: "2",
    average: "100",
    strikeRate: "120",
    economy: "8.1",
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
    <div className="max-w-[90vw] mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Add Player</h2>
      {error && (
        <p className="text-red-600 mb-4 flex items-center justify-center">
          <FaUser className="w-5 h-5 mr-2 inline-block" />
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-600 mb-4 flex items-center justify-center">
          <FaUser className="w-5 h-5 mr-2 inline-block" />
          {success}
        </p>
      )}
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="bg-white shadow-md rounded-lg p-6 space-y-6 max-w-4xl mx-auto"
      >
        <section>
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaUser className="text-gray-400" />
                Player Name *
              </label>
              <input
                type="text"
                name="playerName"
                value={formData.playerName}
                onChange={handleChange}
                required
                placeholder="Enter player name"
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaEnvelope className="text-gray-400" />
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaPhone className="text-gray-400" />
                Phone *
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaBirthdayCake className="text-gray-400" />
                Age *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="0"
                placeholder="Enter age"
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaUserTie className="text-gray-400" />
                Player Role *
              </label>
              <select
                name="playerRole"
                value={formData.playerRole}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {playerRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaHandPaper className="text-gray-400" />
                Batting Style *
              </label>
              <select
                name="battingStyle"
                value={formData.battingStyle}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {battingStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaBowlingBall className="text-gray-400" />
                Bowling Style
              </label>
              <select
                name="bowlingStyle"
                value={formData.bowlingStyle}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {bowlingStyles.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaClock className="text-gray-400" />
                Playing Experience (years)
              </label>
              <input
                type="number"
                name="playingExperience"
                value={formData.playingExperience}
                onChange={handleChange}
                min="0"
                placeholder="Enter years of experience"
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaGlobe className="text-gray-400" />
                Country *
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                placeholder="Enter country"
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">
            Contract & Description
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaDollarSign className="text-gray-400" />
                Base Price *
              </label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                required
                min="0"
                placeholder="Enter base price"
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaAlignLeft className="text-gray-400" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                placeholder="Enter description"
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400" />
                Contract End Date
              </label>
              <input
                type="date"
                name="contractEndDate"
                value={formData.contractEndDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaFileImage className="text-gray-400" />
                Profile Photo
              </label>
              <input
                type="file"
                name="profilePhoto"
                accept="image/*"
                onChange={handleChange}
                className="w-full pl-10"
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">
            Performance Stats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaListOl className="text-gray-400" />
                Matches
              </label>
              <input
                type="number"
                name="matches"
                value={formData.matches}
                onChange={handleChange}
                min="0"
                placeholder="Enter matches played"
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaRunning className="text-gray-400" />
                Runs
              </label>
              <input
                type="number"
                name="runs"
                value={formData.runs}
                onChange={handleChange}
                min="0"
                placeholder="Enter runs scored"
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaMedal className="text-gray-400" />
                Wickets
              </label>
              <input
                type="number"
                name="wickets"
                value={formData.wickets}
                onChange={handleChange}
                min="0"
                placeholder="Enter wickets taken"
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaChartLine className="text-gray-400" />
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
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaTachometerAlt className="text-gray-400" />
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
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <label className=" font-semibold mb-1 flex items-center gap-2">
                <FaBalanceScale className="text-gray-400" />
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
                className="w-full border border-gray-300 rounded px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </section>

        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Adding...
              </>
            ) : (
              "Add Player"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPlayer;
