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
  const [bidAmounts, setBidAmounts] = useState({});
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [teamId, setTeamId] = useState("");
  const [token, setToken] = useState("");
  const [teamOwnerPlayer, setTeamOwnerPlayer] = useState(null);
  const [playerId, setPlayerId] = useState(null);
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

    newSocket.on("error", (error) => {
      setMessages((msgs) => [...msgs, `Error: ${error.message || error}`]);
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
      setMessages((msgs) => [...msgs, "Disconnected from server"]);
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
  }, [auctionId, token]);

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
      if (playerId && (role === "team_owner" || role === "admin") && token) {
        try {
          console.log("PlayerId is", playerId);
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

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="auction-bid-page p-4">
      <h2>Auction Bidding</h2>
      <p>Status: {connected ? "Connected" : "Disconnected"}</p>

      {/* {role === "admin" && (
        <div className="players-list border-2 border-red-500 ">
          <div className="text-3xl text-center">
            All Player which are available (admin)
          </div>
          {players.length === 0 && <p>No players available</p>}
          {players.map((player) => (
            <div
              key={player.player._id}
              className="flex justify-around player-card border p-2 mb-2"
            >
              <h3>{player.player.playerName || "Unnamed Player"}</h3>
              <p>BasePrice: {player.player.basePrice}</p>
              <button
                className="text-white bg-green-500 px-3 p-2 rounded-lg hover:bg-green-600"
                onClick={() => handleSendPlayer(player.player)}
              >
                Send Player
              </button>
              {player.biddingHistory && player.biddingHistory.length > 0 && (
                <div className="bidding-history mt-2">
                  <h4>Bidding History:</h4>
                  <ul>
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
      )} */}

      {role === "admin" && (
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
      )}

      {/* <div className="players-list border-2 border-red-500 ">
        <h3 className="text-3xl text-center mb-4">Team Owner View</h3>
        <div className="flex justify-between border-2 border-yellow-600">
          <div className="w-[20%] h-[100%] border-2 border-red-600 flex items-center justify-center">
            <div className="h-[90%] w-[90%] border-2 border-red-500 rounded-full"></div>
          </div>
          <div className="w-[80%]">
            {teamOwnerPlayer ? (
              <div className="player-card border p-2">
                <h3>{teamOwnerPlayer.playerName || "Unnamed Player"}</h3>
                <p>BasePrice: {teamOwnerPlayer.basePrice}</p>
                <p>Current Bid {teamOwnerPlayer.currentBid}</p>
                <p>Current Team {teamOwnerPlayer.currentTeam}</p>
                <p>Role: {teamOwnerPlayer.playerRole}</p>
                {role !== "admin" &&
                  (teamOwnerPlayer.soldStatus === false ? (
                    <p className="text-red-600 font-bold">
                      Player is sold already
                    </p>
                  ) : (
                    <button className="p-2 rounded-lg px-4  bg-blue-500 text-white">
                      Placebid
                    </button>
                  ))}
              </div>
            ) : (
              <p>No player is available in auction right now</p>
            )}
          </div>
        </div>
      </div> */}

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
                  (teamOwnerPlayer.soldStatus === false ? (
                    <p className="text-red-600 font-bold">
                      Player is sold already
                    </p>
                  ) : (
                    <button className="p-2 rounded-lg px-4 bg-blue-500 text-white">
                      Placebid
                    </button>
                  ))}
              </div>
            ) : (
              <p>No player is available in auction right now</p>
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
