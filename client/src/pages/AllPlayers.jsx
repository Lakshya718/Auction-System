import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios";

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
      const response = await API.get("/players/all", { params });
      if (Array.isArray(response.data)) {
        setPlayers(response.data);
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
    }, 100);
    setDebounceTimeout(timeout);
  };

  const handlePlayerClick = (playerId) => {
    navigate(`/players/${playerId}`);
  };

  return (
    <div className="p-4 space-y-4 max-w-[80vw] mx-auto">
      <div className="">
        <h2 className="text-3xl font-bold mb-6 text-center">All Players</h2>
        <div className="flex items-center mb-4 space-x-4 w-full">
          <input
            type="text"
            placeholder="player name"
            value={tempSearch}
            onChange={handleSearchChange}
            className="flex-grow border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {error &&<p className="text-red-600">{error}</p>}
          {!loading && players.length === 0 && <p>No player found.</p>}
          {!loading && players.map((player) => (
            <div
              key={player._id}
              className="cursor-pointer border max-w-[25vw] max-h-[50vh] border-gray-300 rounded p-4 shadow hover:shadow-lg transition"
              onClick={() => handlePlayerClick(player._id)}
            >
              <img
                src={player.profilePhoto || "/default-profile.png"}
                alt={player.name}
                className="w-full h-48 object-contain rounded mb-2"
              />
              <h3 className="text-xl font-semibold">{player.playerName}</h3>
              <p>Age: {player.age}</p>
              <p>Role: {player.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllPlayers;
