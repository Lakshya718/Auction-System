import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import API from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FaGavel,
  FaCalendarAlt,
  FaClock,
  FaInfoCircle,
  FaPlayCircle,
  FaEye,
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
        className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${colorClass}`}
      >
        {text}
      </span>
    );
  };

  const [redisLoading, setRedisLoading] = useState(false);
  const [redisError, setRedisError] = useState('');

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
            className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-gray-700 transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold text-purple-400 mb-2">
                  {auction.tournamentName}
                </h3>
                <p className="text-gray-300 text-sm mb-3">
                  {auction.description}
                </p>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <FaCalendarAlt /> {formattedDate}
                </p>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <FaClock /> {auction.startTime}
                </p>
              </div>
              <div>{statusBadge(auction.status)}</div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              {role === 'team_owner' && (
                <button
                  className="flex items-center gap-2 bg-pink-600 text-white px-5 py-2 rounded-lg hover:bg-pink-700 transition-colors shadow-md"
                  onClick={() => navigate(`/auction-bid-page/${auction._id}`)}
                >
                  <FaGavel /> Enter Auction
                </button>
              )}
              {role === 'admin' && (
                <>
                  <button
                    onClick={() => navigate(`/auctions/${auction._id}`)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                  >
                    <FaEye /> View Auction
                  </button>
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

                      setRedisLoading(true);
                      setRedisError('');

                      try {
                        // First ensure Redis is connected
                        const redisResponse = await API.post(
                          '/auctions/start-redis'
                        );

                        if (redisResponse.data.success) {
                          // Then update auction status to active
                          const statusResponse = await API.patch(
                            `/auctions/${auction._id}/status`,
                            {
                              status: 'active',
                            }
                          );

                          if (statusResponse.data.success) {
                            navigate(`/auction-bid-page/${auction._id}`);
                          } else {
                            setRedisError('Failed to start the auction');
                          }
                        } else {
                          setRedisError('Failed to connect to auction server');
                        }
                      } catch (error) {
                        console.error('Error starting auction:', error);
                        setRedisError(
                          error.response?.data?.message ||
                            'Failed to start auction'
                        );
                      } finally {
                        setRedisLoading(false);
                      }
                    }}
                    disabled={
                      auction.status === 'completed' ||
                      auction.status === 'active' ||
                      redisLoading
                    }
                    className={`flex items-center gap-2 px-5 py-2 rounded-lg transition-colors shadow-md ${
                      auction.status === 'completed' ||
                      auction.status === 'active' ||
                      redisLoading
                        ? 'bg-gray-500 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {redisLoading ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <FaPlayCircle /> Start Auction
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
            {redisError && (
              <p className="text-red-500 mt-2 text-center font-semibold">
                {redisError}
              </p>
            )}
          </div>
        );
      })
    );

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-white">
      <div className='h-[5vh]'></div>
      <header className="mb-5 text-center">
        <h1 className="text-4xl font-extrabold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          <FaGavel className="inline-block mr-3" />
          All Auctions
        </h1>
        <p className="text-lg text-gray-400">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-yellow-400 flex items-center justify-center gap-2">
              <FaCalendarAlt /> Upcoming Auctions
            </h2>
            <div className="overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
              {renderAuctionList(upcomingAuctions)}
            </div>
          </section>
          <section className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-green-400 flex items-center justify-center gap-2">
              <FaPlayCircle /> Running Auctions
            </h2>
            <div className="overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
              {renderAuctionList(runningAuctions)}
            </div>
          </section>
          <section className="bg-gray-800 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-400 flex items-center justify-center gap-2">
              <FaInfoCircle /> Past Auctions
            </h2>
            <div className="overflow-y-auto max-h-[calc(100vh-250px)] pr-2">
              {renderAuctionList(pastAuctions)}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AllAuctions;
