import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";
import LoadingSpinner from "../components/LoadingSpinner";

const AllPlayers = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tempSearch, setTempSearch] = useState("");
  const [search, setSearch] = useState("");
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchPlayers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search.trim() !== "") {
        params.search = search.trim();
      }
      const response = await API.get("/players/verified", { params });
      if (Array.isArray(response.data.players)) {
        setPlayers(response.data.players);
      } else {
        setPlayers([]);
        setError("Invalid data format received from server");
      }
    } catch {
      setError("Failed to fetch Players");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
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

  const handlePlayerClick = (playerId) => {
    navigate(`/players/${playerId}`);
  };

  return (
    <div className="p-4 space-y-6 max-w-[90vw] mx-auto">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-blue-700">All Players</h2>
      <div className="flex items-center mb-6 space-x-3 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search player name"
          value={tempSearch}
          onChange={handleSearchChange}
          className="flex-grow border border-gray-300 rounded-l-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {tempSearch && (
          <button
            onClick={clearSearch}
            className="bg-blue-500 text-white px-4 py-3 rounded-r-md hover:bg-blue-600 transition"
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-center text-red-600 text-lg font-semibold">{error}</p>
      ) : players.length === 0 ? (
        <p className="text-center text-gray-600 text-lg font-medium">No players found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {players.map((player) => (
            <div
              key={player._id}
              className="cursor-pointer border w-full border-gray-300 rounded-lg p-5 shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300 max-w-[25vw] mx-auto"
              onClick={() => handlePlayerClick(player._id)}
            >
              <img
                src={
                  player.profilePhoto ||
                  "https://media.istockphoto.com/id/1961226379/vector/cricket-player-playing-short-concept.jpg?s=612x612&w=0&k=20&c=CSiQd4qzLY-MB5o_anUOnwjIqxm7pP8aus-Lx74AQus="
                }
                alt={player.playerName}
                className="w-full h-48 object-contain rounded-md mb-4"
              />
              <h3 className="text-2xl font-bold text-blue-800 mb-2">{player.playerName}</h3>
              <p className="text-gray-700 mb-1">Age: {player.age}</p>
              <p className="text-gray-700">Role: {player.playerRole}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllPlayers;
