import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../store/userSlice";

const LOCAL_STORAGE_KEY = "adminLiveBiddingSelectedPlayers";

const playerTypes = [
  "batsman",
  "batting all-rounder",
  "pace-bowler",
  "medium-pace-bowler",
  "spinner",
  "bowling all-rounder",
  "wicket-keeper",
];

const AdminLiveBidding = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState(new Set());
  const [currentBidding, setCurrentBidding] = useState(null);
  const [recentBuys, setRecentBuys] = useState([]);
  const [playersByType, setPlayersByType] = useState({});
  const userData = useSelector((state) => state.user);

  useEffect(() => {
    const fetchUserAndLiveBidding = async () => {
      try {
        // 1. Get token
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        // 2. Fetch profile
        const res = await axios.get("/auth/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const user = res.data.user;
        const role = user.role;
        const team = res.data.team || null;

        dispatch(setUser({ user, role, team }));

        // 3. Fetch role-based bidding data
        if (role === "admin") {
          const response = await axios.get("/biddings/live-bidding");
          setPlayers(response.data.players);
          setTeams(response.data.teams);
          setCurrentBidding(response.data.currentBidding);
        } else if (role === "team_owner") {
          const response = await axios.get("/team-owner/live-bidding");
          setCurrentBidding(response.data.currentBidding);
          setRecentBuys(response.data.recentBuys);
          setPlayersByType(response.data.playersByType);
        }

        // 4. Restore selected players from localStorage
        const savedSelected = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedSelected) {
          const parsed = JSON.parse(savedSelected);
          if (Array.isArray(parsed)) {
            setSelectedPlayerIds(new Set(parsed));
          }
        }
      } catch (error) {
        console.error("Error fetching user or live bidding data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndLiveBidding();
  }, [dispatch]);

  const handlePlayerCheckboxChange = (playerId) => {
    setSelectedPlayerIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const handleSendPlayer = (playerId) => {
    console.log("Send Player clicked for player ID:", playerId);
    // TODO: Implement backend call
  };

  const handleBid = () => {
    console.log("Bid button clicked");
    // TODO: Implement bid logic
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-live-bidding-wrapper">
      {/* ADMIN VIEW */}
      {userData.role === "admin" && (
        <div className="flex flex-col max-w-7xl mx-auto gap-5 p-5">
          {/* Current Bidding */}
          <div className="border border-gray-300 p-4 rounded">
            <h2 className="text-xl font-semibold mb-3">Current Bidding</h2>
            {currentBidding ? (
              <div className="flex items-center gap-4">
                <img
                  src={currentBidding.profilePhoto || "/default-player.png"}
                  alt={currentBidding.name}
                  className="w-15 h-15 rounded-full object-cover"
                />
                <div>
                  <div>{currentBidding.name}</div>
                  <div>Base Price: ${currentBidding.basePrice}</div>
                  <div>
                    Current Bid Team: {currentBidding.currentBidTeam || "N/A"}
                  </div>
                  <div>Current Bid Price: ${currentBidding.currentBidPrice}</div>
                </div>
              </div>
            ) : (
              <div>No current bidding</div>
            )}
          </div>

          {/* Player List */}
          <div className="border border-gray-300 p-4 rounded">
            <h2 className="text-3xl text-center mb-4">Players</h2>
            {players.map((player) => (
              <div
                key={player._id}
                className="flex justify-around items-center mb-2 pl-5 border-2 border-red-200 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedPlayerIds.has(player._id)}
                  onChange={() => handlePlayerCheckboxChange(player._id)}
                  className="hover:cursor-pointer"
                />
                <img
                  src={player.profilePhoto || "/default-player.png"}
                  alt={player.name}
                  className="w-24 h-32 rounded-full mr-4 object-contain"
                />
                <div>
                  <div>{player.playerName}</div>
                  <div className="text-2xl text-gray-400">
                    Base Price: ${player.basePrice}
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => handleSendPlayer(player._id)}
                    disabled={selectedPlayerIds.has(player._id)}
                    className={`rounded-lg w-60 py-2 px-4 ${
                      selectedPlayerIds.has(player._id)
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-green-500 hover:text-white"
                    }`}
                  >
                    Send Player
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Team List */}
          <div className="border border-gray-300 p-4 rounded">
            <h2 className="text-xl font-semibold mb-3">Teams</h2>
            {teams.map((team) => (
              <div key={team._id} className="flex items-center mb-3">
                <img
                  src={team.photo || "/default-team.png"}
                  alt={team.name}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <div>
                  <div>{team.name}</div>
                  <div>Purse Remaining: ${team.purseRemaining}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TEAM OWNER VIEW */}
      {userData.role === "team_owner" && (
        <div className="p-5 flex flex-col">
          <div className="border border-gray-300 p-4 mb-5 rounded">
            {currentBidding ? (
              <div className="flex items-center gap-4">
                <img
                  src={currentBidding.profilePhoto || "/default-player.png"}
                  alt={currentBidding.name}
                  className="w-15 h-15 rounded-full object-cover"
                />
                <div>
                  <div>{currentBidding.name}</div>
                  <div>Base Price: ${currentBidding.basePrice}</div>
                  <div>Current Bid: ${currentBidding.currentBidPrice}</div>
                  <button
                    onClick={handleBid}
                    className="mt-2 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Bid
                  </button>
                </div>
              </div>
            ) : (
              <div>No current bidding</div>
            )}
          </div>

          <div className="flex gap-5 flex-col">
            <div className="border border-gray-300 p-4 rounded">
              <h3 className="text-lg font-semibold mb-3">Recent Buys</h3>
              {recentBuys.length > 0 ? (
                recentBuys.map((player) => (
                  <div key={player._id} className="flex items-center mb-3">
                    <img
                      src={player.photo || "/default-player.png"}
                      alt={player.name}
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <div>{player.name}</div>
                      <div>Price: ${player.price}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div>No recent buys</div>
              )}
            </div>

            <div className="flex gap-3">
              {playerTypes.map((type) => (
                <div key={type} className="flex-1 border border-gray-300 p-4 rounded">
                  <h4 className="font-semibold mb-3">{type}</h4>
                  {playersByType[type] && playersByType[type].length > 0 ? (
                    playersByType[type].map((player) => (
                      <div key={player._id} className="flex items-center mb-3">
                        <img
                          src={player.photo || "/default-player.png"}
                          alt={player.name}
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                        <div>
                          <div>{player.name}</div>
                          <div>Price: ${player.price}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div>No players</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLiveBidding;
