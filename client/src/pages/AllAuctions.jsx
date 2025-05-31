import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../../api/axios";

const AllAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewedAuctionId, setViewedAuctionId] = useState(null);
  const [registeredAuctions, setRegisteredAuctions] = useState(new Set());
  const [buttonLoading, setButtonLoading] = useState(new Set());
  const role = useSelector((state) => state.user.role);
  const team = useSelector((state) => state.user.team);
  const initialized = useSelector((state) => state.user.initialized);

  // Debug display for user role and team
  console.log("User role in AllAuctions:", role);
  console.log("User team in AllAuctions:", team);
  console.log("User state initialized:", initialized);

  const fetchAuctions = async () => {
    setLoading(true);
    setButtonLoading(new Set()); // Reset button loading state on fetch start
    try {
      const response = await API.get("auctions/all");
      console.log("Auctions data fetched:", response.data);
      setAuctions(response.data);

      if (role === "team_owner") {
        // Extract auctions where user's team is registered
        const registered = new Set();
        const userTeamId = team?._id; // Get user's team ID from Redux state
        response.data.forEach((auction) => {
          console.log("Checking auction:", auction._id);
          console.log("Participating teams:", auction.participatingTeams);
          console.log("User team ID:", userTeamId);
          if (
            auction.participatingTeams &&
            auction.participatingTeams.some((team) => team._id === userTeamId)
          ) {
            registered.add(auction._id);
          }
        });
        console.log("Registered auctions set:", registered);
        setRegisteredAuctions(registered);
      }
    } catch {
      setError("Failed to fetch auctions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [role, team]);

  const handleRegister = async (auctionId) => {
    if (registeredAuctions.has(auctionId)) {
      return; // Do nothing if already registered
    }
    setButtonLoading((prev) => new Set(prev).add(auctionId)); // Set loading for this button
    try {
      const response = await API.post(`auctions/${auctionId}/register`);
      alert(response.data.message || "Registered successfully");
      // Optimistically update registeredAuctions state
      setRegisteredAuctions((prev) => new Set([...prev, auctionId]));
      // Removed fetchAuctions call to test optimistic update only
      // await fetchAuctions(); // Refresh auctions to show updated data
    } catch (error) {
      alert(error.response?.data?.error || "Registration failed");
    } finally {
      setButtonLoading((prev) => {
        const newSet = new Set(prev);
        newSet.delete(auctionId);
        return newSet;
      }); // Remove loading state for this button
    }
  };

  const handleViewAuction = (auctionId) => {
    if (viewedAuctionId === auctionId) {
      setViewedAuctionId(null);
    } else {
      setViewedAuctionId(auctionId);
    }
  };

  const handleRemoveTeam = async (auctionId, teamId) => {
    if (
      !window.confirm(
        "Are you sure you want to remove this team from the auction?"
      )
    ) {
      return;
    }
    try {
      await API.delete(`auctions/${auctionId}/team/${teamId}`);
      alert("Team removed from auction successfully");
      await fetchAuctions(); // Refresh auctions to update UI
    } catch (error) {
      alert(error.response?.data?.error || "Failed to remove team");
    }
  };

  const pastAuctions = auctions.filter(
    (a) => a.auctionStatus === "completed" || a.auctionStatus === "cancelled"
  );
  const runningAuctions = auctions.filter((a) => a.auctionStatus === "active");
  const upcomingAuctions = auctions.filter(
    (a) => a.auctionStatus === "pending"
  );

  const renderTeamsList = (teams, auctionId) => {
    if (!teams || teams.length === 0) {
      return <p>No teams registered.</p>;
    }
    return (
      <div className="max-h-40 overflow-y-auto border border-gray-300 rounded p-2 bg-gray-50 mb-4">
        <h3 className="font-semibold mb-2">Registered Teams:</h3>
        <ul className="list-disc list-inside">
          {teams.map((team) => (
            <li key={team._id} className="flex justify-between items-center">
              <span>{team.teamName}</span>
              {role === "admin" && (
                <button
                  onClick={() => handleRemoveTeam(auctionId, team._id)}
                  className="text-red-600 hover:text-red-800 ml-4"
                  title="Remove Team"
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderAuctionList = (auctionList) =>
    auctionList.length === 0 ? (
      <p>No auctions available.</p>
    ) : (
      auctionList.map((auction) => {
        const isViewed = viewedAuctionId === auction._id;
        const isRegistered = registeredAuctions.has(auction._id);
        return (
          <div
            key={auction._id}
            className="flex flex-col border border-gray-300 rounded p-4 bg-white shadow mb-4"
            style={{ minWidth: "70%" }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">{auction.auctionName}</h3>
                <p>{auction.auctionDescription}</p>
                <p>
                  <strong>Start:</strong>{" "}
                  {new Date(auction.auctionDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  {auction.auctionStartTime}
                </p>
                <p>
                  <strong>End:</strong>{" "}
                  {new Date(auction.auctionDate).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  {auction.auctionEndTime || "N/A"}
                </p>
                <p>
                  <strong>Place:</strong> Mumbai
                </p>
                <p>
                  <strong>Sponsored by:</strong> ABC Corp
                </p>
                <p>
                  <strong>Organiser:</strong> XYZ Events
                </p>
              </div>
              <div className="space-x-2">
                {role === "team_owner" && (
                  <button
                    onClick={() => handleRegister(auction._id)}
                    className={`px-4 py-2 rounded ${
                      buttonLoading.has(auction._id)
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : isRegistered
                        ? "bg-green-600 text-white cursor-default"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                    disabled={isRegistered || buttonLoading.has(auction._id)}
                  >
                    {buttonLoading.has(auction._id)
                      ? "Loading..."
                      : isRegistered
                      ? "Registered"
                      : "Register"}
                  </button>
                )}
                {role === "admin" && (
                  <button
                    onClick={() => handleViewAuction(auction._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    {isViewed ? "Hide Auction" : "View Auction"}
                  </button>
                )}
                {role === "admin" && (
                  <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                    Start Auction
                  </button>
                )}
              </div>
            </div>
            {isViewed && (
              <>
                {renderTeamsList(auction.participatingTeams, auction._id)}
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded p-2 bg-gray-50">
                  <h3 className="font-semibold mb-2">Players List (Future)</h3>
                  {/* Future players list content goes here */}
                </div>
              </>
            )}
          </div>
        );
      })
    );

  if (!initialized) {
    return <p>Loading user data...</p>;
  }

  return (
    <div className="flex flex-col items-center p-4 space-y-8">
      <div className="w-10/12 h-[100vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Upcoming Auctions
        </h2>
        {loading ? (
          <p>Loading auctions...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          renderAuctionList(upcomingAuctions)
        )}
      </div>
      <div className="w-11/12 h-[100vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Running Auctions
        </h2>
        <p className="text-center mb-2 text-gray-600">
          Current Role: {role || "No role set"}
        </p>
        {loading ? (
          <p>Loading auctions...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          renderAuctionList(runningAuctions)
        )}
      </div>
      <div className="w-11/12 h-[100vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-center">Past Auctions</h2>
        {loading ? (
          <p>Loading auctions...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          renderAuctionList(pastAuctions)
        )}
      </div>
    </div>
  );
};

export default AllAuctions;
