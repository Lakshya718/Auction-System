import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";

const AllAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = useSelector((state) => state.user.role);
  const team = useSelector((state) => state.user.team);
  const initialized = useSelector((state) => state.user.initialized);
  const navigate = useNavigate();

  const fetchAuctions = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await API.get("/auctions/all-auctions");
      setAuctions(response.data.auctions);
    } catch {
      setError("Failed to fetch auctions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [role, team]);

  const pastAuctions = auctions.filter(
    (a) => a.status === "completed" || a.status === "cancelled"
  );
  const runningAuctions = auctions.filter((a) => a.status === "active");
  const upcomingAuctions = auctions.filter((a) => a.status === "pending");

  const renderAuctionList = (auctionList) =>
    auctionList.length === 0 ? (
      <p>No auctions available.</p>
    ) : (
      auctionList.map((auction) => {
        return (
          <div
            key={auction._id}
            className="flex flex-col border border-gray-300 rounded p-4 bg-white shadow mb-4"
            style={{ minWidth: "70%" }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">
                  {auction.tournamentName}
                </h3>
                <p>{auction.description}</p>
                <p>
                  <strong>Start:</strong>{" "}
                  {new Date(auction.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  {auction.startTime}
                </p>
              </div>
              <div className="space-x-2">
                {/* onclick of this button a request to admin to enter in the auction room */}
                {role === "team_owner" && <button className="text-white p-2 px-3 bg-pink-500 hover:cursor-pointer rounded-lg" onClick={()=>navigate(`/auction-bid-page/${auction._id}`)}>Enter Auction</button>}
                {role === "admin" && (
                  <button
                    onClick={() => navigate(`/auctions/${auction._id}`)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    View Auction
                  </button>
                )}
                {role === "admin" && (
                  <button
                    onClick={() => {
                      navigate(`/auction-bid-page/${auction._id}`);
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Start Auction
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })
    );

  if (!initialized) {
    return <p>Loading user data...</p>;
  }

  return (
    <div className="flex flex-col items-center p-4 space-y-8">
      <div><h1>Live Auction</h1><div>
            Player to Bid now</div></div>
      {loading ? (
        <p>Loading auctions...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          <div className="w-10/12 h-[100vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Upcoming Auctions</h2>
            {renderAuctionList(upcomingAuctions)}
          </div>
          <div className="w-11/12 h-[100vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Running Auctions</h2>
            <p className="text-center mb-2 text-gray-600">
              Current Role: {role || "No role set"}
            </p>
            {renderAuctionList(runningAuctions)}
          </div>
          <div className="w-11/12 h-[100vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Past Auctions</h2>
            {renderAuctionList(pastAuctions)}
          </div>
        </>
      )}
    </div>
  );
};

export default AllAuctions;
