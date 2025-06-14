import React, { useEffect, useState, useRef } from "react";
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

  const playersRef = useRef(players);
  playersRef.current = players;

  useEffect(() => {
    // Get token from localStorage
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
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

  // Handler to send player details to Redis and update team owner view
  const handleSendPlayer = async (player) => {
    try {
      const response = await API.post(
        '/players/redis/player',
        player,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        setMessages((msgs) => [...msgs, 'Player sent and stored in Redis']);
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
      }
    } catch (error) {
      setMessages((msgs) => [...msgs, `Error sending player: ${error.message}`]);
    }
  };

  return (
    <div className="auction-bid-page p-4">
      <h2>Auction Bidding</h2>
      <p>Status: {connected ? "Connected" : "Disconnected"}</p>

      {/* Admin view player-list */}
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

      {/* Team Owners view current player which is in auction */}
      {/* Send player event emit here socket.io */}
      <div className="players-list border-2 border-red-500 ">
        <h3 className="text-3xl text-center mb-4">Team Owner View</h3>
        {teamOwnerPlayer ? (
          <div className="player-card border p-2 mb-2">
            <h3>{teamOwnerPlayer.playerName || "Unnamed Player"}</h3>
            <p>BasePrice: {teamOwnerPlayer.basePrice}</p>
            {/* inside bracket import from redis */}
            <p>Current Bid {teamOwnerPlayer.currentBid}</p>
            {/* inside bracket import from redis */}
            <p>Current Team {teamOwnerPlayer.currentTeam}</p>
            <p>Role: {teamOwnerPlayer.playerRole}</p>
            {teamOwnerPlayer.soldStatus === true && (
              <p className="text-red-600 font-bold">Player is sold already</p>
            )||
            (<button className="p-2 rounded-lg px-4  bg-blue-500 text-white">Placebid</button>)
            }
          </div>
        ) : (
          <p>No player is available in auction right now</p>
        )}
      </div>
      <div className="messages mt-4">
        <h4>Messages:</h4>
        <ul>
          {messages.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AuctionBidPage;
