import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import API from "../../api/axios";
import { useParams } from "react-router-dom";

const AuctionBidPage = () => {
  const { auctionId } = useParams();
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [minBidIncrement, setMinBidIncrement] = useState(500000);
  // Removed unused bidAmounts and setBidAmounts to fix eslint error
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [teamId, setTeamId] = useState("");
  const [token, setToken] = useState("");
  const [teamOwnerPlayer, setTeamOwnerPlayer] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [isSelling, setIsSelling] = useState(false);
  const role = useSelector((state) => state.user.role);
  const initialized = useSelector((state) => state.user.initialized);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role && token && initialized) {
      setLoading(false);
    }
  }, [role, token, initialized]);

  const playersRef = useRef(players);
  playersRef.current = players;

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  // New useEffect to read playerId from localStorage on mount
  useEffect(() => {
    const storedPlayerId = localStorage.getItem("playerId");
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    }
  }, []);

  useEffect(() => {
    if (!auctionId || !token) return;

    const backendUrl = "http://localhost:5000";

    const newSocket = io(backendUrl, {
      auth: { token },
      transports: ["websocket"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setConnected(true);
      newSocket.emit("join-auction", { auctionId });
    });

    newSocket.on("joined-auction", (data) => {
      setMessages((msgs) => [...msgs, `Joined auction: ${data.message}`]);
    });

    newSocket.on("bid-placed", (bid) => {
      setMessages((msgs) => [
        ...msgs,
        `Bid placed: ${bid.teamName} bid ${bid.amount} for ${bid.playerName}`,
      ]);
      setPlayers((prevPlayers) => {
        return prevPlayers.map((player) => {
          if (player.player._id === bid.playerId) {
            return {
              ...player,
              currentBid: bid.amount,
              currentHighestBidder: bid.teamId,
              biddingHistory: player.biddingHistory
                ? [...player.biddingHistory, bid]
                : [bid],
            };
          }
          return player;
        });
      });
    });

    // Listen for bidUpdate event to update current bid in real-time
    newSocket.on("bidUpdate", (update) => {
      setPlayers((prevPlayers) => {
        return prevPlayers.map((player) => {
          if (player.player._id === update.playerId) {
            return {
              ...player,
              currentBid: update.currentBid,
              currentHighestBidder: update.lastBidder,
            };
          }
          return player;
        });
      });
      // If the updated player is the teamOwnerPlayer, update its currentBid as well
      if (teamOwnerPlayer && teamOwnerPlayer._id === update.playerId) {
        setTeamOwnerPlayer((prev) => ({
          ...prev,
          currentBid: update.currentBid,
          currentTeam: update.lastBidder,
        }));
      }
    });

    newSocket.on("error", (error) => {
      setMessages((msgs) => [...msgs, `Error: ${error.message || error}`]);
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
      setMessages((msgs) => [...msgs, "Disconnected from server"]);
    });

    // Listen for refresh-player-data event to fetch fresh player data from Redis
    newSocket.on("refresh-player-data", async ({ playerId }) => {
      console.log("Received refresh-player-data event for playerId:", playerId);
      if (!playerId || !token) {
        console.log("Missing playerId or token, skipping fetch");
        return;
      }
      try {
        const url = `/players/redis/player/${playerId}`;
        console.log("Fetching fresh player data from:", url);
        const response = await API.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success && response.data.player) {
          setTeamOwnerPlayer(response.data.player);
          setMessages((msgs) => [...msgs, `Player data refreshed for playerId: ${playerId}`]);
          console.log("Player data updated in state for playerId:", playerId);
        } else {
          console.log("Failed to fetch player data or no player data returned");
        }
      } catch (error) {
        setMessages((msgs) => [
          ...msgs,
          `Error refreshing player data: ${error.message}`,
        ]);
        console.error("Error fetching fresh player data:", error);
      }
    });

    // Listen for user-joined event to show when a team_owner joins
    const roleRef = { current: role };
    newSocket.on("user-joined", (data) => {
      if (roleRef.current === "admin") {
        setMessages((msgs) => [...msgs, `Team owner joined: ${data.email}`]);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [auctionId, token]); // Removed teamOwnerPlayer to prevent socket reconnect on player state change

  // Fetch auction data from backend API
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await API.get(`/auctions/${auctionId}`);
        // auction data is in data.auction
        const filteredPlayers = (response.data.auction.players || []).filter(
          (player) =>
            player.status === "available" || player.status === "unsold"
        );
        setPlayers(filteredPlayers);
        setTeams(response.data.auction.teams || []);
        setMinBidIncrement(response.data.auction.minBidIncrement || 500000);
        // Set default teamId to first team if available
        if (
          response.data.auction.teams &&
          response.data.auction.teams.length > 0
        ) {
          setTeamId(
            response.data.auction.teams[0]._id || response.data.auction.teams[0]
          );
        }
      } catch (error) {
        setMessages((msgs) => [
          ...msgs,
          `Error fetching auction data: ${error.message}`,
        ]);
      }
    };
    fetchAuction();
  }, [auctionId]);

  // On mount, fetch current player from Redis for team_owner to persist view on reload
  useEffect(() => {
    const fetchCurrentPlayer = async () => {
      const playerId = localStorage.getItem('playerId');
      if (playerId && token) {
        try {
          const url = `/players/redis/player/${playerId}`;
          const response = await API.get(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("after request get ", url);
          if (response.data.success && response.data.player) {
            setTeamOwnerPlayer(response.data.player);
          }
        } catch (error) {
          setMessages((msgs) => [
            ...msgs,
            `Error fetching current player: ${error.message}`,
          ]);
        }
      }
    };
    fetchCurrentPlayer();
  }, [role, token, playerId]);

  // Handler to send player details to Redis and update team owner view
  const handleSendPlayer = async (player) => {
    try {
      const response = await API.post("/players/redis/player", player, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setMessages((msgs) => [
          ...msgs,
          `Player sent ${player.playerName} and stored in Redis`,
        ]);
        // Store playerId in localStorage
        localStorage.setItem("playerId", player._id);
        // Emit socket event to notify other clients
        // Fetch player from Redis to update team owner view
        const fetchResponse = await API.get(
          `/players/redis/player/${player._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (fetchResponse.data.success) {
          setTeamOwnerPlayer(fetchResponse.data.player);
        }
        if (socket) {
          socket.emit("send-player", { auctionId, player });
        }
      }
    } catch (error) {
      setMessages((msgs) => [
        ...msgs,
        `Error sending player: ${error.message}`,
      ]);
    }
  };

  // Listen for player-sent event to update team owner view
  useEffect(() => {
    if (!socket) return;

    const handlePlayerSent = (data) => {
      if (role === "team_owner") {
        setPlayerId(data.player._id);
        // Store playerId in localStorage
        localStorage.setItem("playerId", data.player._id);
        setMessages((msgs) => [
          ...msgs,
          `Player sent: ${data.player.playerName}`,
        ]);
      }
    };

    socket.on("player-sent", handlePlayerSent);

    return () => {
      socket.off("player-sent", handlePlayerSent);
    };
  }, [socket, role]);

  useEffect(() => {
    if (!socket) return;

    const handlePlayerCacheCleared = (data) => {
      console.log("player-cache-cleared event received for role:", role, "with playerId:", data.playerId);
      setMessages((msgs) => [...msgs, `Player cache cleared for id: ${data.playerId}`]);
      localStorage.removeItem("playerId");
      setPlayerId(null);
      setTeamOwnerPlayer(null);
    };

    socket.on("player-cache-cleared", handlePlayerCacheCleared);

    return () => {
      socket.off("player-cache-cleared", handlePlayerCacheCleared);
    };
  }, [socket, role]);
  
  useEffect(() => {
    const fetchCurrentPlayer = async () => {
      if (!playerId || !token) {
        setTeamOwnerPlayer(null);
        return;
      }
      try {
        const url = `/players/redis/player/${playerId}`;
        const response = await API.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("after request get ", url);
        if (response.data.success && response.data.player) {
          setTeamOwnerPlayer(response.data.player);
        }
      } catch (error) {
        setMessages((msgs) => [
          ...msgs,
          `Error fetching current player: ${error.message}`,
        ]);
      }
    };
    fetchCurrentPlayer();
  }, [role, token, playerId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  const handleDeletePlayerFromRedis = async (idofplayer) => {
    if (!idofplayer) {
      setMessages((msgs) => [...msgs, "No player selected to clear cache"]);
      return;
    }
    try {
      // Proceed to delete if player exists
      const response = await API.delete(`/players/redis/player/${idofplayer}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("handleDeletePlayer function logs", response);
      setMessages((msgs) => [...msgs, `Player cache removed for id: ${idofplayer}`]);
      // Clear localStorage playerId and teamOwnerPlayer state
      localStorage.removeItem("playerId");
      setPlayerId(null);
      setTeamOwnerPlayer(null);
      // Emit socket event to notify other clients about cache clear
      if (socket) {
        socket.emit("player-cache-cleared", { playerId: idofplayer });
      }
    } catch (error) {
      console.log("Error in deleting player from Redis", error);
      setMessages((msgs) => [...msgs, `Error deleting player cache: ${error.message}`]);
    }
  };

  return (
    <div className="auction-bid-page p-4">
      <h2>Auction Bidding</h2>
      <p>Status: {connected ? "Connected" : "Disconnected"}</p>

      {role === "admin" && (
        <>
          <div className="players-list border-2 border-red-500 p-4">
            <div className="text-2xl md:text-3xl text-center mb-4">
              All Players Available (Admin)
            </div>

            {players.length === 0 && <p>No players available</p>}

            {players.map((player) => (
              <div
                key={player.player._id}
                className="flex flex-col md:flex-row md:items-center md:justify-around gap-4 player-card border p-4 mb-4"
              >
                {/* Player Info */}
                <div className="text-center md:text-left">
                  <h3 className="font-semibold">
                    {player.player.playerName || "Unnamed Player"}
                  </h3>
                  <p>BasePrice: {player.player.basePrice}</p>
                </div>

                {/* Send Button */}
                <button
                  className="text-white bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 self-center md:self-auto"
                  onClick={() => handleSendPlayer(player.player)}
                >
                  Send Player
                </button>

                {/* Bidding History (if available) */}
                {player.biddingHistory && player.biddingHistory.length > 0 && (
                  <div className="bidding-history border-t pt-2 md:border-0 md:pt-0">
                    <h4 className="font-medium">Bidding History:</h4>
                    <ul className="text-sm list-disc ml-4">
                      {player.biddingHistory.map((bid, index) => (
                        <li key={index}>
                          {bid.teamName || bid.team} bid {bid.amount} at{" "}
                          {new Date(bid.timestamp).toLocaleTimeString()}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* New Admin Section to delete player from Redis */}
          <div className="border-2 border-blue-500 p-4 mt-6">
            <h3 className="text-2xl mb-4">Delete Player from Redis Cache</h3>
            <input
              type="text"
              placeholder="Enter Player ID"
              value={playerId || ""}
              onChange={(e) => setPlayerId(e.target.value)}
              className="border border-gray-400 p-2 rounded w-full mb-4"
            />
            <button
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              onClick={async () => {
                if (!playerId) {
                  setMessages((msgs) => [
                    ...msgs,
                    "Please enter a Player ID to delete from Redis",
                  ]);
                  return;
                }
                try {
                  await API.delete(`/players/redis/player/${playerId}`);
                  setMessages((msgs) => [
                    ...msgs,
                    `Player with ID ${playerId} deleted from Redis cache`,
                  ]);
                  setPlayerId("");
                } catch (error) {
                  setMessages((msgs) => [
                    ...msgs,
                    `Error deleting player from Redis: ${error.message}`,
                  ]);
                }
              }}
            >
              Delete Player from Redis
            </button>
          </div>
        </>
      )}

      <div className="players-list border-2 border-red-500 p-4">
        <h3 className="text-3xl text-center mb-4">Team Owner View</h3>

        {/* Responsive Flexbox */}
        <div className="flex flex-col md:flex-row justify-between border-2 border-yellow-600 md:h-64 gap-4">
          {/* Left: Circle */}
          <div className="w-full md:w-[20%] flex items-center justify-center border-2 border-red-600">
            <div className="w-32 h-32 rounded-full border-2 border-red-500"></div>
          </div>

          {/* Right: Player Info */}
          <div className="w-full md:w-[80%]">
            {teamOwnerPlayer ? (
              <div className="player-card border p-2">
                <h3>{teamOwnerPlayer.playerName || "Unnamed Player"}</h3>
                <p>BasePrice: {teamOwnerPlayer.basePrice}</p>
                <p>Current Bid: {teamOwnerPlayer.currentBid}</p>
                <p>Current Team: {teamOwnerPlayer.currentTeam}</p>
                <p>Role: {teamOwnerPlayer.playerRole}</p>

                {role !== "admin" &&
                  (teamOwnerPlayer.soldStatus === true ? (
                    <p className="text-red-600 font-bold">
                      Player is sold already
                    </p>
                  ) : (
                    <button
                      className="p-2 rounded-lg px-4 bg-blue-500 text-white"
                      disabled={isSelling}
                      onClick={async () => {
                        try {
                          // Calculate new bid amount as currentBid + minBidIncrement (assumed 500000 here)
                          const bidAmount =  teamOwnerPlayer.currentBid + minBidIncrement;

                          // Check if team has sufficient budget before sending bid
                          // Assuming teams state has team budgets, find current team's remaining budget
                          const teamBudgetObj = teams.find((team) => team._id === teamId);
                          const remainingBudget = teamBudgetObj ? teamBudgetObj.remainingBudget : 0;

                          if (remainingBudget < bidAmount) {
                            setMessages((msgs) => [
                              ...msgs,
                              `Insufficient budget to place bid of ${bidAmount}`,
                            ]);
                            return;
                          }

                          const response = await API.post(
                            "/auctions/bid",
                            {
                              auctionId,
                              playerId: playerId,
                              teamId: teamId,
                              amount: bidAmount,
                            },
                            {
                              headers: { Authorization: `Bearer ${token}` },
                            }
                          );
                          if (response.data.success) {
                            setMessages((msgs) => [
                              ...msgs,
                              `Bid placed successfully: ${bidAmount}`,
                            ]);
                          } else {
                            setMessages((msgs) => [
                              ...msgs,
                              `Failed to place bid`,
                            ]);
                          }
                        } catch (error) {
                          setMessages((msgs) => [
                            ...msgs,
                            `Error placing bid: ${error.message}`,
                          ]);
                        }
                      }}
                    >
                      Placebid
                    </button>
                  ))}
              </div>
            ) : (
              <p>No player is available in auction right now</p>
            )}
          </div>
{role === 'admin' && (
  <div className="w-[100%] flex flex-col md:flex-row justify-around py-2 items-center gap-2">
    <button
      className="bg-red-500 px-3 p-2 rounded-sm text-white hover:cursor-pointer hover:bg-red-600"
      onClick={() => {
        const id = localStorage.getItem("playerId");
        handleDeletePlayerFromRedis(id);
      }}
    >
      Clear Player Cache
    </button>
    <select
      className="p-2 rounded border border-gray-300"
      value={playerId || ""}
      onChange={(e) => {
        const selectedPlayerId = e.target.value;
        setPlayerId(selectedPlayerId);
        // Find the selected player to get currentHighestBidder
        const selectedPlayer = players.find(p => p.player._id === selectedPlayerId);
        if (selectedPlayer && selectedPlayer.currentHighestBidder) {
          setTeamId(selectedPlayer.currentHighestBidder);
        } else {
          setTeamId("");
        }
      }}
    >
      <option value="" disabled>
        Select Player
      </option>
      {players.map((player) => (
        <option key={player.player._id} value={player.player._id}>
          {player.player.playerName}
        </option>
      ))}
    </select>
    <select
      className="p-2 rounded border border-gray-300"
      value={teamId || ""}
      disabled
    >
      <option value="" disabled>
        Select Team
      </option>
      {teamId && (
        <option value={teamId}>
          {teams.find(team => team._id === teamId)?.name || teamId}
        </option>
      )}
    </select>
    <button
      className="text-white p-2 px-3 bg-purple-500 hover:bg-purple-600 hover:cursor-pointer rounded-sm"
      onClick={async () => {
        if (!auctionId || !playerId || !teamId) {
          setMessages((msgs) => [
            ...msgs,
            "Missing auctionId, playerId, or teamId for selling player",
          ]);
          return;
        }
        try {
          const playerResponse = await API.get(`/players/redis/player/${playerId}`);
          const currentBid = playerResponse.data.player.currentBid;
          console.log("Selling player with data:", { auctionId, playerId, teamId, currentBid });
          const response = await API.post(
            "/auctions/sell-player",
            {
              auctionId,
              playerId,
              teamId,
              currentBid,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.data.success) {
            setMessages((msgs) => [
              ...msgs,
              `Player sold successfully`,
            ]);
            // Clear the team_owner view state after successful sell
            setTeamOwnerPlayer(null);
            setIsSelling(false);
            // Remove player from Redis cache
            try {
              await API.delete(`/players/redis/player/${playerId}`);
              setMessages((msgs) => [
                ...msgs,
                `Player removed from Redis cache`,
              ]);
              localStorage.removeItem("playerId");
              setPlayerId(null);
            } catch (err) {
              setMessages((msgs) => [
                ...msgs,
                `Error removing player from Redis: ${err.message}`,
              ]);
            }
          } else {
            setMessages((msgs) => [
              ...msgs,
              `Failed to sell player: ${response.data.error || "Unknown error"}`,
            ]);
            setIsSelling(false);
          }
        } catch (error) {
          setMessages((msgs) => [
            ...msgs,
            `Error selling player: ${error.message}`,
          ]);
          setIsSelling(false);
        }
      }}
    >
      Sold Now
    </button>
  </div>
)}
        </div>
      </div>

      {role === "admin" && (
        <div className="messages mt-4">
          <h4>Messages:</h4>
          <ul>
            {messages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AuctionBidPage;
