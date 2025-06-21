import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

const AllTeams = () => {
  const [search, setSearch] = useState("");
  const [tempSearch, setTempSearch] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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

  useEffect(() => {
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
    }, 80);
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
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div
        className="w-full max-w-6xl bg-white rounded shadow p-6 flex flex-col"
        style={{ minHeight: "80vh" }}
      >
        {/* Topbar with search */}
        <h1 className="p-4 text-center text-white bg-pink-700 mb-6 rounded-sm text-2xl font-bold">
          All Teams
        </h1>
        <div className="flex items-center mb-6 space-x-4 w-full max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search team name"
            value={tempSearch}
            onChange={handleSearchChange}
            className="flex-grow border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          {tempSearch && (
            <button
              onClick={clearSearch}
              className="text-gray-500 hover:text-gray-700 transition"
              aria-label="Clear search"
            >
              &#x2715;
            </button>
          )}
        </div>

        {/* Teams container */}
        <div className="flex-grow overflow-y-auto">
          {loading && (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner />
            </div>
          )}
          {error && <p className="text-red-600 text-center">{error}</p>}
          {!loading && teams.length === 0 && (
            <p className="text-center text-gray-600">No teams found.</p>
          )}
          {!loading && teams.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {teams.map((team) => (
                <div
                  key={team._id}
                  className="bg-white border border-gray-300 rounded-lg shadow-md p-4 flex flex-col items-center cursor-pointer transform transition duration-300 hover:scale-105 hover:shadow-lg"
                  onClick={() => handTeamClick(team._id)}
                >
                  <div className="w-32 h-32 mb-4">
                    <img
                      src={team.logo}
                      alt={team.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-center">
                    {team.name}
                  </h3>
                  {team.description && (
                    <p className="text-gray-600 text-center text-sm">
                      {team.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllTeams;
