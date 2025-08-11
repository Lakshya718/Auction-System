import React, { useState, useEffect } from 'react';
import { FaDatabase, FaExchangeAlt } from 'react-icons/fa';
import API from '../../api/axios';
import AnimatedServiceConnector from './AnimatedServiceConnector';

// Status enum for service connection states
const Status = {
  PENDING: 'pending',
};

const ServicesLoadingScreen = ({ onComplete, onError }) => {
  // Track our own connection success state
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [redisConnected, setRedisConnected] = useState(false);
  const [kafkaConnected, setKafkaConnected] = useState(false);

  // Use effect to check when both services are connected
  useEffect(() => {
    if (redisConnected && kafkaConnected) {
      // Short delay to ensure UI updates before calling onComplete
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000); // Longer delay to ensure UI shows "Connected" state
    } else if (redisConnected) {
      console.log('Redis connected, waiting for Kafka...');
    } else if (kafkaConnected) {
      console.log('Kafka connected, waiting for Redis...');
    }
  }, [redisConnected, kafkaConnected, onComplete]);

  const steps = [
    {
      id: 'redis',
      name: 'Redis Database',
      status: Status.PENDING,
      icon: <FaDatabase className="mr-2" />,
    },
    {
      id: 'kafka',
      name: 'Kafka Messaging',
      status: Status.PENDING,
      icon: <FaExchangeAlt className="mr-2" />,
    },
  ];

  const connectService = async (step, stepIndex) => {
    try {
      // Add a small delay between connection attempts
      if (stepIndex > 0) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Increment connection attempts
      const newAttemptCount = connectionAttempts + 1;
      setConnectionAttempts(newAttemptCount);

      // Get token for authentication
      const token = localStorage.getItem('token');
      console.log(
        'Token for service connection:',
        token ? 'Present' : 'Missing'
      );

      // Set timeout for API call (increased to account for full service check)
      const response = await Promise.race([
        API.post(
          '/auctions/start-services',
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 8000, // Increased to 8 second timeout
          }
        ),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Service connection timeout')),
            8000
          )
        ),
      ]);

      // Check if connection was successful
      if (response.data.success) {
        const serviceStatus = response.data.services;

        // Check Redis status
        if (stepIndex === 0) {
          const isConnected = serviceStatus.redis === 'connected';
          setRedisConnected(isConnected);
          return isConnected;
        }

        // Check Kafka status
        if (stepIndex === 1) {
          const isConnected = serviceStatus.kafka === 'connected';
          setKafkaConnected(isConnected);
          return isConnected;
        }
      } else {
        console.error(
          'Server reported unsuccessful service connection:',
          response.data
        );

        // Check if we have any partial success
        if (response.data.services) {
          const serviceStatus = response.data.services;

          if (stepIndex === 0 && serviceStatus.redis === 'connected') {
            setRedisConnected(true);
            return true;
          }

          if (stepIndex === 1 && serviceStatus.kafka === 'connected') {
            setKafkaConnected(true);
            return true;
          }
        }

        return false;
      }

      return false;
    } catch (error) {
      console.error(`Connection error for ${step.id}:`, error.message);

      // Check for authentication errors
      if (error.response && error.response.status === 401) {
        console.error(
          'Authentication failed - token may be invalid or missing'
        );
        if (onError) {
          onError('Authentication required. Please login again.');
          return false;
        }
      }

      // Check for server errors
      if (error.response && error.response.status === 500) {
        console.error('Server error:', error.response.data);
      }

      // If it's a timeout or network error, we might want to retry (but only once for speed)
      if (
        connectionAttempts < 2 &&
        (error.message.includes('timeout') ||
          error.message.includes('Network Error') ||
          error.code === 'ECONNABORTED')
      ) {
        console.log(
          `Retrying ${step.id} connection (attempt ${connectionAttempts + 1})`
        );
        await new Promise((resolve) => setTimeout(resolve, 500));
        return await connectService(step, stepIndex);
      }

      return false;
    }
  };

  return (
    <AnimatedServiceConnector
      steps={steps}
      onComplete={onComplete}
      onError={onError}
      connectService={connectService}
      title="Connecting Auction Services"
      subtitle="Establishing connections to required services..."
      errorSubtitle="Failed to connect to required services. Please try again."
      completeSubtitle="All services connected successfully!"
    />
  );
};

export default ServicesLoadingScreen;
