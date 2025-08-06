import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import API from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ServicesLoadingScreen from '../components/ServicesLoadingScreen';
import ResumeAuctionLoadingScreen from '../components/ResumeAuctionLoadingScreen';
import {
  FaGavel,
  FaCalendarAlt,
  FaClock,
  FaInfoCircle,
  FaPlayCircle,
  FaEye,
  FaRedoAlt,
} from 'react-icons/fa';

const AllAuctions = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const role = useSelector((state) => state.user.role);
  const navigate = useNavigate();

  const fetchAuctions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await API.get('/auctions/all-auctions');
      setAuctions(response.data.auctions);
    } catch {
      setError('Failed to fetch auctions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [role]);

  const pastAuctions = auctions.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled'
  );
  const runningAuctions = auctions.filter((a) => a.status === 'active');
  const upcomingAuctions = auctions.filter((a) => a.status === 'pending');

  const statusBadge = (status) => {
    let colorClass = '';
    let text = '';
    switch (status) {
      case 'pending':
        colorClass = 'bg-yellow-500 text-white';
        text = 'Upcoming';
        break;
      case 'active':
        colorClass = 'bg-green-500 text-white';
        text = 'Running';
        break;
      case 'completed':
        colorClass = 'bg-gray-500 text-white';
        text = 'Completed';
        break;
      case 'cancelled':
        colorClass = 'bg-red-500 text-white';
        text = 'Cancelled';
        break;
      default:
        colorClass = 'bg-gray-400 text-white';
        text = 'Unknown';
    }
    return (
      <span
        className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${colorClass}`}
      >
        {text}
      </span>
    );
  };

  const [redisLoading, setRedisLoading] = useState(false);
  const [redisError, setRedisError] = useState('');
  const [showServicesLoadingScreen, setShowServicesLoadingScreen] =
    useState(false);
  const [showResumeLoadingScreen, setShowResumeLoadingScreen] = useState(false);
  const [selectedAuctionId, setSelectedAuctionId] = useState(null);

  const renderAuctionList = (auctionList) =>
    auctionList.length === 0 ? (
      <p className="text-center text-gray-400 text-lg">
        No auctions available in this category.
      </p>
    ) : (
      auctionList.map((auction) => {
        const auctionDate = new Date(auction.date);
        const formattedDate = auctionDate.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        return (
          <div
            key={auction._id}
            className="bg-gray-800 rounded-lg shadow p-4 mb-3 border border-gray-700 transform hover:scale-102 transition-all duration-200 flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-bold text-purple-400 mb-1 truncate">
                  {auction.tournamentName}
                </h3>
                <p className="text-gray-300 text-xs mb-2 line-clamp-2">
                  {auction.description}
                </p>
                <div className="flex gap-4">
                  <p className="text-gray-400 text-xs flex items-center gap-1">
                    <FaCalendarAlt className="text-gray-500" /> {formattedDate}
                  </p>
                  <p className="text-gray-400 text-xs flex items-center gap-1">
                    <FaClock className="text-gray-500" /> {auction.startTime}
                  </p>
                </div>
              </div>
              <div>{statusBadge(auction.status)}</div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {role === 'team_owner' && (
                <button
                  className="flex items-center gap-1 bg-pink-600 text-white px-3 py-1 text-sm rounded hover:bg-pink-700 transition-colors shadow-sm"
                  onClick={() => navigate(`/auction-bid-page/${auction._id}`)}
                >
                  <FaGavel className="text-xs" /> Enter Auction
                </button>
              )}
              {role === 'admin' && (
                <>
                  <button
                    onClick={() => navigate(`/auctions/${auction._id}`)}
                    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <FaEye className="text-xs" /> View Auction
                  </button>
                  {auction.status === 'active' ? (
                    <button
                      onClick={() => {
                        // Set the selected auction and show the resume loading screen
                        setSelectedAuctionId(auction._id);
                        setShowResumeLoadingScreen(true);
                      }}
                      disabled={redisLoading}
                      className={`flex items-center gap-1 px-3 py-1 text-sm rounded transition-colors shadow-sm ${
                        redisLoading
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      {redisLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          <FaRedoAlt className="text-xs" /> Resume Auction
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={async () => {
                        const currentDate = new Date();
                        const auctionDate = new Date(auction.date);

                        // Parse auction start time
                        const [time, period] = auction.startTime.split(' ');
                        const [hours, minutes] = time.split(':').map(Number);

                        // Convert to 24-hour format if needed
                        let hour24 = hours;
                        if (period === 'PM' && hours !== 12) hour24 += 12;
                        if (period === 'AM' && hours === 12) hour24 = 0;

                        auctionDate.setHours(hour24, minutes, 0, 0);

                        if (currentDate < auctionDate) {
                          alert(
                            'This auction cannot be started before its scheduled time!'
                          );
                          return;
                        }

                        // Set the selected auction and show the services loading screen
                        setSelectedAuctionId(auction._id);
                        setShowServicesLoadingScreen(true);
                      }}
                      disabled={auction.status === 'completed' || redisLoading}
                      className={`flex items-center gap-1 px-3 py-1 text-sm rounded transition-colors shadow-sm ${
                        auction.status === 'completed' || redisLoading
                          ? 'bg-gray-500 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {redisLoading ? (
                        <LoadingSpinner />
                      ) : (
                        <>
                          <FaPlayCircle className="text-xs" /> Start Auction
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
            {redisError && (
              <p className="text-red-500 mt-1 text-xs font-medium">
                {redisError}
              </p>
            )}
          </div>
        );
      })
    );

  return (
    <div className="p-4 bg-gray-900 min-h-screen text-white">
      <div className="h-[4vh]"></div>
      <header className="mb-4 text-center">
        <h1 className="text-3xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          <FaGavel className="inline-block mr-2" />
          All Auctions
        </h1>
        <p className="text-sm text-gray-400">
          Explore and manage all upcoming, running, and past auctions.
        </p>
      </header>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p className="text-center text-red-500 text-lg font-semibold">
          Error: {error}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <section className="bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-3 text-center text-yellow-400 flex items-center justify-center gap-1">
              <FaCalendarAlt /> Upcoming Auctions
            </h2>
            <div className="overflow-y-auto max-h-[calc(100vh-220px)] pr-1 custom-scrollbar">
              {renderAuctionList(upcomingAuctions)}
            </div>
          </section>
          <section className="bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-3 text-center text-green-400 flex items-center justify-center gap-1">
              <FaPlayCircle /> Running Auctions
            </h2>
            <div className="overflow-y-auto max-h-[calc(100vh-220px)] pr-1 custom-scrollbar">
              {renderAuctionList(runningAuctions)}
            </div>
          </section>
          <section className="bg-gray-800 p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-3 text-center text-gray-400 flex items-center justify-center gap-1">
              <FaInfoCircle /> Past Auctions
            </h2>
            <div className="overflow-y-auto max-h-[calc(100vh-220px)] pr-1 custom-scrollbar">
              {renderAuctionList(pastAuctions)}
            </div>
          </section>
        </div>
      )}

      {showServicesLoadingScreen && (
        <ServicesLoadingScreen
          onComplete={async () => {
            try {
              console.log(
                'Services connected successfully, updating auction status...'
              );
              // Update auction status to active
              const statusResponse = await API.patch(
                `/auctions/${selectedAuctionId}/status`,
                { status: 'active' }
              );

              if (statusResponse.data.success) {
                console.log(
                  'Auction status updated to active, redirecting to bid page'
                );
                // Clear any previous errors
                setRedisError('');

                // Wait a bit before redirecting to ensure all state updates are complete
                setTimeout(() => {
                  // Hide the loading screen first
                  setShowServicesLoadingScreen(false);

                  // Then redirect to the auction bid page
                  console.log(
                    `Redirecting to auction bid page: /auction-bid-page/${selectedAuctionId}`
                  );
                  navigate(`/auction-bid-page/${selectedAuctionId}`);
                }, 1500);
              } else {
                setRedisError(
                  'Failed to start the auction: ' +
                    (statusResponse.data.error || 'Unknown error')
                );
                setShowServicesLoadingScreen(false);
              }
            } catch (error) {
              console.error('Error starting auction:', error);
              setRedisError(
                error.response?.data?.message || 'Failed to start auction'
              );
              setShowServicesLoadingScreen(false);
            }
          }}
          onError={(error) => {
            console.error('Services error:', error);
            setRedisError(
              'Failed to connect to required services. Please try again.'
            );
            setShowServicesLoadingScreen(false);
          }}
        />
      )}

      {showResumeLoadingScreen && (
        <ResumeAuctionLoadingScreen
          onComplete={() => {
            // Clear any previous errors
            setRedisError('');

            // Wait a bit before redirecting to ensure all state updates are complete
            setTimeout(() => {
              // Hide the loading screen first
              setShowResumeLoadingScreen(false);

              // Then redirect to the auction bid page
              console.log(
                `Redirecting to auction bid page: /auction-bid-page/${selectedAuctionId}`
              );
              navigate(`/auction-bid-page/${selectedAuctionId}`);
            }, 1500);
          }}
          onError={(error) => {
            console.error('Services check error:', error);
            setRedisError(
              'Failed to connect to required services. Please try again.'
            );
            setShowResumeLoadingScreen(false);
          }}
        />
      )}
    </div>
  );
};

export default AllAuctions;
