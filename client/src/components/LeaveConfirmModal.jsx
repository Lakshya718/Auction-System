import React from 'react';

const LeaveConfirmModal = ({ show, onConfirm, onCancel }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-purple-500 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 text-purple-400">
          Leave Auction?
        </h2>
        <p className="mb-6 text-gray-300">
          You may miss many valuable players, don't leave. Wait till finish of
          auction.
        </p>
        <div className="flex justify-between space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-all"
          >
            Stay Here
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-all"
          >
            Leave Anyway
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveConfirmModal;
