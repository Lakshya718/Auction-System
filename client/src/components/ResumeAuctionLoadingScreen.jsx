import React, { useState, useEffect } from 'react';
import { FaDatabase, FaExchangeAlt } from 'react-icons/fa';
import API from '../../api/axios';
import AnimatedServiceConnector from './AnimatedServiceConnector';

// Status enum for service connection states
const Status = {
  PENDING: 'pending',
};

const ResumeAuctionLoadingScreen = ({ onComplete, onError }) => {
  // Track our own connection success state
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [redisConnected, setRedisConnected] = useState(false);
  const [kafkaConnected, setKafkaConnected] = useState(false);

  // Use effect to check when both services are connected
  useEffect(() => {
    if (redisConnected && kafkaConnected) {
      console.log(
        'Both Redis and Kafka are confirmed connected for resumption, triggering completion...'
      );
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
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Increment connection attempts
      const newAttemptCount = connectionAttempts + 1;
      setConnectionAttempts(newAttemptCount);

      // Call the API to check services status
      console.log(
        `Checking ${step.id} service status (attempt ${newAttemptCount})...`
      );
      const response = await API.post(
        '/auctions/check-services-status',
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

      console.log(
        `Service status check response for ${step.id} (attempt ${newAttemptCount}):`,
        response.data
      );

      // Check if connection was successful
      if (response.data.success) {
        const serviceStatus = response.data.services;

        // Check Redis status
        if (stepIndex === 0) {
          console.log(`Redis status: ${serviceStatus.redis}`);
          const isConnected = serviceStatus.redis === 'connected';

          // Update Redis connection status
          if (isConnected) {
            console.log('Redis connection confirmed successful');
            setRedisConnected(true);
          } else {
            console.log('Redis connection failed');
            setRedisConnected(false);
          }

          return isConnected;
        }

        // Check Kafka status
        if (stepIndex === 1) {
          console.log(`Kafka status: ${serviceStatus.kafka}`);
          const isConnected = serviceStatus.kafka === 'connected';

          // Update Kafka connection status
          if (isConnected) {
            console.log('Kafka connection confirmed successful');
            setKafkaConnected(true);
          } else {
            console.log('Kafka connection failed');
            setKafkaConnected(false);
          }

          return isConnected;
        }
      } else {
        console.error(
          'Server reported unsuccessful service status check:',
          response.data
        );

        // Check if we have any partial success
        if (response.data.services) {
          // Even if the overall success is false, check individual service statuses
          const serviceStatus = response.data.services;

          if (stepIndex === 0 && serviceStatus.redis === 'connected') {
            console.log('Redis connected despite overall failure');
            setRedisConnected(true);
            return true;
          }

          if (stepIndex === 1 && serviceStatus.kafka === 'connected') {
            console.log('Kafka connected despite overall failure');
            setKafkaConnected(true);
            return true;
          }
        }

        return false;
      }

      return false;
    } catch (error) {
      console.error(`Connection check error for ${step.id}:`, error);
      return false;
    }
  };

  return (
    <AnimatedServiceConnector
      steps={steps}
      onComplete={onComplete}
      onError={onError}
      connectService={connectService}
      title="Resuming Auction Services"
      subtitle="Checking connections to required services..."
      errorSubtitle="Failed to connect to required services. Please try again."
      completeSubtitle="All services connected successfully!"
    />
  );
};

export default ResumeAuctionLoadingScreen;
