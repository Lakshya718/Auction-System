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
        const result = await processSteps();
        console.log('Process steps result:', result);

        if (result.allConnected) {
          setOverallStatus('complete');
          console.log('All services connected successfully');
          // Let ServicesLoadingScreen handle this with its useEffect
        } else if (result.connectedCount > 0) {
          // At least one service connected, we consider this a success
          setOverallStatus('complete');
          console.log(
            `Partial success: ${result.connectedCount}/${result.totalSteps} services connected`
          );
          // Let ServicesLoadingScreen handle this with its useEffect
        } else {
          // No services connected at all
          setOverallStatus('error');
          setErrorMessage(errorSubtitle);
          if (onError) onError(new Error(`Failed to connect any services`));
        }
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
    let connectedCount = 0;
    const totalSteps = steps.length;

    // Process all steps even if some fail
    for (let i = 0; i < totalSteps; i++) {
      try {
        const stepSuccess = await connectStep(i);
        if (stepSuccess) {
          connectedCount++;
        }
      } catch (error) {
        console.error('Step processing error at step', i, error);
        // Continue with next step instead of stopping
      }
    }

    // Log connection status
    console.log(`Connected ${connectedCount}/${totalSteps} services`);

    // Return detailed result object
    return {
      success: connectedCount > 0,
      connectedCount,
      totalSteps,
      allConnected: connectedCount === totalSteps,
    };
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

    // Maximum retry attempts
    const maxRetries = 3;
    let currentRetry = 0;
    let success = false;

    while (currentRetry < maxRetries && !success) {
      try {
        // Call the provided function to connect the service
        const result = await connectService(steps[stepIndex], stepIndex);
        success = result;

        // If successful, update status and break out of retry loop
        if (success) {
          setSteps((prevSteps) =>
            prevSteps.map((step, idx) =>
              idx === stepIndex ? { ...step, status: Status.CONNECTED } : step
            )
          );
          console.log(
            `Service ${steps[stepIndex].name} connected successfully`
          );
          break;
        } else {
          // If failed but we have retries left
          currentRetry++;
          if (currentRetry < maxRetries) {
            console.log(
              `Retry ${currentRetry}/${maxRetries} for ${steps[stepIndex].name}...`
            );
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } else {
            // Update step status to failed after all retries
            setSteps((prevSteps) =>
              prevSteps.map((step, idx) =>
                idx === stepIndex ? { ...step, status: Status.FAILED } : step
              )
            );
            console.error(
              `Service ${steps[stepIndex].name} failed to connect after ${maxRetries} attempts`
            );
          }
        }
      } catch (error) {
        console.error(`Error connecting step ${stepIndex}:`, error);
        currentRetry++;

        // If we have retries left
        if (currentRetry < maxRetries) {
          console.log(
            `Retry ${currentRetry}/${maxRetries} for ${steps[stepIndex].name} after error...`
          );
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          // Update step status to failed after all retries
          setSteps((prevSteps) =>
            prevSteps.map((step, idx) =>
              idx === stepIndex ? { ...step, status: Status.FAILED } : step
            )
          );

          // Set error message
          setErrorMessage(
            error.response?.data?.message ||
              error.message ||
              'Connection failed'
          );
        }
      }
    }

    // Return success/failure status
    return success;
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
