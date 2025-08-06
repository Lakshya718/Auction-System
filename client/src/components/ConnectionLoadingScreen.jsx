import React, { useState, useEffect } from 'react';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaServer,
  FaDatabase,
  FaExchangeAlt,
} from 'react-icons/fa';
import API from '../../api/axios';

// Status enum for service connection states
const Status = {
  PENDING: 'pending',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  FAILED: 'failed',
};

/**
 * ConnectionLoadingScreen component displays an animated loading screen
 * for connecting to services, with steps showing connection progress.
 */
const ConnectionLoadingScreen = ({
  title = 'Connecting Services',
  subtitle = 'Establishing connections to required services...',
  steps = [],
  onComplete,
  onError,
  connectFunction,
  completeMessage = 'All services connected successfully!',
  errorMessage = 'Failed to connect to required services.',
}) => {
  const [connectionSteps, setConnectionSteps] = useState(steps);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [overallStatus, setOverallStatus] = useState('starting');
  const [statusMessage, setStatusMessage] = useState(subtitle);

  useEffect(() => {
    const startProcess = async () => {
      try {
        await processSteps();
      } catch (error) {
        console.error('Error in connection process:', error);
        setStatusMessage(errorMessage);
        setOverallStatus('error');
        if (onError) onError(error);
      }
    };

    if (steps.length > 0) {
      startProcess();
    }
  }, []);

  const processSteps = async () => {
    for (let i = 0; i < connectionSteps.length; i++) {
      try {
        await processStep(i);
      } catch (error) {
        return; // Stop on first error
      }
    }

    // Check if all steps were successful
    const allSuccessful = connectionSteps.every(
      (step) => step.status === Status.CONNECTED
    );

    if (allSuccessful) {
      setOverallStatus('complete');
      setStatusMessage(completeMessage);

      // Delay to show completion state
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500);
    } else {
      setOverallStatus('error');
      setStatusMessage(errorMessage);
      if (onError) onError(new Error('Connection process failed'));
    }
  };

  const processStep = async (stepIndex) => {
    // Update current step to connecting state
    setConnectionSteps((prevSteps) =>
      prevSteps.map((step, idx) =>
        idx === stepIndex ? { ...step, status: Status.CONNECTING } : step
      )
    );
    setCurrentStepIndex(stepIndex);

    // Add a small delay for visual effect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      // Call the provided connection function
      const result = await connectFunction(
        connectionSteps[stepIndex],
        stepIndex
      );

      // Update step status based on result
      setConnectionSteps((prevSteps) =>
        prevSteps.map((step, idx) =>
          idx === stepIndex
            ? { ...step, status: result ? Status.CONNECTED : Status.FAILED }
            : step
        )
      );

      if (!result) {
        throw new Error(
          `Connection failed for ${connectionSteps[stepIndex].name}`
        );
      }
    } catch (error) {
      console.error(`Error connecting step ${stepIndex}:`, error);

      // Update step status to failed
      setConnectionSteps((prevSteps) =>
        prevSteps.map((step, idx) =>
          idx === stepIndex ? { ...step, status: Status.FAILED } : step
        )
      );

      throw error;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case Status.CONNECTED:
        return <FaCheckCircle className="text-green-500 text-xl" />;
      case Status.FAILED:
        return <FaTimesCircle className="text-red-500 text-xl" />;
      case Status.CONNECTING:
        return <FaSpinner className="text-blue-500 text-xl animate-spin" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full border-2 border-gray-400"></div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <FaServer className="text-4xl text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-300">{statusMessage}</p>
        </div>

        <div className="space-y-6">
          {connectionSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 ${
                currentStepIndex === index
                  ? 'bg-gray-700 shadow-md'
                  : 'bg-gray-800'
              }`}
            >
              <div className="flex items-center">
                <div className="mr-3 text-xl text-purple-400">{step.icon}</div>
                <div>
                  <h3 className="font-medium text-white">{step.name}</h3>
                  <p className="text-sm text-gray-400">
                    {step.status === Status.PENDING && 'Waiting...'}
                    {step.status === Status.CONNECTING && 'Connecting...'}
                    {step.status === Status.CONNECTED && 'Connected'}
                    {step.status === Status.FAILED && 'Connection Failed'}
                  </p>
                </div>
              </div>
              <div>{getStatusIcon(step.status)}</div>
            </div>
          ))}
        </div>

        {overallStatus === 'error' && (
          <div className="mt-8 text-center">
            <button
              onClick={processSteps}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors duration-300"
            >
              Retry Connection
            </button>
          </div>
        )}

        {overallStatus === 'complete' && (
          <div className="mt-8 text-center">
            <div className="inline-block animate-pulse bg-green-500 text-white px-6 py-3 rounded-lg">
              Redirecting...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Example usage:
// const steps = [
//   {
//     id: 'database',
//     name: 'Database Connection',
//     status: 'pending',
//     icon: <FaDatabase className="mr-2" />,
//   },
//   {
//     id: 'messaging',
//     name: 'Messaging Service',
//     status: 'pending',
//     icon: <FaExchangeAlt className="mr-2" />,
//   }
// ];
//
// <ConnectionLoadingScreen
//   title="Connecting to Services"
//   steps={steps}
//   connectFunction={async (step) => {
//     // Your connection logic here
//     return true; // Return success or failure
//   }}
//   onComplete={() => console.log('All connected!')}
//   onError={(err) => console.error('Connection failed', err)}
// />

export default ConnectionLoadingScreen;
