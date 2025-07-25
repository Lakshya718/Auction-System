import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { FaSearch, FaTimes, FaUsers, FaExclamationCircle } from 'react-icons/fa';

const AllTeams = () => {
  const [search, setSearch] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (search.trim() !== "") {
          params.search = search.trim();
        }
        const response = await API.get("/teams/all-teams", { params });
        if (Array.isArray(response.data)) {
          setTeams(response.data);
        } else {
          setTeams([]);
          setError("Invalid data format received from server");
        }
      } catch {
        setError("Failed to fetch teams");
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [search]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setTempSearch(value);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const timeout = setTimeout(() => {
      setSearch(value);
    }, 300); // Debounce for 300ms
    setDebounceTimeout(timeout);
  };

  const clearSearch = () => {
    setTempSearch("");
    setSearch("");
  };

  const handTeamClick = (teamId) => {
    navigate(`/teams/${teamId}`);
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <h1 className="text-4xl font-extrabold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        <FaUsers className="inline-block mr-3" />All Teams
      </h1>

      <div className="flex items-center justify-center mb-8">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search team name..."
            value={tempSearch}
            onChange={handleSearchChange}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
          />
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          {tempSearch && (
            <button
              onClick={clearSearch}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-center text-red-500 text-lg font-semibold flex items-center justify-center gap-2"><FaExclamationCircle /> {error}</p>
      ) : teams.length === 0 ? (
        <p className="text-center text-gray-400 text-xl">No teams found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {teams.map((team) => (
            <div
              key={team._id}
              className="bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col items-center cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-2xl border border-gray-700"
              onClick={() => handTeamClick(team._id)}
            >
              <div className="w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-purple-500/50">
                <img
                  src={team.logo || 'https://via.placeholder.com/150/6B46C1/FFFFFF?text=Team'}
                  alt={team.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                {team.name}
              </h3>
              {team.description && (
                <p className="text-gray-400 text-center text-sm">
                  {team.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllTeams;