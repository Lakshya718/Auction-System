import React, { useState, useEffect } from 'react';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaServer,
} from 'react-icons/fa';

// Status enum for service connection states
const Status = {
  PENDING: 'pending',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  FAILED: 'failed',
};

/**
 * AnimatedServiceConnector - A reusable component for displaying service connection animations
 *
 * @param {Object} props
 * @param {Array} props.steps - Array of steps with id, name, icon, and initial status
 * @param {Function} props.onComplete - Callback when all connections complete successfully
 * @param {Function} props.onError - Callback when any connection fails
 * @param {Function} props.connectService - Function that attempts to connect services
 * @param {String} props.title - Title displayed at the top
 * @param {String} props.subtitle - Subtitle text displayed below the title
 */
const AnimatedServiceConnector = ({
  steps: initialSteps,
  onComplete,
  onError,
  connectService,
  title = 'Connecting Services',
  subtitle = 'Establishing connections to required services...',
  errorSubtitle = 'Failed to connect to required services. Please try again.',
  completeSubtitle = 'All services connected successfully!',
}) => {
  const [steps, setSteps] = useState(initialSteps || []);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [overallStatus, setOverallStatus] = useState('starting');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const startServices = async () => {
      try {
        // Start the connection process
        await processSteps();
      } catch (error) {
        console.error('Error in service connection process:', error);
        setErrorMessage(errorSubtitle);
        setOverallStatus('error');
        if (onError) onError(error);
      }
    };

    if (steps.length > 0) {
      startServices();
    }
  }, []);

  const processSteps = async () => {
    for (let i = 0; i < steps.length; i++) {
      try {
        await connectStep(i);
      } catch (error) {
        // If a step fails, stop the process
        return;
      }
    }

    // Check if all services connected successfully
    const allConnected = steps.every(
      (step) => step.status === Status.CONNECTED
    );

    if (allConnected) {
      setOverallStatus('complete');
      // Wait a moment for animation to complete before calling onComplete
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000);
    } else {
      setOverallStatus('error');
      setErrorMessage(errorSubtitle);
      if (onError) onError(new Error('Some services failed to connect'));
    }
  };

  const connectStep = async (stepIndex) => {
    // Update step status to connecting
    setSteps((prevSteps) =>
      prevSteps.map((step, idx) =>
        idx === stepIndex ? { ...step, status: Status.CONNECTING } : step
      )
    );
    setCurrentStepIndex(stepIndex);

    // Simulate connection delay for better UI experience
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      // Call the provided function to connect the service
      const result = await connectService(steps[stepIndex], stepIndex);

      // Update step status based on result
      setSteps((prevSteps) =>
        prevSteps.map((step, idx) =>
          idx === stepIndex
            ? { ...step, status: result ? Status.CONNECTED : Status.FAILED }
            : step
        )
      );

      if (!result) {
        throw new Error(`Connection failed for ${steps[stepIndex].name}`);
      }
    } catch (error) {
      console.error(`Error connecting step ${stepIndex}:`, error);

      // Update step status to failed
      setSteps((prevSteps) =>
        prevSteps.map((step, idx) =>
          idx === stepIndex ? { ...step, status: Status.FAILED } : step
        )
      );

      // Set error message
      setErrorMessage(
        error.response?.data?.message || error.message || 'Connection failed'
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
          <p className="text-gray-300">
            {overallStatus === 'starting' && subtitle}
            {overallStatus === 'complete' && completeSubtitle}
            {overallStatus === 'error' && errorMessage}
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => (
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

export default AnimatedServiceConnector;
