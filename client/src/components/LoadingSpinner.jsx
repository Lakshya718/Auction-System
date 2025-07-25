
import React from "react";

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="flex items-center justify-center space-x-2">
        <div
          className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-600 animate-bounce"
          style={{ animationDelay: "0s" }}
        ></div>
        <div
          className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-600 animate-bounce"
          style={{ animationDelay: "-0.15s" }}
        ></div>
        <div
          className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-600 animate-bounce"
          style={{ animationDelay: "-0.3s" }}
        ></div>
      </div>
      <p className="mt-4 text-lg font-semibold text-gray-600 tracking-widest uppercase">
        Loading...
      </p>
    </div>
  );
};

export default LoadingSpinner;
