import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";

const socket = io("http://localhost:5000"); // Adjust port if needed

const MAX_BID = 140000000; // 14 crore in base units

const LiveAuction = () => {
  const role = useSelector((state) => state.user.role);
  const user = useSelector((state) => state.user.user);

  // Admin state
  const [player, setPlayer] = useState(() => {
    const savedPlayer = localStorage.getItem("player");
    return savedPlayer ? JSON.parse(savedPlayer) : null;
  });
  const playerRef = useRef(player);

  const [bidNotifications, setBidNotifications] = useState(() => {
    const saved = localStorage.getItem("bidNotifications");
    return saved ? JSON.parse(saved) : [];
  });

  const [soldPlayers, setSoldPlayers] = useState(() => {
    const saved = localStorage.getItem("soldPlayers");
    return saved ? JSON.parse(saved) : [];
  });

  const [inputPlayerName, setInputPlayerName] = useState("");
  const [inputBasePrice, setInputBasePrice] = useState("");
  const [inputExperience, setInputExperience] = useState("");
  const [inputProfilePhoto, setInputProfilePhoto] = useState("");
  const [isPlayerSold, setIsPlayerSold] = useState(false);
  // Auction state
  const [currentBid, setCurrentBid] = useState(() => {
    if (typeof window !== "undefined" && localStorage.getItem("currentBid")) {
      return Number(localStorage.getItem("currentBid"));
    }
    return 0;
  });
  const [currentTeam, setCurrentTeam] = useState(() => {
    if (typeof window !== "undefined" && localStorage.getItem("currentTeam")) {
      return localStorage.getItem("currentTeam");
    }
    return null;
  });
  const [countdown, setCountdown] = useState(() => {
    if (typeof window !== "undefined" && localStorage.getItem("countdown")) {
      return Number(localStorage.getItem("countdown"));
    }
    return 10;
  });
  const countdownRef = useRef(countdown);
  const countdownIntervalRef = useRef(null);

  const [approvalStatus, setApprovalStatus] = useState(() => {
    if (typeof window !== "undefined" && localStorage.getItem("approvalStatus")) {
      return localStorage.getItem("approvalStatus");
    }
    return null;
  }); // null, 'approved', 'rejected'
  const [auctionCompleted, setAuctionCompleted] = useState(() => {
    if (typeof window !== "undefined" && localStorage.getItem("auctionCompleted")) {
      return localStorage.getItem("auctionCompleted") === "true";
    }
    return false;
  });
  const [waitingForNext, setWaitingForNext] = useState(() => {
    if (typeof window !== "undefined" && localStorage.getItem("waitingForNext")) {
      return localStorage.getItem("waitingForNext") === "true";
    }
    return false;
  });
  const [waitingForAdminResponse, setWaitingForAdminResponse] = useState(() => {
    if (typeof window !== "undefined" && localStorage.getItem("waitingForAdminResponse")) {
      return localStorage.getItem("waitingForAdminResponse") === "true";
    }
    return false;
  });

  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  useEffect(() => {
    countdownRef.current = countdown;
  }, [countdown]);

  useEffect(() => {
    localStorage.setItem("soldPlayers", JSON.stringify(soldPlayers));
  }, [soldPlayers]);

  // Persist team_owner auction state to localStorage
  // Removed persistence for team_owner as per rollback request

  useEffect(() => {
    if (role === "admin") {
      socket.emit("request-current-state");

      socket.on(
        "current-state",
        ({
          player,
          currentBid,
          currentTeam,
          bidNotifications,
          soldPlayers: sold,
        }) => {
          if (player) {
            setPlayer(player);
            localStorage.setItem("player", JSON.stringify(player));
            setWaitingForNext(false);
            setAuctionCompleted(false);
            setWaitingForAdminResponse(false);
          }
          if (typeof currentBid === "number") {
            setCurrentBid(currentBid);
          }
          if (currentTeam) {
            setCurrentTeam(currentTeam);
          }
          if (bidNotifications) {
            setBidNotifications(bidNotifications);
            localStorage.setItem(
              "bidNotifications",
              JSON.stringify(bidNotifications)
            );
          }
          if (sold) {
            setSoldPlayers(sold);
          }
        }
      );

      socket.on("bid-notification", ({ teamOwnerName, bidAmount }) => {
        const message = `${teamOwnerName} has bid ${bidAmount} on player ${
          playerRef.current ? playerRef.current.playerName : ""
        }`;
        setBidNotifications((prev) => {
          const updated = [...prev, message];
          localStorage.setItem("bidNotifications", JSON.stringify(updated));
          return updated;
        });
        setCurrentBid(bidAmount);
        setCurrentTeam(teamOwnerName);
        resetCountdown();
      });

      socket.on("auction-approved", () => {
        setApprovalStatus("approved");
        if (player) {
          setSoldPlayers((prev) => [...prev, player]);
        }
        clearAuctionData();
        setWaitingForNext(true);
        setWaitingForAdminResponse(false);
      });

      socket.on("auction-rejected", () => {
        setApprovalStatus("rejected");
        clearAuctionData();
        setWaitingForNext(true);
        setWaitingForAdminResponse(false);
      });

      socket.on("auction-finished", () => {
        setAuctionCompleted(true);
        setWaitingForNext(false);
        clearAuctionData();
        setWaitingForAdminResponse(false);
      });

      return () => {
        socket.off("current-state");
        socket.off("bid-notification");
        socket.off("auction-approved");
        socket.off("auction-rejected");
        socket.off("auction-finished");
      };
    } else if (role === "team_owner") {
      socket.on("player-info", (player) => {
        setPlayer(player);
        setCurrentBid(player.basePrice || 0);
        setCurrentTeam(null);
        setApprovalStatus(null);
        setWaitingForNext(false);
        setAuctionCompleted(false);
        setWaitingForAdminResponse(false);
        resetCountdown();
      });

      socket.on("bid-updated", ({ bidAmount, teamOwnerName }) => {
        setCurrentBid(bidAmount);
        setCurrentTeam(teamOwnerName);
        resetCountdown();
      });

      socket.on("auction-approved", () => {
        setApprovalStatus("approved");
        clearAuctionData();
        setWaitingForNext(false);
        setWaitingForAdminResponse(true);
      });

      socket.on("auction-rejected", () => {
        setApprovalStatus("rejected");
        clearAuctionData();
        setWaitingForNext(false);
        setWaitingForAdminResponse(false);
      });

      socket.on("auction-finished", () => {
        setAuctionCompleted(true);
        setWaitingForNext(false);
        clearAuctionData();
        setWaitingForAdminResponse(false);
      });

      return () => {
        socket.off("player-info");
        socket.off("bid-updated");
        socket.off("auction-approved");
        socket.off("auction-rejected");
        socket.off("auction-finished");
      };
    } else {
      // For normal users
      socket.on("player-info", (player) => {
        setPlayer(player);
        setCurrentBid(player.basePrice || 0);
        setCurrentTeam(null);
        setApprovalStatus(null);
        setWaitingForNext(false);
        setAuctionCompleted(false);
        setWaitingForAdminResponse(false);
      });

      socket.on("bid-updated", ({ bidAmount, teamOwnerName }) => {
        setCurrentBid(bidAmount);
        setCurrentTeam(teamOwnerName);
      });

      socket.on("auction-approved", () => {
        setApprovalStatus("approved");
        clearAuctionData();
        setWaitingForNext(false);
        setWaitingForAdminResponse(true);
      });

      socket.on("auction-rejected", () => {
        setApprovalStatus("rejected");
        clearAuctionData();
        setWaitingForNext(false);
        setWaitingForAdminResponse(false);
      });

      socket.on("auction-finished", () => {
        setAuctionCompleted(true);
        setWaitingForNext(false);
        clearAuctionData();
        setWaitingForAdminResponse(false);
      });

      return () => {
        socket.off("player-info");
        socket.off("bid-updated");
        socket.off("auction-approved");
        socket.off("auction-rejected");
        socket.off("auction-finished");
      };
    }
  }, [role]);

  const clearAuctionData = () => {
    setPlayer(null);
    setCurrentBid(0);
    setCurrentTeam(null);
    setCountdown(10);
    setApprovalStatus(null);
  };

  useEffect(() => {
    if (countdown === 0) {
      // Notify admin that time is up for approval
      if (role === "admin") {
        // Admin can approve or reject now
      }
      clearInterval(countdownIntervalRef.current);
    }
  }, [countdown, role]);

  const resetCountdown = () => {
    setCountdown(10);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendPlayer = () => {
    if (inputPlayerName.trim() !== "" && inputBasePrice && inputExperience) {
      const newPlayer = {
        playerName: inputPlayerName.trim(),
        basePrice: Number(inputBasePrice),
        experience: Number(inputExperience),
        profilePhoto: inputProfilePhoto || "",
      };
      socket.emit("send-player", newPlayer);
      setPlayer(newPlayer);
      localStorage.setItem("player", JSON.stringify(newPlayer));
      setInputPlayerName("");
      setInputBasePrice("");
      setInputExperience("");
      setInputProfilePhoto("");
      setCurrentBid(newPlayer.basePrice);
      setCurrentTeam(null);
      setApprovalStatus(null);
      setWaitingForNext(false);
      setAuctionCompleted(false);
      setWaitingForAdminResponse(false);
      resetCountdown();
      setIsPlayerSold(false);
    }
  };

  const handleBidClick = () => {
    if (role !== "team_owner") return;
    if (countdown <= 0) {
      alert("Bidding time is over. No more bids allowed.");
      return;
    }
    const newBid = currentBid + 2000000; // Increase by 20 lac
    if (newBid > MAX_BID) {
      alert("Bid cannot exceed 14 crore");
      return;
    }
    socket.emit("bid-clicked", {
      teamOwnerName: user?.name || "Your Team",
      bidAmount: newBid,
    });
  };

  const handleApprove = () => {
    if (role !== "admin") return;
    socket.emit("approve-auction", { player, currentBid, currentTeam });
    setApprovalStatus("approved");
    if (player) {
      setSoldPlayers((prev) => [...prev, player]);
    }
    setIsPlayerSold(true);
    toast.success(`Congratulations ${currentTeam} for buying the player!`);
    clearAuctionData();
    setWaitingForNext(true);
    setWaitingForAdminResponse(true);
  };

  const handleReject = () => {
    if (role !== "admin") return;
    socket.emit("reject-auction", { player, currentBid, currentTeam });
    setApprovalStatus("rejected");
    clearAuctionData();
    setWaitingForNext(true);
    setWaitingForAdminResponse(false);
  };

  const handleFinishAuction = () => {
    if (role !== "admin") return;
    socket.emit("finish-auction");
    setAuctionCompleted(true);
    setWaitingForNext(false);
    clearAuctionData();
    setWaitingForAdminResponse(false);
  };

  return (
    <div className="p-4">
      {auctionCompleted && (
        <div className="mb-4 p-4 border rounded bg-green-100">
          <h2 className="text-xl font-bold mb-2">Auction Completed</h2>
          <p>The auction has been completed. Thank you for participating!</p>
        </div>
      )}

      {waitingForNext && (
        <div className="mb-4 p-4 border rounded bg-yellow-100">
          <h2 className="text-xl font-bold mb-2">Waiting for Next Player</h2>
          <p>Please send the next player to auction.</p>
            <button
              onClick={handleFinishAuction}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mt-4"
            >
              Finish Auction
            </button>
        </div>
      )}
      
      {role === "team_owner" ? (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Team Owner Live Auction</h2>
          {waitingForAdminResponse ? (
            <p className="text-center font-semibold text-lg">Waiting for admin to respond...</p>
          ) : player && !isPlayerSold? (
            <div className="border p-4 rounded mb-4">
              <img src={player.profilePhoto} alt={player.playerName} className="w-24 h-24 object-cover rounded-full mb-2" />
              <p>Name: {player.playerName}</p>
              <p>Base Price: {player.basePrice}</p>
              <p>Experience: {player.experience}</p>
              <p>Current Bid: {currentBid}</p>
              <p>Current Team: {currentTeam || 'No bids yet'}</p>
              <button
                onClick={handleBidClick}
                disabled={countdown <= 0}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-2 disabled:opacity-50"
              >
                Bid 20 Lac
              </button>
              <p>Time left: {countdown} seconds</p>
              {approvalStatus === 'approved' && <p className="text-green-600 font-bold">You won the auction!</p>}
              {approvalStatus === 'rejected' && <p className="text-red-600 font-bold">You lost the auction.</p>}
              {approvalStatus === 'approved' && currentTeam && (
                <p className="text-blue-600 font-bold">Player sold to {currentTeam}</p>
              )}
            </div>
          ) : (
            <p>No player currently in auction.</p>
          )}
        </div>
      ) : role === "admin" ? (
        <>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Enter player name"
              value={inputPlayerName}
              onChange={(e) => setInputPlayerName(e.target.value)}
              className="border p-2 mr-2"
            />
            <input
              type="number"
              placeholder="Base Price"
              value={inputBasePrice}
              onChange={(e) => setInputBasePrice(e.target.value)}
              className="border p-2 mr-2"
            />
            <input
              type="number"
              placeholder="Experience"
              value={inputExperience}
              onChange={(e) => setInputExperience(e.target.value)}
              className="border p-2 mr-2"
            />
            <input
              type="text"
              placeholder="Profile Photo URL"
              value={inputProfilePhoto}
              onChange={(e) => setInputProfilePhoto(e.target.value)}
              className="border p-2 mr-2"
            />
            <button
              onClick={handleSendPlayer}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Send Player
            </button>
          </div>
          {player && (
            <div className="border p-4 rounded mb-4">
              <img
                src={player.profilePhoto}
                alt={player.playerName}
                className="w-24 h-24 object-cover rounded-full mb-2"
              />
              <p>Name: {player.playerName}</p>
              <p>Base Price: {player.basePrice}</p>
              <p>Experience: {player.experience}</p>
              <p>Current Bid: {currentBid}</p>
              <p>Current Team: {currentTeam || "No bids yet"}</p>
              <p>Time left: {countdown} seconds</p>
              <button
                onClick={handleApprove}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2"
                disabled={
                  approvalStatus === "approved" ||
                  approvalStatus === "rejected" ||
                  countdown > 0
                }
              >
                Approve
              </button>
              <button
                onClick={handleReject}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                disabled={
                  approvalStatus === "approved" ||
                  approvalStatus === "rejected" ||
                  countdown > 0
                }
              >
                Reject
              </button>
            </div>
          )}
          <div>
            <h3 className="font-semibold mb-2">Bid Notifications:</h3>
            <ul className="list-disc list-inside max-h-64 overflow-y-auto border p-2">
              {bidNotifications.length === 0 && <li>No bids yet.</li>}
              {bidNotifications.map((msg, index) => (
                <li key={index}>{msg}</li>
              ))}
            </ul>
          </div>
          <div className="mt-4 max-h-64 overflow-y-auto border p-2">
            <h3 className="font-semibold mb-2">Sold Players History:</h3>
            {soldPlayers.length === 0 && <p>No players sold yet.</p>}
            {soldPlayers.map((soldPlayer, index) => (
              <div
                key={index}
                className="border p-2 rounded mb-2 flex items-center space-x-4"
              >
                <img
                  src={soldPlayer.profilePhoto}
                  alt={soldPlayer.playerName}
                  className="w-12 h-12 object-cover rounded-full"
                />
                <div>
                  <p className="font-semibold">{soldPlayer.playerName}</p>
                  <p>Base Price: {soldPlayer.basePrice}</p>
                  <p>Experience: {soldPlayer.experience}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {waitingForAdminResponse ? (
            <p className="text-center font-semibold text-lg">
              Waiting for admin to respond...
            </p>
          ) : player ? (
            <div className="border p-4 rounded mb-4">
              <img
                src={player.profilePhoto}
                alt={player.playerName}
                className="w-24 h-24 object-cover rounded-full mb-2"
              />
              <p>Name: {player.playerName}</p>
              <p>Current Bid: {currentBid}</p>
              <p>Current Team: {currentTeam || "No bids yet"}</p>
              {approvalStatus === "approved" && currentTeam && (
                <p className="text-blue-600 font-bold">
                  Player sold to {currentTeam}
                </p>
              )}
            </div>
          ) : (
            <p>No player currently in auction.</p>
          )}
        </>
      )}
    </div>
  );
};

export default LiveAuction;
