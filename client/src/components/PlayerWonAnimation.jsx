import React, { useEffect, useState } from 'react';

const PlayerWonAnimation = ({
  isVisible,
  playerName,
  teamName,
  soldPrice,
  onAnimationEnd,
}) => {
  const [animationPhase, setAnimationPhase] = useState('hidden');

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('entering');

      // Show main animation
      const timer1 = setTimeout(() => {
        setAnimationPhase('showing');
      }, 100);

      // Start exit animation
      const timer2 = setTimeout(() => {
        setAnimationPhase('exiting');
      }, 4000);

      // Complete animation
      const timer3 = setTimeout(() => {
        setAnimationPhase('hidden');
        if (onAnimationEnd) onAnimationEnd();
      }, 4500);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isVisible, onAnimationEnd]);

  if (animationPhase === 'hidden') return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-all duration-500 ${
        animationPhase === 'entering'
          ? 'opacity-0'
          : animationPhase === 'showing'
            ? 'opacity-100'
            : 'opacity-0'
      }`}
    >
      <div
        className={`bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl p-8 text-center shadow-2xl transform transition-all duration-700 ${
          animationPhase === 'entering'
            ? 'scale-50 rotate-12'
            : animationPhase === 'showing'
              ? 'scale-100 rotate-0'
              : 'scale-125 rotate-6'
        }`}
      >
        {/* Animated stars/sparkles */}
        <div className="absolute -top-4 -left-4 text-yellow-300 text-3xl animate-spin">
          ✨
        </div>
        <div className="absolute -top-2 -right-2 text-yellow-300 text-2xl animate-bounce">
          🌟
        </div>
        <div className="absolute -bottom-2 -left-2 text-yellow-300 text-2xl animate-pulse">
          ⭐
        </div>
        <div className="absolute -bottom-4 -right-4 text-yellow-300 text-3xl animate-ping">
          ✨
        </div>

        {/* Main content */}
        <div className="text-white relative z-10">
          <div
            className={`text-6xl font-bold mb-4 transform transition-all duration-1000 delay-300 ${
              animationPhase === 'showing'
                ? 'translate-y-0 opacity-100'
                : 'translate-y-8 opacity-0'
            }`}
          >
            🎉 WOW! 🎉
          </div>

          <div
            className={`text-3xl font-bold mb-2 transform transition-all duration-1000 delay-500 ${
              animationPhase === 'showing'
                ? 'translate-y-0 opacity-100'
                : 'translate-y-8 opacity-0'
            }`}
          >
            CONGRATULATIONS!
          </div>

          <div
            className={`text-xl mb-4 transform transition-all duration-1000 delay-700 ${
              animationPhase === 'showing'
                ? 'translate-y-0 opacity-100'
                : 'translate-y-8 opacity-0'
            }`}
          >
            You got the player!
          </div>

          <div
            className={`bg-white bg-opacity-20 rounded-lg p-4 mb-4 transform transition-all duration-1000 delay-900 ${
              animationPhase === 'showing'
                ? 'translate-y-0 opacity-100'
                : 'translate-y-8 opacity-0'
            }`}
          >
            <div className="text-2xl font-bold text-yellow-200 mb-2">
              {playerName}
            </div>
            <div className="text-lg">
              Sold to{' '}
              <span className="font-bold text-yellow-200">{teamName}</span>
            </div>
            <div className="text-xl font-bold text-green-200 mt-2">
              ₹{soldPrice?.toLocaleString('en-IN')}
            </div>
          </div>

          <div
            className={`text-lg font-semibold transform transition-all duration-1000 delay-1100 ${
              animationPhase === 'showing'
                ? 'translate-y-0 opacity-100'
                : 'translate-y-8 opacity-0'
            }`}
          >
            🏆 Welcome to your team! 🏆
          </div>
        </div>

        {/* Celebration effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="confetti"></div>
        </div>
      </div>

      {/* Confetti CSS styles */}
      <style jsx>{`
        .confetti {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .confetti::before,
        .confetti::after {
          content: '';
          position: absolute;
          width: 10px;
          height: 10px;
          background: #ffd700;
          animation: confetti-fall 3s linear infinite;
        }

        .confetti::before {
          left: 10%;
          animation-delay: 0s;
        }

        .confetti::after {
          left: 90%;
          animation-delay: 1s;
          background: #ff6b6b;
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PlayerWonAnimation;
