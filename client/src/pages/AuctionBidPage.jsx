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
  const [loggedInTeamId, setLoggedInTeamId] = useState("");
  const [token, setToken] = useState("");
  const team = useSelector((state) => state.user.team);

  useEffect(() => {
    if (team && team._id) {
      console.log("Setting loggedInTeamId from Redux store:", team._id);
      setLoggedInTeamId(team._id);
    } else {
      // Fallback: fetch team from backend if not in Redux store and role is team_owner
      if (role === "team_owner") {
        const fetchMyTeam = async () => {
          try {
            const response = await API.get("/teams/my-team", {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            });
            if (response.data && response.data._id) {
              console.log("Fetched team from backend:", response.data._id);
              setLoggedInTeamId(response.data._id);
            }
          } catch (error) {
            console.error("Error fetching my team:", error);
          }
        };
        fetchMyTeam();
      }
    }
  }, [team]);
  const [teamOwnerPlayer, setTeamOwnerPlayer] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [isSelling, setIsSelling] = useState(false);
  const role = useSelector((state) => state.user.role);
  const initialized = useSelector((state) => state.user.initialized);

  const [loading, setLoading] = useState(true);
  const [placeBidDisabled, setPlaceBidDisabled] = useState(false);

  useEffect(() => {
    if (role && token && initialized) {
      setLoading(false);
    }
  }, [role, token, initialized]);

  const playersRef = useRef(players);
  playersRef.current = players;

  const teamOwnerPlayerRef = useRef(teamOwnerPlayer);
  useEffect(() => {
    teamOwnerPlayerRef.current = teamOwnerPlayer;
  }, [teamOwnerPlayer]);

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
              currentHighestBidder: update.currentTeam,
            };
          }
          return player;
        });
      });
      // If the updated player is the teamOwnerPlayer, update its currentBid as well
      if (teamOwnerPlayerRef.current && teamOwnerPlayerRef.current._id === update.playerId) {
        setTeamOwnerPlayer((prev) => ({
          ...prev,
          currentBid: update.currentBid,
          currentTeam: update.currentTeam,
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
          setMessages((msgs) => [
            ...msgs,
            `Player data refreshed for playerId: ${playerId}`,
          ]);
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
        setMessages((msgs) => [
          ...msgs,
          `Team owner joined with email: ${data.email}`,
        ]);
      }
    });

    // Listen for player-sold event to refresh admin player list
    newSocket.on("player-sold", async (data) => {
      console.log("player-sold event received:", data);
      if (roleRef.current === "admin") {
        try {
          const response = await API.get(`/auctions/${auctionId}`);
          if (response.data.auction) {
            const filteredPlayers = (
              response.data.auction.players || []
            ).filter((player) => player.status === "available");
            setPlayers(filteredPlayers);
            setMessages((msgs) => [
              ...msgs,
              `Player sold: ${data.playerId} refreshed player list`,
            ]);
          }
        } catch (error) {
          setMessages((msgs) => [
            ...msgs,
            `Error refreshing player list after sale: ${error.message}`,
          ]);
        }
      }
      console.log("Disabling Placebid button");
      setPlaceBidDisabled(true);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [auctionId, token, role]); // Removed teamOwnerPlayer to prevent socket reconnect on player state change

  useEffect(() => {
    if (!socket) return;

    const handlePlayerUnsold = async ({
      auctionId: eventAuctionId,
      playerId,
    }) => {
      if (eventAuctionId !== auctionId) return;
      setMessages((msgs) => [...msgs, `Player marked as unsold: ${playerId}`]);

      // Refetch all players for admin to re-render the list
      if (role === "admin") {
        try {
          const response = await API.get(`/auctions/${auctionId}`);
          if (response.data.auction) {
            const filteredPlayers = (
              response.data.auction.players || []
            ).filter((player) => player.status === "available");
            setPlayers(filteredPlayers);
          }
        } catch (error) {
          setMessages((msgs) => [
            ...msgs,
            `Error fetching auction data: ${error.message}`,
          ]);
        }
      } else {
        setPlayers((prevPlayers) =>
          prevPlayers.map((player) =>
            player.player._id === playerId
              ? { ...player, status: "unsold" }
              : player
          )
        );
        if (teamOwnerPlayerRef.current && teamOwnerPlayerRef.current._id === playerId) {
          setTeamOwnerPlayer(null);
          localStorage.removeItem("playerId");
          setPlayerId(null);
        }
      }
      // Disable placeBid button after player marked unsold
      console.log("Disabling Placebid button");
      setPlaceBidDisabled(true);
    };

    socket.on("player-unsold", handlePlayerUnsold);

    return () => {
      socket.off("player-unsold", handlePlayerUnsold);
    };
  }, [socket, auctionId, teamOwnerPlayer, role]);

  // Fetch auction data from backend API
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await API.get(`/auctions/${auctionId}`);
        // auction data is in data.auction
        const filteredPlayers = (response.data.auction.players || []).filter(
          (player) => player.status === "available"
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
      const playerId = localStorage.getItem("playerId");
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
      // Include auctionId in the request body
      const playerWithAuction = { ...player, auctionId };
      const response = await API.post(
        "/players/redis/player",
        playerWithAuction,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
          setPlayerId(player._id);
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
      console.log("Enabling Placebid button");
      setPlaceBidDisabled(false);
    };

    socket.on("player-sent", handlePlayerSent);

    return () => {
      socket.off("player-sent", handlePlayerSent);
    };
  }, [socket, role]);

  useEffect(() => {
    if (!socket) return;

    const handlePlayerCacheCleared = (data) => {
      console.log(
        "player-cache-cleared event received for role:",
        role,
        "with playerId:",
        data.playerId
      );
      setMessages((msgs) => [
        ...msgs,
        `Player cache cleared for id: ${data.playerId}`,
      ]);
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
  }, [token, playerId]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="auction-bid-page p-4">
      <div className='h-[5vh]'></div>
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
                {/* Player Photo */}
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-400">
                  <img
                    src={player.player.profilePhoto}
                    alt={player.player.playerName || "Player Photo"}
                    className="w-full h-full object-contain"
                  />
                </div>

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
        </>
      )}

      <div className="players-list border-2 border-red-500 p-4">
        <h3 className="text-3xl text-center mb-4">Team Owner View</h3>

        {/* Responsive Flexbox */}
        <div className="flex flex-col md:flex-row justify-between border-2 border-yellow-600 md:h-30 gap-4">
          <div className="flex flex-col min-w-[100%]">
            {/* Right: Player Info */}
            <div className="w-full border-2 border-pink-600 md:m-w-[80%]">
              {teamOwnerPlayer ? (
                <div className="flex">
                  <div className="w-[20%] m-auto">
                    <div className="w-32 h-32 m-auto rounded-full border-2 border-red-500 overflow-hidden">
                      <img
                        src={`${teamOwnerPlayer.profilePhoto}`}
                        alt="Description"
                        className="w-full h-full object-contain overflow-hidden"
                      />
                    </div>
                  </div>
                  <div className="player-card w-[80%] border-violet-700 border p-2">
                    <h3>{teamOwnerPlayer.playerName || "Unnamed Player"}</h3>
                    <p>BasePrice: {teamOwnerPlayer.basePrice}</p>
                    <p>Current Bid: {teamOwnerPlayer.currentBid}</p>
                    <p>
                      Current Team:{" "}
                      {teamOwnerPlayer.currentTeam
                        ? teamOwnerPlayer.currentTeam
                        : "null"}
                    </p>
                    <p>Role: {teamOwnerPlayer.playerRole}</p>

                    {role === "team_owner" && (
                      <button
                        className={`p-2 rounded-lg px-4 text-white ${
                          isSelling || placeBidDisabled
                            ? "bg-gray-500 cursor-not-allowed"
                            : "bg-blue-500"
                        }`}
                        disabled={isSelling || placeBidDisabled}
                        onClick={async () => {
                          try {
                            // Calculate new bid amount as currentBid + minBidIncrement (assumed 500000 here)
                            const bidAmount =
                              teamOwnerPlayer.currentBid + minBidIncrement;

                            // Check if team has sufficient budget before sending bid
                            // Assuming teams state has team budgets, find current team's remaining budget
                            const teamBudgetObj = teams.find(
                              (team) => team._id === teamId
                            );
                            const remainingBudget = teamBudgetObj
                              ? teamBudgetObj.remainingBudget
                              : 0;

                            if (remainingBudget <= bidAmount) {
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
                                teamId: loggedInTeamId,
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
                    )}
                  </div>
                </div>
              ) : (
                <p>No player is available in auction right now</p>
              )}
            </div>
            {role === "admin" && (
              <div className="w-[100%] flex flex-col md:flex-row justify-around py-2 items-center gap-2">
                <button
                  className="bg-red-500 px-3 p-2 rounded-sm text-white hover:cursor-pointer hover:bg-red-600"
                  onClick={async () => {
                    const playerId = localStorage.getItem("playerId");
                    if (!auctionId || !playerId) {
                      setMessages((msgs) => [
                        ...msgs,
                        "Missing auctionId or playerId for marking unsold",
                      ]);
                      return;
                    }
                    try {
                      const response = await API.patch(
                        `/players/mark-unsold/${auctionId}/${playerId}`,
                        {},
                        {
                          headers: { Authorization: `Bearer ${token}` },
                        }
                      );
                      if (response.data.success) {
                        setMessages((msgs) => [
                          ...msgs,
                          "Player marked as unsold successfully",
                        ]);
                        // Update players state to reflect unsold status
                        setPlayers((prevPlayers) =>
                          prevPlayers.map((player) =>
                            player.player._id === playerId
                              ? { ...player, status: "unsold" }
                              : player
                          )
                        );
                        // Clear teamOwnerPlayer state and localStorage
                        setTeamOwnerPlayer(null);
                        localStorage.removeItem("playerId");
                        setPlayerId(null);
                      } else {
                        setMessages((msgs) => [
                          ...msgs,
                          `Failed to mark player unsold: ${response.data.error}`,
                        ]);
                      }
                    } catch (error) {
                      setMessages((msgs) => [
                        ...msgs,
                        `Error marking player unsold: ${error.message}`,
                      ]);
                    }
                  }}
                >
                  Mark Unsold
                </button>
                <button
                  className="text-white p-2 px-3 bg-purple-500 hover:bg-purple-600 hover:cursor-pointer rounded-sm"
                  onClick={async () => {
                    console.log("Sold button clicked with:", {
                      auctionId,
                      playerId,
                      teamId,
                    });
                    if (!auctionId || !playerId || !teamId) {
                      setMessages((msgs) => [
                        ...msgs,
                        "Missing auctionId, playerId, or teamId for selling player",
                      ]);
                      return;
                    }
                    try {
                      const playerResponse = await API.get(
                        `/players/redis/player/${playerId}`
                      );
                      const currentBid = playerResponse.data.player.currentBid;
                      console.log("Selling player with data:", {
                        auctionId,
                        playerId,
                        teamId,
                        currentBid,
                      });
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
                          `Failed to sell player: ${
                            response.data.error || "Unknown error"
                          }`,
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
                  Sold
                </button>
              </div>
            )}
          </div>
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
