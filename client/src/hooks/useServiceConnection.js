import { useState, useCallback } from 'react';
import API from '../../api/axios';

const useServiceConnection = () => {
  const [serviceStatus, setServiceStatus] = useState({
    redis: 'unknown',
    kafka: 'unknown',
    lastChecked: null,
    isConnecting: false,
  });

  const checkServiceConnection = useCallback(
    async (forceRefresh = false) => {
      if (serviceStatus.isConnecting && !forceRefresh) {
        return serviceStatus;
      }

      setServiceStatus((prev) => ({ ...prev, isConnecting: true }));

      try {
        const token = localStorage.getItem('token');
        const response = await API.get('/auctions/service-status', {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        });

        if (response.data.success) {
          const newStatus = {
            redis: response.data.services.redis,
            kafka: response.data.services.kafka,
            lastChecked: new Date(),
            isConnecting: false,
          };
          setServiceStatus(newStatus);
          return newStatus;
        } else {
          throw new Error('Failed to get service status');
        }
      } catch (error) {
        console.error('Error checking service status:', error);
        const errorStatus = {
          redis: 'unknown',
          kafka: 'unknown',
          lastChecked: new Date(),
          isConnecting: false,
        };
        setServiceStatus(errorStatus);
        return errorStatus;
      }
    },
    [serviceStatus.isConnecting]
  );

  const initializeServices = useCallback(async () => {
    setServiceStatus((prev) => ({ ...prev, isConnecting: true }));

    try {
      const token = localStorage.getItem('token');
      const response = await API.post(
        '/auctions/start-services',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 15000, // Increased timeout for service initialization
        }
      );

      if (response.data.success) {
        const newStatus = {
          redis: response.data.services.redis,
          kafka: response.data.services.kafka,
          lastChecked: new Date(),
          isConnecting: false,
        };
        setServiceStatus(newStatus);
        return {
          success: true,
          services: newStatus,
        };
      } else {
        throw new Error(
          response.data.message || 'Failed to initialize services'
        );
      }
    } catch (error) {
      console.error('Error initializing services:', error);
      setServiceStatus((prev) => ({
        ...prev,
        redis: 'error',
        kafka: 'error',
        isConnecting: false,
      }));
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  }, []);

  const areServicesReady = useCallback(() => {
    return (
      serviceStatus.redis === 'connected' && serviceStatus.kafka === 'connected'
    );
  }, [serviceStatus]);

  // Removed auto-check on mount since services are only needed when starting auctions

  return {
    serviceStatus,
    checkServiceConnection,
    initializeServices,
    areServicesReady,
  };
};

export default useServiceConnection;
