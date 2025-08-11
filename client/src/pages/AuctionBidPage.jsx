import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import API from '../../api/axios';
import { useParams, useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import LeaveConfirmModal from '../components/LeaveConfirmModal';
import PlayerWonAnimation from '../components/PlayerWonAnimation';

const AuctionBidPage = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();

  // Core states
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Auction data
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [minBidIncrement, setMinBidIncrement] = useState(500000);
  const [currentAuctionPlayer, setCurrentAuctionPlayer] = useState(null);

  // User data
  const [token, setToken] = useState('');
  const [loggedInTeamId, setLoggedInTeamId] = useState('');
  const [teamId, setTeamId] = useState('');

  // UI states
  const [placeBidDisabled, setPlaceBidDisabled] = useState(true);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // Animation states
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [winAnimationData, setWinAnimationData] = useState(null);

  // Access control states
  const [isAuctionAccessible, setIsAuctionAccessible] = useState(false);
  const [accessDeniedReason, setAccessDeniedReason] = useState('');
  const [isEstablishingConnection, setIsEstablishingConnection] =
    useState(false);
  const [connectionCheckCompleted, setConnectionCheckCompleted] =
    useState(false);

  // Redux states
  const role = useSelector((state) => state.user.role);
  const team = useSelector((state) => state.user.team);
  const initialized = useSelector((state) => state.user.initialized);

  // Refs
  const isPageReloading = useRef(false);
  const socketRef = useRef(null);
  const currentAuctionPlayerRef = useRef(null);
  const teamsRef = useRef([]);
  const loggedInTeamIdRef = useRef('');
  const hasConnectionBeenEstablished = useRef(false);

  // Update refs when values change
  useEffect(() => {
    currentAuctionPlayerRef.current = currentAuctionPlayer;
  }, [currentAuctionPlayer]);

  useEffect(() => {
    teamsRef.current = teams;
  }, [teams]);

  useEffect(() => {
    loggedInTeamIdRef.current = loggedInTeamId;
  }, [loggedInTeamId]);
  // Initialize states
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  // Set up logged in team ID
  useEffect(() => {
    if (team && team._id) {
      setLoggedInTeamId(team._id);
    } else if (role === 'team_owner') {
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
  }, [team, role]);

  // Set loading state
  useEffect(() => {
    if (role && token && initialized) {
      setLoading(false);

      // Initialize access control states based on role
      if (role === 'admin') {
        setIsAuctionAccessible(true);
        setConnectionCheckCompleted(true);
        setIsEstablishingConnection(false);
      } else if (role === 'team_owner') {
        // Check if team owner was previously connected successfully
        const wasConnected = localStorage.getItem(
          `auction-${auctionId}-team-connected`
        );
        if (wasConnected === 'true') {
          setIsAuctionAccessible(true);
          setConnectionCheckCompleted(true);
          setIsEstablishingConnection(false);
          hasConnectionBeenEstablished.current = true;
        } else {
          setIsEstablishingConnection(false);
        }
      }
    }
  }, [role, token, initialized, auctionId]);

  // Fetch auction data
  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const response = await API.get(`/auctions/${auctionId}`);
        const auction = response.data.auction;

        const filteredPlayers = (auction.players || []).filter(
          (player) => player.status === 'available'
        );
        setPlayers(filteredPlayers);
        setTeams(auction.teams || []);
        setMinBidIncrement(auction.minBidIncrement || 500000);

        if (auction.teams && auction.teams.length > 0) {
          setTeamId(auction.teams[0]._id || auction.teams[0]);
        }

        // Check auction access for team owners
        if (role === 'team_owner') {
          // Check if team owner was already successfully connected
          const wasConnected = localStorage.getItem(
            `auction-${auctionId}-team-connected`
          );
          if (wasConnected === 'true') {
            setIsAuctionAccessible(true);
            setConnectionCheckCompleted(true);
            setIsEstablishingConnection(false);
            return;
          }

          // Check if auction is running/active
          if (auction.status !== 'active' && auction.status !== 'running') {
            setIsAuctionAccessible(false);
            setAccessDeniedReason(
              'The auction is not currently running. Please wait until it starts.'
            );
            setConnectionCheckCompleted(true);
            return;
          }

          // For now, allow access to all team owners when auction is active
          // TODO: Implement proper teamOwners authorization when backend is ready
          setIsAuctionAccessible(true);
          setConnectionCheckCompleted(true);
          setIsEstablishingConnection(false);
        }
        // Admin states are already set in the loading useEffect
      } catch (error) {
        toast.error(`Error fetching auction data: ${error.message}`);
      }
    };
    fetchAuction();
  }, [auctionId, role, token]);

  // Fetch current auction player from Redis
  useEffect(() => {
    const fetchCurrentPlayer = async () => {
      const playerId = localStorage.getItem('playerId');
      if (playerId && token) {
        try {
          const response = await API.get(`/players/redis/player/${playerId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.success && response.data.player) {
            setCurrentAuctionPlayer(response.data.player);

            // Check if this user is the current highest bidder
            if (
              role === 'team_owner' &&
              response.data.player.currentHighestBidder === loggedInTeamId
            ) {
              console.log(
                'User is current highest bidder, waiting for other team'
              );
            }
          }
        } catch (error) {
          console.error('Error fetching current player:', error);
          toast.error(`Error fetching current player: ${error.message}`);
        }
      }
    };
    fetchCurrentPlayer();
  }, [token, loggedInTeamId, role]);

  // Enable/disable bidding based on current auction player and role
  useEffect(() => {
    if (role === 'team_owner' && currentAuctionPlayer) {
      setPlaceBidDisabled(false);
    } else {
      setPlaceBidDisabled(true);
    }
  }, [currentAuctionPlayer, role]);

  // Handle page refresh/navigation warnings and cleanup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) &&
        role === 'admin'
      ) {
        isPageReloading.current = true;
        setTimeout(() => {
          isPageReloading.current = false;
        }, 1000);
      }
    };

    const handleBeforeUnload = (e) => {
      // Clear team owner connection flag when leaving the page
      localStorage.removeItem(`auction-${auctionId}-team-connected`);

      if (role === 'admin') {
        if (isPageReloading.current) {
          isPageReloading.current = false;
          return;
        }
        const message =
          "You may miss many valuable players, don't leave. Wait till finish of auction.";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    const handlePopState = (e) => {
      // Clear team owner connection flag when navigating away
      localStorage.removeItem(`auction-${auctionId}-team-connected`);

      if (role === 'admin') {
        e.preventDefault();
        setShowLeaveConfirmModal(true);
        setPendingNavigation('/');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);
    window.history.pushState(null, null, window.location.pathname);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [role, auctionId]);

  // WebSocket Setup - Simplified approach
  useEffect(() => {
    if (!auctionId || !token || !role) return;

    // For team owners, check if they're allowed to connect
    const canTeamOwnerConnect =
      role === 'team_owner' &&
      (isEstablishingConnection || isAuctionAccessible);

    const shouldConnect = role === 'admin' || canTeamOwnerConnect;

    if (role === 'team_owner') {
      console.log('Team owner socket connection check:', {
        isEstablishingConnection,
        isAuctionAccessible,
        canTeamOwnerConnect,
        shouldConnect,
      });
    }

    if (!shouldConnect) {
      return;
    }

    // Prevent multiple connections - especially for team owners who change states
    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    // For team owners, prevent reconnection if they already had a successful connection
    if (role === 'team_owner' && hasConnectionBeenEstablished.current) {
      return;
    }

    // Clean up any existing disconnected socket
    if (socketRef.current) {
      console.log('Cleaning up existing socket');
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }

    console.log('Creating new socket connection for role:', role, {
      isEstablishingConnection,
      isAuctionAccessible,
      hasConnectionBeenEstablished: hasConnectionBeenEstablished.current,
    });

    const backendUrl = 'http://localhost:5000';
    const newSocket = io(backendUrl, {
      auth: { token },
      transports: ['websocket'],
    });

    setSocket(newSocket);
    socketRef.current = newSocket;

    // Connection handlers
    newSocket.on('connect', () => {
      setConnected(true);
      console.log(
        `[${role}] Socket connected, joining auction room:`,
        auctionId
      );
      newSocket.emit('join-auction', { auctionId });
      toast.success('Connected to auction room');
    });

    newSocket.on('joined-auction', () => {
      toast.success('Successfully joined the auction');

      // Mark that connection has been established for team owners
      if (role === 'team_owner') {
        hasConnectionBeenEstablished.current = true;
        // Persist connection state across remounts
        localStorage.setItem(`auction-${auctionId}-team-connected`, 'true');
      }

      // Connection check is complete for all roles
      setConnectionCheckCompleted(true);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
      toast.error('Disconnected from auction room');
    });

    // Real-time bidding events
    newSocket.on('bid-placed', (bid) => {
      toast.success(
        `Bid placed: ${bid.teamName} bid ₹${bid.amount?.toLocaleString()} for ${bid.playerName}`
      );

      // Update player list with new bid info
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

      // Update current auction player if it matches the bid
      if (
        currentAuctionPlayerRef.current &&
        currentAuctionPlayerRef.current._id === bid.playerId
      ) {
        setCurrentAuctionPlayer((prev) => ({
          ...prev,
          currentBid: bid.amount,
          currentTeam: bid.teamName,
          currentHighestBidder: bid.teamId,
        }));
      }
    });

    // Real-time bid updates from Kafka
    newSocket.on('bidUpdate', (update) => {
      console.log(`[${role}] Received bidUpdate:`, update);

      // Find team name from team ID
      const teamName =
        teams.find((team) => team._id === update.currentTeam)?.teamName ||
        update.currentTeam;

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

      // Update current auction player if it matches
      if (
        currentAuctionPlayerRef.current &&
        currentAuctionPlayerRef.current._id === update.playerId
      ) {
        console.log(`[${role}] Updating current auction player:`, {
          oldBid: currentAuctionPlayerRef.current.currentBid,
          newBid: update.currentBid,
          oldTeam: currentAuctionPlayerRef.current.currentTeam,
          newTeam: teamName,
        });

        setCurrentAuctionPlayer((prev) => ({
          ...prev,
          currentBid: update.currentBid,
          currentTeam: teamName, // Use resolved team name
          currentHighestBidder: update.currentTeam, // Store team ID
        }));
      } else {
        console.log(
          `[${role}] No current auction player to update or player ID mismatch:`,
          {
            currentPlayerRef: currentAuctionPlayerRef.current?._id,
            updatePlayerId: update.playerId,
          }
        );
      }
    });

    // Player management events
    newSocket.on('player-sent', (data) => {
      // Update current auction player for all users
      setCurrentAuctionPlayer(data.player);
      localStorage.setItem('playerId', data.player._id);

      // Show toast for all users, not just team owners
      toast(`🏏 ${data.player.playerName} is now up for auction!`, {
        icon: '🎯',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

      // Enable bidding for team owners
      if (role === 'team_owner') {
        setPlaceBidDisabled(false);
      }
    });

    newSocket.on('refresh-player-data', async ({ playerId }) => {
      if (!playerId || !token) return;

      try {
        const response = await API.get(`/players/redis/player/${playerId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success && response.data.player) {
          console.log(`[${role}] Player data refreshed:`, response.data.player);
          setCurrentAuctionPlayer(response.data.player);

          // Only show toast for team owners, not admin (to reduce noise)
          if (role === 'team_owner') {
            toast.success(
              `Player data updated: ${response.data.player.playerName}`
            );
          }
        }
      } catch (error) {
        console.error(`[${role}] Error refreshing player data:`, error);
        toast.error(`Error refreshing player data: ${error.message}`);
      }
    });

    // Player sold/unsold events
    newSocket.on('player-sold', async (data) => {
      // Check if current team won the player (for team owners)
      if (
        role === 'team_owner' &&
        data.teamId === loggedInTeamIdRef.current &&
        currentAuctionPlayerRef.current
      ) {
        // Get team name for the animation
        const winningTeam = teamsRef.current.find(
          (team) => team._id === data.teamId
        );
        const teamName = winningTeam ? winningTeam.name : 'Your Team';

        // Set animation data
        setWinAnimationData({
          playerName:
            currentAuctionPlayerRef.current.playerName ||
            currentAuctionPlayerRef.current.name,
          teamName: teamName,
          soldPrice:
            data.soldPrice || currentAuctionPlayerRef.current.currentBid,
        });

        // Show animation
        setShowWinAnimation(true);
      }

      if (role === 'admin') {
        try {
          const response = await API.get(`/auctions/${auctionId}`);
          if (response.data.auction) {
            const filteredPlayers = (
              response.data.auction.players || []
            ).filter((player) => player.status === 'available');
            setPlayers(filteredPlayers);
            toast.success(
              `Player sold: ${data.playerId} - refreshed player list`
            );
          }
        } catch (error) {
          toast.error(`Error fetching auction data: ${error.message}`);
        }
      }
      setPlaceBidDisabled(true);
    });

    newSocket.on(
      'player-unsold',
      async ({ auctionId: eventAuctionId, playerId }) => {
        if (eventAuctionId !== auctionId) return;

        toast(`Player marked as unsold: ${playerId}`, {
          icon: 'ℹ️',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });

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
            toast.error(`Error fetching auction data: ${error.message}`);
          }
        }

        if (
          currentAuctionPlayerRef.current &&
          currentAuctionPlayerRef.current._id === playerId
        ) {
          setCurrentAuctionPlayer(null);
          localStorage.removeItem('playerId');
        }

        setPlaceBidDisabled(true);
      }
    );

    newSocket.on('player-cache-cleared', (data) => {
      if (role === 'admin') {
        toast(`Player cache cleared for id: ${data.playerId}`, {
          icon: 'ℹ️',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      }
      localStorage.removeItem('playerId');
      setCurrentAuctionPlayer(null);
    });

    // User activity - show for admin only
    newSocket.on('user-joined', (data) => {
      if (role === 'admin') {
        toast(`Team owner joined: ${data.email}`, {
          icon: 'ℹ️',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      }
    });

    newSocket.on('error', (error) => {
      toast.error(`Error: ${error.message || error}`);
    });

    return () => {
      console.log('useEffect cleanup triggered for role:', role);
      // Don't disconnect if team owner just got access
      if (role === 'team_owner' && isAuctionAccessible) {
        console.log('Skipping socket disconnect - team owner has access');
        return;
      }
      if (newSocket && newSocket.connected) {
        console.log('Disconnecting socket in cleanup');
        newSocket.disconnect();
      }
      // Don't set socketRef to null here as it might be used by other parts
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auctionId, token, role, isAuctionAccessible]);

  // Cleanup socket on component unmount
  useEffect(() => {
    return () => {
      console.log('Component unmounting, cleaning up socket');
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
      }
      // Reset connection flag
      hasConnectionBeenEstablished.current = false;
      // Don't clear localStorage here - let beforeunload handle it
    };
  }, [auctionId]);

  // Handler to send player to auction (Admin only)
  const handleSendPlayer = async (player) => {
    try {
      const playerWithAuction = { ...player, auctionId };
      const response = await API.post(
        '/players/redis/player',
        playerWithAuction,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success(`Player ${player.playerName} ready for auction`);
        localStorage.setItem('playerId', player._id);

        // Fetch fresh player data from Redis
        const fetchResponse = await API.get(
          `/players/redis/player/${player._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (fetchResponse.data.success) {
          setCurrentAuctionPlayer(fetchResponse.data.player);
        }

        // Notify all clients
        if (socket) {
          socket.emit('send-player', { auctionId, player });
        }
      }
    } catch (error) {
      toast.error(`Error sending player: ${error.message}`);
    }
  };

  // Handler to place bid (Team Owner only)
  const handlePlaceBid = async () => {
    if (!currentAuctionPlayer || placeBidDisabled) return;

    try {
      // Debug logging
      console.log('Place bid debug:', {
        currentAuctionPlayer,
        currentBid: currentAuctionPlayer.currentBid,
        currentTeam: currentAuctionPlayer.currentTeam,
        currentHighestBidder: currentAuctionPlayer.currentHighestBidder,
        minBidIncrement,
        loggedInTeamId,
        auctionId,
      });

      const currentBid =
        currentAuctionPlayer.currentBid || currentAuctionPlayer.basePrice || 0;
      const bidAmount = currentBid + minBidIncrement;
      const teamBudgetObj = teams.find((team) => team._id === loggedInTeamId);
      const remainingBudget = teamBudgetObj ? teamBudgetObj.remainingBudget : 0;

      console.log('Bid calculation:', {
        currentBid,
        minBidIncrement,
        bidAmount,
        remainingBudget,
        currentHighestBidder: currentAuctionPlayer.currentHighestBidder,
        loggedInTeamId,
      });

      if (remainingBudget < bidAmount) {
        toast.error(
          `Insufficient budget to place bid of ₹${bidAmount?.toLocaleString()}`
        );
        return;
      }

      const response = await API.post(
        '/auctions/bid',
        {
          auctionId,
          playerId: currentAuctionPlayer._id,
          teamId: loggedInTeamId,
          amount: bidAmount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        // Optimistically update the current auction player immediately
        const teamName =
          teams.find((team) => team._id === loggedInTeamId)?.teamName ||
          'Your Team';
        setCurrentAuctionPlayer((prev) => ({
          ...prev,
          currentBid: bidAmount,
          currentTeam: teamName,
          currentHighestBidder: loggedInTeamId,
        }));

        toast.success(
          `Bid placed successfully: ₹${bidAmount?.toLocaleString()}${
            response.data.kafkaAvailable === false ? ' (direct processing)' : ''
          }`
        );
      } else {
        toast.error(`Failed to place bid: ${response.data.error}`);
      }
    } catch (error) {
      let errorMessage = error.response?.data?.error || error.message;
      console.error('Bid error details:', error.response?.data);
      toast.error(`Error placing bid: ${errorMessage}`);
    }
  };

  // Handler to mark player as unsold (Admin only)
  const handleMarkUnsold = async () => {
    if (!currentAuctionPlayer) return;

    try {
      const response = await API.patch(
        `/players/mark-unsold/${auctionId}/${currentAuctionPlayer._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Player marked as unsold successfully');
        setCurrentAuctionPlayer(null);
        localStorage.removeItem('playerId');
      } else {
        toast.error(`Failed to mark player unsold: ${response.data.error}`);
      }
    } catch (error) {
      toast.error(`Error marking player unsold: ${error.message}`);
    }
  };

  // Handler to sell player (Admin only)
  const handleSellPlayer = async () => {
    if (!currentAuctionPlayer || !teamId) return;

    try {
      const response = await API.post(
        '/auctions/sell-player',
        {
          auctionId,
          playerId: currentAuctionPlayer._id,
          teamId,
          currentBid: currentAuctionPlayer.currentBid,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success('Player sold successfully');
        setCurrentAuctionPlayer(null);

        // Clear Redis cache
        try {
          await API.delete(`/players/redis/player/${currentAuctionPlayer._id}`);
          localStorage.removeItem('playerId');
        } catch (err) {
          toast.error(`Error removing player from Redis: ${err.message}`);
        }
      } else {
        toast.error(`Failed to sell player: ${response.data.error}`);
      }
    } catch (error) {
      toast.error(`Error selling player: ${error.message}`);
    }
  };

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

  // Show establishing connection for team owners during connection check
  if (role === 'team_owner' && !connectionCheckCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center bg-gray-800 rounded-lg p-8 shadow-2xl border border-blue-500">
          <div className="text-6xl mb-4">🔄</div>
          <h2 className="text-2xl font-bold text-blue-400 mb-4">
            Establishing Connection...
          </h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300 mb-2">Checking auction availability</p>
          <p className="text-gray-400 text-sm">
            Please wait while we verify the auction status
          </p>
        </div>
      </div>
    );
  }

  // Access denied for team owners
  if (role === 'team_owner' && !isAuctionAccessible) {
    const isDateIssue = accessDeniedReason.includes('auction has not started');
    const isStatusIssue = accessDeniedReason.includes('not currently running');
    const isAccessDenied = accessDeniedReason.includes('Access denied');

    let title = 'Access Denied';
    let icon = '⚠️';

    if (isDateIssue) {
      title = 'Auction Not Started';
      icon = '⏰';
    } else if (isStatusIssue) {
      title = 'Auction Not Running';
      icon = '⏸️';
    } else if (isAccessDenied) {
      title = 'Access Denied';
      icon = '🚫';
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center bg-gray-800 rounded-lg p-8 shadow-2xl border border-red-500">
          <div className="text-6xl mb-4">{icon}</div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">{title}</h2>
          <p className="text-gray-300 mb-6">{accessDeniedReason}</p>
          <button
            onClick={() => navigate('/all-auctions')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Back to Auctions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
      <div className="h-[5vh]"></div>

      {/* Player Won Animation */}
      {showWinAnimation && winAnimationData && (
        <PlayerWonAnimation
          isVisible={showWinAnimation}
          playerName={winAnimationData.playerName}
          teamName={winAnimationData.teamName}
          soldPrice={winAnimationData.soldPrice}
          onAnimationEnd={() => {
            setShowWinAnimation(false);
            setWinAnimationData(null);
          }}
        />
      )}

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
                                  ₹{bid.amount?.toLocaleString()}
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

      {/* Current Auction Player Section - Visible to both Admin and Team Owners */}
      <div className="bg-gray-800 rounded-xl shadow-xl p-6 mb-8 border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-center text-purple-400">
          Current Auction
        </h2>

        {currentAuctionPlayer ? (
          <div className="bg-gray-700 rounded-xl overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-indigo-800 to-purple-900">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
                  <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img
                      src={currentAuctionPlayer.profilePhoto}
                      alt={currentAuctionPlayer.playerName || 'Player'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="md:w-2/3 md:pl-8">
                  <h3 className="text-3xl font-bold mb-2">
                    {currentAuctionPlayer.playerName || 'Unnamed Player'}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                      <p className="text-gray-400 text-sm">Role</p>
                      <p className="font-semibold text-lg">
                        {currentAuctionPlayer.playerRole || 'Not Specified'}
                      </p>
                    </div>
                    <div className="bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                      <p className="text-gray-400 text-sm">Base Price</p>
                      <p className="font-semibold text-lg text-green-400">
                        ₹{currentAuctionPlayer.basePrice?.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                      <p className="text-gray-400 text-sm">Current Bid</p>
                      <p className="font-semibold text-lg text-green-400">
                        ₹{currentAuctionPlayer.currentBid?.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-gray-800 bg-opacity-50 p-3 rounded-lg">
                      <p className="text-gray-400 text-sm">Current Team</p>
                      <p className="font-semibold text-lg">
                        {currentAuctionPlayer.currentTeam || 'None'}
                      </p>
                    </div>
                  </div>

                  {/* Team Owner Bid Button */}
                  {role === 'team_owner' && (
                    <div className="mt-6 flex justify-center">
                      {(() => {
                        const isConsecutiveBid =
                          currentAuctionPlayer.currentHighestBidder ===
                          loggedInTeamId;
                        const isBidDisabled =
                          placeBidDisabled || isConsecutiveBid;

                        return (
                          <button
                            className={`px-8 py-3 rounded-full font-bold text-lg shadow-lg transform transition-all duration-300 hover:scale-105 flex items-center 
                              ${
                                isBidDisabled
                                  ? 'bg-gray-600 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'
                              }`}
                            disabled={isBidDisabled}
                            onClick={handlePlaceBid}
                            title={
                              isConsecutiveBid
                                ? 'You cannot bid twice in a row'
                                : ''
                            }
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
                            {isConsecutiveBid
                              ? 'Wait for Other Team'
                              : `Place Bid (₹${(
                                  (currentAuctionPlayer.currentBid ||
                                    currentAuctionPlayer.basePrice ||
                                    0) + minBidIncrement
                                )?.toLocaleString()})`}
                          </button>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Admin Controls */}
            {role === 'admin' && (
              <div className="p-4 bg-gray-800 flex flex-col sm:flex-row justify-center gap-4">
                <select
                  value={teamId}
                  onChange={(e) => setTeamId(e.target.value)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500"
                >
                  <option value="">Select Team to Sell</option>
                  {teams.map((team) => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </select>

                <button
                  className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center transition-colors duration-300"
                  onClick={handleMarkUnsold}
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
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center justify-center transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  onClick={handleSellPlayer}
                  disabled={!teamId}
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
                  Sold to Selected Team
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
              {role === 'admin'
                ? 'Send a player to start the auction'
                : 'Please wait for the admin to send a player'}
            </p>
          </div>
        )}
      </div>

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
          window.history.pushState(null, null, window.location.pathname);
        }}
      />

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #374151',
            borderRadius: '8px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
    </div>
  );
};

export default AuctionBidPage;
