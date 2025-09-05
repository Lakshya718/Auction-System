import React from 'react';
import {
  FaDatabase,
  FaExchangeAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
} from 'react-icons/fa';

const ServiceStatusIndicator = ({ serviceStatus, className = '' }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <FaCheckCircle className="text-green-500" />;
      case 'error':
        return <FaTimesCircle className="text-red-500" />;
      case 'connecting':
        return <FaSpinner className="text-yellow-500 animate-spin" />;
      default:
        return <FaTimesCircle className="text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return 'Error';
      case 'connecting':
        return 'Connecting';
      default:
        return 'Disconnected';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'connecting':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  if (serviceStatus.isConnecting) {
    return (
      <div className={`flex items-center gap-2 text-sm ${className}`}>
        <FaSpinner className="text-yellow-500 animate-spin" />
        <span className="text-yellow-500">Checking services...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 text-sm ${className}`}>
      {/* Redis Status */}
      <div className="flex items-center gap-1">
        <FaDatabase className="text-gray-400" />
        {getStatusIcon(serviceStatus.redis)}
        <span className={getStatusColor(serviceStatus.redis)}>
          Redis: {getStatusText(serviceStatus.redis)}
        </span>
      </div>

      {/* Kafka Status */}
      <div className="flex items-center gap-1">
        <FaExchangeAlt className="text-gray-400" />
        {getStatusIcon(serviceStatus.kafka)}
        <span className={getStatusColor(serviceStatus.kafka)}>
          Kafka: {getStatusText(serviceStatus.kafka)}
        </span>
      </div>

      {/* Last Updated */}
      {serviceStatus.lastChecked && (
        <div className="text-gray-500 text-xs">
          Last checked: {serviceStatus.lastChecked.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default ServiceStatusIndicator;
