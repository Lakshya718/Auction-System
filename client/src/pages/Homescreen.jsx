import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaArrowRight,
  FaNewspaper,
  FaUsers,
  FaGithub,
  FaLinkedin,
  FaTrophy,
  FaStar,
  FaQuoteLeft,
  FaPlay,
  FaShieldAlt,
  FaBolt,
  FaGlobe,
  FaRocket,
  FaHeart,
  FaCheckCircle,
} from 'react-icons/fa';
import ImageSlider from '../components/ImageSlider'; // Import ImageSlider
import HowItWorks from '../components/HowItWorks'; // Import HowItWorks component

const Homescreen = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Image Slider Section (Full Width) */}
      <ImageSlider />

      {/* Welcome Section (Now below slider, full width) */}
      <section className="py-16 bg-gray-100 text-center relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Welcome, {user?.playerName || 'Champion'}!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              The ultimate platform for player auctions. Build your dream team
              and dominate the league.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-12">
            {user ? (
              <button
                onClick={handleProfileClick}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white text-base font-semibold rounded-lg hover:bg-gray-800 transition-all duration-300"
              >
                <span>Go to Your Dashboard</span>
                <FaArrowRight className="text-base" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-black text-white text-base font-semibold rounded-lg hover:bg-gray-800 transition-all duration-300"
                >
                  <span>Get Started</span>
                  <FaArrowRight className="text-base" />
                </button>
                <button
                  onClick={() => navigate('/news')}
                  className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-black text-black text-base font-semibold rounded-lg hover:bg-black hover:text-white transition-all duration-300"
                >
                  <FaNewspaper className="text-base" />
                  <span>Latest News</span>
                </button>
              </>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: FaTrophy,
                title: '2500+ Auctions',
                subtitle: 'Successfully Completed',
              },
              {
                icon: FaUsers,
                title: '125K+ Players',
                subtitle: 'Active Community',
              },
              {
                icon: FaGlobe,
                title: '45+ Countries',
                subtitle: 'Global Reach',
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="group bg-white/50 backdrop-blur-md border border-black/10 rounded-xl p-6 hover:border-black/20 hover:bg-white/70 hover:shadow-lg transition-all duration-300 cursor-pointer text-center"
              >
                <stat.icon className="text-3xl text-black mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                <div className="text-xl font-bold text-black mb-1">
                  {stat.title}
                </div>
                <div className="text-gray-600 text-sm">{stat.subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <HowItWorks />
      </section>

      {/* Quick Start Guide Section */}
      <section className="py-16 bg-gray-100 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Get Started in Minutes
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Follow these simple steps to join the auction revolution
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Create Account',
                description: 'Sign up with your email or social account',
                icon: FaUsers,
              },
              {
                title: 'Set Up Profile',
                description:
                  'Complete profile and choose role (Player/Team Owner)',
                icon: FaShieldAlt,
              },
              {
                title: 'Verify Account',
                description: 'Complete verification process for registration',
                icon: FaCheckCircle,
              },
              {
                title: 'Start Bidding',
                description: 'Join live auctions and build your dream team',
                icon: FaTrophy,
              },
            ].map((step, index) => (
              <div
                key={index}
                className="group relative bg-white/70 backdrop-blur-md border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:bg-white/90 hover:shadow-lg transition-all duration-300 cursor-pointer text-center"
              >
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gray-50 border border-gray-200 mb-4 group-hover:bg-gray-100 transition-all duration-300">
                  <step.icon className="text-xl text-gray-700" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="h-[12vh] min-h-[80px] bg-gradient-to-br from-gray-800 via-gray-900 to-black relative overflow-hidden flex items-center">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-sky-500/20 to-yellow-500/20"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Connect With Us - One Line */}
          <div className="flex items-center justify-center gap-4">
            <span className="text-lg font-medium text-gray-300">
              Connect with us:
            </span>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/Lakshya718/Auction-System"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/70 transition-all duration-300 transform hover:scale-110"
              >
                <FaGithub className="text-xl text-white hover:text-blue-400 transition-colors duration-300" />
              </a>
              <a
                href="https://www.linkedin.com/in/lakshya-kantiwal-253a8925a/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-blue-600/80 hover:bg-blue-500/90 transition-all duration-300 transform hover:scale-110"
              >
                <FaLinkedin className="text-xl text-white" />
              </a>
              <a
                href="https://www.linkedin.com/in/yuvraj-singh-rajput-12489925a/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-blue-600/80 hover:bg-blue-500/90 transition-all duration-300 transform hover:scale-110"
              >
                <FaLinkedin className="text-xl text-white" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homescreen;
