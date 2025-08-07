import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserPlus,
  FaUserClock,
  FaCalendarPlus,
  FaTachometerAlt,
  FaShieldAlt,
  FaUsers,
  FaTrophy,
  FaChartLine,
} from 'react-icons/fa';

const HowItWorks = () => {
  const navigate = useNavigate();

  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const steps = [
    {
      icon: FaShieldAlt,
      title: 'Admin Login',
      description:
        'Securely log in to your admin dashboard with multi-factor authentication to manage all aspects of your league.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-600/20 to-cyan-800/20',
    },
    {
      icon: FaUsers,
      title: 'Create Players',
      description:
        'Easily add new players to your league with detailed profiles, photos, and performance statistics.',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-600/20 to-pink-800/20',
    },
    {
      icon: FaTrophy,
      title: 'Create Auctions',
      description:
        'Set up exciting auctions with customizable bidding rules, starting prices, and time limits.',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-600/20 to-orange-800/20',
    },
    {
      icon: FaUserPlus,
      title: 'Register Players',
      description:
        'Team owners can seamlessly register their players for upcoming auctions with just a few clicks.',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-600/20 to-emerald-800/20',
    },
    {
      icon: FaUserClock,
      title: 'Review Pending',
      description:
        'Admins can efficiently review and approve pending player registrations to maintain league quality.',
      color: 'from-indigo-500 to-purple-500',
      bgColor: 'from-indigo-600/20 to-purple-800/20',
    },
    {
      icon: FaCalendarPlus,
      title: 'Schedule Matches',
      description:
        'Create and manage match schedules with automated notifications and conflict detection.',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'from-pink-600/20 to-rose-800/20',
    },
    {
      icon: FaChartLine,
      title: 'Analytics Dashboard',
      description:
        'Access comprehensive insights with real-time analytics, performance metrics, and detailed reports.',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'from-teal-600/20 to-cyan-800/20',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 py-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 mb-4">
            How AuctionSphere Works
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Streamlined league management from player registration to
            championship glory
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {steps.slice(0, 4).map((step, index) => (
            <div
              key={index}
              className={`group relative bg-gradient-to-br ${step.bgColor} backdrop-blur-sm p-5 rounded-xl border border-gray-700/50 hover:border-opacity-75 transform hover:scale-105 transition-all duration-300 cursor-pointer text-center`}
            >
              {/* Step Number */}
              <div className="absolute -top-3 -right-3 w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg">
                {index + 1}
              </div>

              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${step.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <step.icon className="text-lg text-white" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                {step.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Secondary Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {steps.slice(4, 7).map((step, index) => (
            <div
              key={index + 4}
              className={`group relative bg-gradient-to-br ${step.bgColor} backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 hover:border-opacity-75 transform hover:scale-105 transition-all duration-300 cursor-pointer text-center`}
            >
              {/* Step Number */}
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                {index + 5}
              </div>

              {/* Icon */}
              <div
                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${step.color} mb-3 group-hover:scale-110 transition-transform duration-300`}
              >
                <step.icon className="text-base text-white" />
              </div>

              {/* Content */}
              <h3 className="text-base font-bold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
          <h3 className="text-xl font-bold text-white mb-3">
            Ready to Transform Your League?
          </h3>
          <p className="text-gray-300 mb-5 max-w-xl mx-auto text-sm">
            Join thousands of league organizers who have streamlined their
            operations with AuctionSphere.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-semibold text-sm hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300"
              onClick={() => navigate('/register')}
            >
              Start Free Trial
            </button>
            <button
              className="border border-purple-500 text-purple-400 px-6 py-2 rounded-full font-semibold text-sm hover:bg-purple-500 hover:text-white transform hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={scrollToDemo}
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
