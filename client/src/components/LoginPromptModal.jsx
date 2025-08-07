import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaSignInAlt, FaUserPlus, FaLock } from 'react-icons/fa';

const LoginPromptModal = ({ isOpen, onClose, title, message }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleRegister = () => {
    onClose();
    navigate('/register');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-md w-full transform scale-95 animate-modal-enter">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <FaLock className="text-purple-400" />
              {title || 'Login Required'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200 p-1"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-300 text-center leading-relaxed">
              {message || 'Please login to access this feature and explore all the amazing content we have to offer.'}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <FaSignInAlt />
              Login to Continue
            </button>
            
            <button
              onClick={handleRegister}
              className="w-full border-2 border-purple-500 text-purple-400 py-3 rounded-lg font-semibold hover:bg-purple-500 hover:text-white transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <FaUserPlus />
              Create New Account
            </button>
            
            <button
              onClick={onClose}
              className="w-full text-gray-400 hover:text-white py-2 text-sm transition-colors duration-200"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes modal-enter {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-modal-enter {
          animation: modal-enter 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LoginPromptModal;
