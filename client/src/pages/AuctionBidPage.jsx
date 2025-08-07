import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import API from '../../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import LeaveConfirmModal from '../components/LeaveConfirmModal';

const AuctionBidPage = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [minBidIncrement, setMinBidIncrement] = useState(500000);
  // Removed unused bidAmounts and setBidAmounts to fix eslint error
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [teamId, setTeamId] = useState('');
  const [loggedInTeamId, setLoggedInTeamId] = useState('');
  const [token, setToken] = useState('');
  const team = useSelector((state) => state.user.team);

  const [teamOwnerPlayer, setTeamOwnerPlayer] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [isSelling, setIsSelling] = useState(false);
  const role = useSelector((state) => state.user.role);
  const initialized = useSelector((state) => state.user.initialized);

  const [loading, setLoading] = useState(true);
  const [placeBidDisabled, setPlaceBidDisabled] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const isPageReloading = useRef(false);
  useEffect(() => {
    if (team && team._id) {
      setLoggedInTeamId(team._id);
    } else {
      // Fallback: fetch team from backend if not in Redux store and role is team_owner
      if (role === 'team_owner') {
        const fetchMyTeam = async () => {
          try {
            const response = await API.get('/teams/my-team', {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`,
              },
            });
            if (response.data && response.data._id) {
              
              setLoggedInTeamId(response.data._id);
            }
          } catch (error) {
            console.error('Error fetching my team:', error);
          }
        };
        fetchMyTeam();
      }
    }
  }, [team, role]);

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
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  // New useEffect to read playerId from localStorage on mount
  useEffect(() => {
    const storedPlayerId = localStorage.getItem('playerId');
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    }
  }, []);

  // Add confirmation before leaving the page
  useEffect(() => {
    // Only add the confirmation for admins
    if (role !== 'admin') return;

    // Handler for keydown to detect page reload shortcuts (F5, Ctrl+R)
    const handleKeyDown = (e) => {
      // F5 key or Ctrl+R
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        isPageReloading.current = true;
        // Reset after a short delay to handle cases where reload is canceled
        setTimeout(() => {
          isPageReloading.current = false;
        }, 1000);
      }
    };

    // Handle beforeunload event (closing tab or page)
    const handleBeforeUnload = (e) => {
      // Don't show confirmation if reloading the page
      if (isPageReloading.current) {
        isPageReloading.current = false;
        return;
      }

      const message =
        "You may miss many valuable players, don't leave. Wait till finish of auction.";
      e.preventDefault();
      e.returnValue = message; // Required for Chrome
      return message; // For older browsers
    };

    // Handle navigation attempts with back button
    const handlePopState = (e) => {
      // Show the custom modal and store the intended navigation
      if (role === 'admin') {
        e.preventDefault();
        setShowLeaveConfirmModal(true);
        setPendingNavigation('/'); // Default to home, will be handled by the modal confirm action
      }
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    // Push a new entry to the history stack to enable detecting the back button
    window.history.pushState(null, null, window.location.pathname);

    // Clean up function
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [role]);

  useEffect(() => {
    if (!auctionId || !token) return;

    const backendUrl = 'http://localhost:5000';

    const newSocket = io(backendUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('join-auction', { auctionId });
    });

    newSocket.on('joined-auction', (data) => {
      setMessages((msgs) => [...msgs, `Joined auction: ${data.message}`]);
    });

    newSocket.on('bid-placed', (bid) => {
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
    newSocket.on('bidUpdate', (update) => {
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
      if (
        teamOwnerPlayerRef.current &&
        teamOwnerPlayerRef.current._id === update.playerId
      ) {
        setTeamOwnerPlayer((prev) => ({
          ...prev,
          currentBid: update.currentBid,
          currentTeam: update.currentTeam,
        }));
      }
    });

    newSocket.on('error', (error) => {
      setMessages((msgs) => [...msgs, `Error: ${error.message || error}`]);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      setMessages((msgs) => [...msgs, 'Disconnected from server']);
    });

    // Listen for refresh-player-data event to fetch fresh player data from Redis
    newSocket.on('refresh-player-data', async ({ playerId }) => {
      if (!playerId || !token) {
        return;
      }
      try {
        const url = `/players/redis/player/${playerId}`;
        const response = await API.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.success && response.data.player) {
          setTeamOwnerPlayer(response.data.player);
          setMessages((msgs) => [
            ...msgs,
            `Player data refreshed for playerId: ${playerId}`,
          ]);
          
        } 
      } catch (error) {
        setMessages((msgs) => [
          ...msgs,
          `Error refreshing player data: ${error.message}`,
        ]);
        console.error('Error fetching fresh player data:', error);
      }
    });

    // Listen for user-joined event to show when a team_owner joins
    const roleRef = { current: role };
    newSocket.on('user-joined', (data) => {
      if (roleRef.current === 'admin') {
        setMessages((msgs) => [
          ...msgs,
          `Team owner joined with email: ${data.email}`,
        ]);
      }
    });

    // Listen for player-sold event to refresh admin player list
    newSocket.on('player-sold', async (data) => {
      if (roleRef.current === 'admin') {
        try {
          const response = await API.get(`/auctions/${auctionId}`);
          if (response.data.auction) {
            const filteredPlayers = (
              response.data.auction.players || []
            ).filter((player) => player.status === 'available');
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
      if (role === 'admin') {
        try {
          const response = await API.get(`/auctions/${auctionId}`);
          if (response.data.auction) {
            const filteredPlayers = (
              response.data.auction.players || []
            ).filter((player) => player.status === 'available');
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
              ? { ...player, status: 'unsold' }
              : player
          )
        );
        if (
          teamOwnerPlayerRef.current &&
          teamOwnerPlayerRef.current._id === playerId
        ) {
          setTeamOwnerPlayer(null);
          localStorage.removeItem('playerId');
          setPlayerId(null);
        }
      }
      
      setPlaceBidDisabled(true);
    };

    socket.on('player-unsold', handlePlayerUnsold);

    return () => {
      socket.off('player-unsold', handlePlayerUnsold);
    };
  }, [socket, auctionId, teamOwnerPlayer, role]);

  // Fetch auction data from backend API
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await API.get(`/auctions/${auctionId}`);
        // auction data is in data.auction
        const filteredPlayers = (response.data.auction.players || []).filter(
          (player) => player.status === 'available'
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
        '/players/redis/player',
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
        localStorage.setItem('playerId', player._id);
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
          socket.emit('send-player', { auctionId, player });
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
      if (role === 'team_owner') {
        setPlayerId(data.player._id);
        // Store playerId in localStorage
        localStorage.setItem('playerId', data.player._id);
        setMessages((msgs) => [
          ...msgs,
          `Player sent: ${data.player.playerName}`,
        ]);
      }
      setPlaceBidDisabled(false);
    };

    socket.on('player-sent', handlePlayerSent);

    return () => {
      socket.off('player-sent', handlePlayerSent);
    };
  }, [socket, role]);

  useEffect(() => {
    if (!socket) return;

    const handlePlayerCacheCleared = (data) => {
    
      setMessages((msgs) => [
        ...msgs,
        `Player cache cleared for id: ${data.playerId}`,
      ]);
      localStorage.removeItem('playerId');
      setPlayerId(null);
      setTeamOwnerPlayer(null);
    };

    socket.on('player-cache-cleared', handlePlayerCacheCleared);

    return () => {
      socket.off('player-cache-cleared', handlePlayerCacheCleared);
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
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-xl text-white">Loading auction data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <div className="h-[5vh]"></div>

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-center mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Live Auction Bidding
        </h1>
        <div className="flex justify-center items-center gap-3">
          <div
            className={`px-4 py-1 rounded-full ${connected ? 'bg-green-600' : 'bg-red-600'} flex items-center`}
          >
            <span
              className={`h-3 w-3 rounded-full ${connected ? 'bg-green-300' : 'bg-red-300'} mr-2 animate-pulse`}
            ></span>
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </div>

      {/* Admin Players Section */}
      {role === 'admin' && (
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
          <div className="text-3xl font-bold mb-6 text-center text-purple-400">
            Available Players
          </div>

          {players.length === 0 && (
            <div className="bg-gray-700 rounded-lg p-4 text-center text-gray-300">
              No players available for auction
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {players.map((player) => (
              <div
                key={player.player._id}
                className="bg-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:translate-y-[-5px]"
              >
                <div className="p-4 bg-gradient-to-r from-purple-800 to-indigo-800 flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <img
                      src={player.player.profilePhoto}
                      alt={player.player.playerName || 'Player Photo'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-white">
                      {player.player.playerName || 'Unnamed Player'}
                    </h3>
                    <p className="text-purple-200">
                      {player.player.playerRole || 'Role not specified'}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between mb-3">
                    <span className="text-gray-300">Base Price:</span>
                    <span className="font-semibold text-green-400">
                      ₹{player.player.basePrice?.toLocaleString()}
                    </span>
                  </div>

                  {player.biddingHistory &&
                    player.biddingHistory.length > 0 && (
                      <div className="mt-3 border-t border-gray-600 pt-3">
                        <h4 className="font-medium text-purple-300 mb-2">
                          Bidding History:
                        </h4>
                        <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-700 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                          <ul className="space-y-1 text-sm">
                            {player.biddingHistory.map((bid, index) => (
                              <li key={index} className="flex justify-between">
                                <span>{bid.teamName || bid.team}</span>
                                <span className="text-green-400">
                                  ₹{bid.amount.toLocaleString()}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                  <button
                    className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transform transition-all duration-300 flex items-center justify-center"
                    onClick={() => handleSendPlayer(player.player)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Send to Auction
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Auction Player Section */}
      <div className="bg-gray-800 rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-purple-400">
          Current Auction
        </h2>

        {teamOwnerPlayer ? (
          <div className="bg-gray-700 rounded-xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-indigo-800 to-purple-900">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img
                      src={teamOwnerPlayer.profilePhoto}
                      alt={teamOwnerPlayer.playerName || 'Player'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="md:w-2/3 md:pl-8">
                  <h3 className="text-3xl font-bold mb-2">
                    {teamOwnerPlayer.playerName || 'Unnamed Player'}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                      <p className="text-gray-400 text-sm">Role</p>
                      <p className="font-semibold text-lg">
                        {teamOwnerPlayer.playerRole || 'Not Specified'}
                      </p>
                    </div>
                    <div className="bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                      <p className="text-gray-400 text-sm">Base Price</p>
                      <p className="font-semibold text-lg text-green-400">
                        ₹{teamOwnerPlayer.basePrice?.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                      <p className="text-gray-400 text-sm">Current Bid</p>
                      <p className="font-semibold text-lg text-green-400">
                        ₹{teamOwnerPlayer.currentBid?.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                      <p className="text-gray-400 text-sm">Current Team</p>
                      <p className="font-semibold text-lg">
                        {teamOwnerPlayer.currentTeam || 'None'}
                      </p>
                    </div>
                  </div>

                  {role === 'team_owner' && (
                    <div className="mt-6 flex justify-center">
                      <button
                        className={`px-8 py-3 rounded-full font-bold text-lg shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center 
                          ${
                            isSelling || placeBidDisabled
                              ? 'bg-gray-600 cursor-not-allowed'
                              : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'
                          }`}
                        disabled={isSelling || placeBidDisabled}
                        onClick={async () => {
                          try {
                            const bidAmount =
                              teamOwnerPlayer.currentBid + minBidIncrement;
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

                            console.log('Sending bid request:', {
                              auctionId,
                              playerId,
                              teamId: loggedInTeamId,
                              amount: bidAmount,
                            });

                            try {
                              const response = await API.post(
                                '/auctions/bid',
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
                                  `Bid placed successfully: ${bidAmount}${response.data.kafkaAvailable === false ? ' (direct processing)' : ''}`,
                                ]);
                              } else {
                                const errorMsg =
                                  response.data.error || 'Unknown error';
                                setMessages((msgs) => [
                                  ...msgs,
                                  `Failed to place bid: ${errorMsg}`,
                                ]);
                              }
                            } catch (error) {
                              console.error('Error in bid submission:', error);
                              let errorMessage = error.message;

                              // Try to extract more detailed error message if available
                              if (error.response && error.response.data) {
                                if (error.response.data.error) {
                                  errorMessage = error.response.data.error;
                                } else if (error.response.data.message) {
                                  errorMessage = error.response.data.message;
                                }
                              }

                              setMessages((msgs) => [
                                ...msgs,
                                `Error placing bid: ${errorMessage}`,
                              ]);

                              // Attempt to send a notification via socket even if the API call failed
                              try {
                                socket.emit('manual-bid-error', {
                                  auctionId,
                                  playerId,
                                  teamId: loggedInTeamId,
                                  error: errorMessage,
                                });
                              } catch (socketError) {
                                console.error(
                                  'Failed to emit socket error event:',
                                  socketError
                                );
                              }
                            }
                          } catch (outerError) {
                            console.error('Unexpected error:', outerError);
                            setMessages((msgs) => [
                              ...msgs,
                              `Unexpected error: ${outerError.message}`,
                            ]);
                          }
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        Place Bid (₹
                        {(
                          teamOwnerPlayer.currentBid + minBidIncrement
                        )?.toLocaleString()}
                        )
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {role === 'admin' && (
              <div className="p-4 bg-gray-800 flex flex-col sm:flex-row justify-center gap-4">
                <button
                  className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors duration-300"
                  onClick={async () => {
                    const playerId = localStorage.getItem('playerId');
                    if (!auctionId || !playerId) {
                      setMessages((msgs) => [
                        ...msgs,
                        'Missing auctionId or playerId for marking unsold',
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
                          'Player marked as unsold successfully',
                        ]);
                        setPlayers((prevPlayers) =>
                          prevPlayers.map((player) =>
                            player.player._id === playerId
                              ? { ...player, status: 'unsold' }
                              : player
                          )
                        );
                        setTeamOwnerPlayer(null);
                        localStorage.removeItem('playerId');
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Mark Unsold
                </button>
                <button
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center justify-center transition-colors duration-300"
                  onClick={async () => {
                    if (!auctionId || !playerId || !teamId) {
                      setMessages((msgs) => [
                        ...msgs,
                        'Missing auctionId, playerId, or teamId for selling player',
                      ]);
                      return;
                    }
                    try {
                      const playerResponse = await API.get(
                        `/players/redis/player/${playerId}`
                      );
                      const currentBid = playerResponse.data.player.currentBid;
                      console.log('Selling player with data:', {
                        auctionId,
                        playerId,
                        teamId,
                        currentBid,
                      });
                      const response = await API.post(
                        '/auctions/sell-player',
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
                        setTeamOwnerPlayer(null);
                        setIsSelling(false);
                        try {
                          await API.delete(`/players/redis/player/${playerId}`);
                          setMessages((msgs) => [
                            ...msgs,
                            `Player removed from Redis cache`,
                          ]);
                          localStorage.removeItem('playerId');
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
                            response.data.error || 'Unknown error'
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Sold
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-700 rounded-lg p-8 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-500 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <p className="text-xl text-gray-300">
              No player is currently available in the auction
            </p>
            <p className="text-gray-400 mt-2">
              Please wait for the admin to send a player
            </p>
          </div>
        )}
      </div>

      {/* Messages Section (Admin Only) */}
      {role === 'admin' && (
        <div className="bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-purple-400 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </svg>
              Activity Log
            </h3>
            <button
              onClick={() => {
                // Set reload flag to true before refreshing
                isPageReloading.current = true;
                window.location.reload();
              }}
              className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 text-sm rounded hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-800 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center italic">
                No activity yet
              </p>
            ) : (
              <ul className="space-y-2">
                {messages.map((msg, idx) => (
                  <li
                    key={idx}
                    className="text-gray-300 py-1 px-2 rounded even:bg-gray-800"
                  >
                    {msg}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Leave confirmation modal */}
      <LeaveConfirmModal
        show={showLeaveConfirmModal}
        onConfirm={() => {
          setShowLeaveConfirmModal(false);
          if (pendingNavigation) {
            navigate(pendingNavigation);
          }
        }}
        onCancel={() => {
          setShowLeaveConfirmModal(false);
          // Push state again to reset the history navigation
          window.history.pushState(null, null, window.location.pathname);
        }}
      />
    </div>
  );
};

export default AuctionBidPage;
