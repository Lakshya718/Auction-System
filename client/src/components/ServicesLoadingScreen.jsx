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
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Increment connection attempts
      const newAttemptCount = connectionAttempts + 1;
      setConnectionAttempts(newAttemptCount);


      const response = await API.post(
        '/auctions/start-services',
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );

    

      // Check if connection was successful
      if (response.data.success) {
        const serviceStatus = response.data.services;

        // Check Redis status
        if (stepIndex === 0) {
          const isConnected = serviceStatus.redis === 'connected';

          // Update Redis connection status
          if (isConnected) {
            setRedisConnected(true);
          } else {
            setRedisConnected(false);
          }

          return isConnected;
        }

        // Check Kafka status
        if (stepIndex === 1) {
          const isConnected = serviceStatus.kafka === 'connected';

          // Update Kafka connection status
          if (isConnected) {
            setKafkaConnected(true);
          } else {
            setKafkaConnected(false);
          }

          return isConnected;
        }
      } else {
        console.error(
          'Server reported unsuccessful service connection:',
          response.data
        );

        // Check if we have any partial success
        if (response.data.services) {
          // Even if the overall success is false, check individual service statuses
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
      console.error(`Connection error for ${step.id}:`, error);
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
