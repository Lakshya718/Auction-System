import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = (matchId, onMatchUpdate) => {
  const socketRef = useRef(null);

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      console.log('No token found, skipping socket connection');
      return;
    }

    // Initialize socket connection
    const serverUrl =
      import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
    const socket = io(serverUrl, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to socket server');

      // Join match room if matchId is provided
      if (matchId) {
        socket.emit('joinMatch', matchId);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Live match event handlers
    if (matchId && onMatchUpdate) {
      // Ball update event
      socket.on('ballUpdate', (data) => {
        if (data.matchId === matchId) {
          console.log('Ball update received:', data);
          onMatchUpdate(data.match);
        }
      });

      // Match started event
      socket.on('matchStarted', (data) => {
        if (data.matchId === matchId) {
          console.log('Match started:', data);
          onMatchUpdate(data.match);
        }
      });

      // New over event
      socket.on('newOver', (data) => {
        if (data.matchId === matchId) {
          console.log('New over started:', data);
          onMatchUpdate(data.match);
        }
      });

      // Batsman change event
      socket.on('batsmanChange', (data) => {
        if (data.matchId === matchId) {
          console.log('Batsman changed:', data);
          onMatchUpdate(data.match);
        }
      });

      // Match deleted event
      socket.on('matchDeleted', (data) => {
        if (data.matchId === matchId) {
          console.log('Match deleted:', data);
          // Handle match deletion - redirect or show message
        }
      });
    }

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [matchId, onMatchUpdate]);

  // Function to emit events (if needed)
  const emitEvent = (eventName, data) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(eventName, data);
    }
  };

  return {
    socket: socketRef.current,
    emitEvent,
  };
};

export default useSocket;
