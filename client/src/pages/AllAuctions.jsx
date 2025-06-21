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

  const statusBadge = (status) => {
    let color = "";
    let text = "";
    switch (status) {
      case "pending":
        color = "bg-yellow-300 text-yellow-900";
        text = "Upcoming";
        break;
      case "active":
        color = "bg-green-300 text-green-900";
        text = "Running";
        break;
      case "completed":
        color = "bg-gray-300 text-gray-700";
        text = "Completed";
        break;
      case "cancelled":
        color = "bg-red-300 text-red-900";
        text = "Cancelled";
        break;
      default:
        color = "bg-gray-200 text-gray-800";
        text = "Unknown";
    }
    return (
      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${color}`}>
        {text}
      </span>
    );
  };

  const renderAuctionList = (auctionList) =>
    auctionList.length === 0 ? (
      <p className="text-center text-gray-500">No auctions available.</p>
    ) : (
      auctionList.map((auction) => {
        return (
          <div
            key={auction._id}
            className="flex flex-col border border-gray-300 rounded-lg p-6 bg-white shadow-md mb-6 hover:shadow-lg transition-shadow duration-300"
            style={{ minWidth: "100%" }}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-2xl font-bold mb-1">{auction.tournamentName}</h3>
                <p className="text-gray-700 mb-2">{auction.description}</p>
                <p className="text-sm text-gray-600">
                  <strong>Start:</strong>{" "}
                  {new Date(auction.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  {auction.startTime}
                </p>
              </div>
              <div>{statusBadge(auction.status)}</div>
            </div>
            <div className="flex space-x-3">
              {role === "team_owner" && (
                <button
                  className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
                  onClick={() => navigate(`/auction-bid-page/${auction._id}`)}
                >
                  Enter Auction
                </button>
              )}
              {role === "admin" && (
                <>
                  <button
                    onClick={() => navigate(`/auctions/${auction._id}`)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    View Auction
                  </button>
                  <button
                    onClick={() => {
                      const currentDate = new Date();
                      const auctionDate = new Date(auction.date);
                      // Compare only the date parts (year, month, day)
                      if (
                        currentDate.getFullYear() !== auctionDate.getFullYear() ||
                        currentDate.getMonth() !== auctionDate.getMonth() ||
                        currentDate.getDate() !== auctionDate.getDate()
                      ) {
                        alert("This auction cannot be start now!");
                      } else {
                        navigate(`/auction-bid-page/${auction._id}`);
                      }
                    }}
                    disabled={auction.status === "completed"}
                    className={`text-white px-4 py-2 rounded-lg transition-colors ${
                      auction.status === "completed"
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    Start Auction
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })
    );

  if (!initialized) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
        <span className="ml-4 text-lg font-semibold">Loading user data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold mb-2">Live Auction</h1>
        <p className="text-lg text-gray-600">Player to Bid now</p>
      </header>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
          <span className="ml-4 text-lg font-semibold">Loading auctions...</span>
        </div>
      ) : error ? (
        <p className="text-center text-red-600 font-semibold">{error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <section className="overflow-y-auto max-h-[70vh]">
            <h2 className="text-2xl font-bold mb-4 text-center text-yellow-600">Upcoming Auctions</h2>
            {renderAuctionList(upcomingAuctions)}
          </section>
          <section className="overflow-y-auto max-h-[70vh]">
            <h2 className="text-2xl font-bold mb-4 text-center text-green-600">Running Auctions</h2>
            <p className="text-center mb-4 text-gray-600">
              Current Role: {role || "No role set"}
            </p>
            {renderAuctionList(runningAuctions)}
          </section>
          <section className="overflow-y-auto max-h-[70vh]">
            <h2 className="text-2xl font-bold mb-4 text-center text-gray-600">Past Auctions</h2>
            {renderAuctionList(pastAuctions)}
          </section>
        </div>
      )}
    </div>
  );
};

export default AllAuctions;
