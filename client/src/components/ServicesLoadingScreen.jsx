import React from 'react';
import { FaDatabase, FaExchangeAlt } from 'react-icons/fa';
import API from '../../api/axios';
import AnimatedServiceConnector from './AnimatedServiceConnector';

// Status enum for service connection states
const Status = {
  PENDING: 'pending',
};

const ServicesLoadingScreen = ({ onComplete, onError }) => {
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
      // Call the API to start services
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
          return serviceStatus.redis === 'connected';
        }

        // Check Kafka status
        if (stepIndex === 1) {
          return serviceStatus.kafka === 'connected';
        }
      }

      return false;
    } catch (error) {
      console.error(`Error connecting service:`, error);
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
