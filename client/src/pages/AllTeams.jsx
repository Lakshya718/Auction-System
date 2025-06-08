import React, { useState, useEffect } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

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
    }, 100);
    setDebounceTimeout(timeout);
  };
  const handTeamClick = (teamId) => {
    navigate(`/teams/${teamId}`);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <div
        className="w-full max-w-4xl bg-white rounded shadow p-6 flex flex-col"
        style={{ height: "80vh" }}
      >
        {/* Topbar with search */}
        <h1 className="p-2 text-center text-white bg-pink-700 mb-3 rounded-sm">
          All Teams
        </h1>
        <div className="flex items-center mb-4 space-x-4 w-full">
          <input
            type="text"
            placeholder="team name"
            value={tempSearch}
            onChange={handleSearchChange}
            className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Teams container */}
        <div
          className="flex gap-4 overflow-x-auto"
          style={{ flexGrow: 1, minHeight: 0, whiteSpace: "nowrap" }}
        >
          {loading && <p>Loading teams...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && teams.length === 0 && <p>No teams found.</p>}
          {!loading &&
            teams.map((team) => (
              <div
                key={team._id}
                className="w-56 max-h-[38vh] hover:cursor-pointer hover:border-orange-500  hover:bg-blue-200 bg-white border border-gray-300 rounded shadow p-4 flex flex-col items-center"
                onClick={() => handTeamClick(team._id)}
              >
                <div className="w-28 h-28 mb-3">
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <h3 className="text-lg font-semibold">{team.name}</h3>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default AllTeams;
