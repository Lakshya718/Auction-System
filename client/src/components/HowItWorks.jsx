import React from 'react';
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
  const steps = [
    {
      icon: FaShieldAlt,
      title: 'Admin Login',
      description:
        'Securely log in to your admin dashboard to manage all aspects of your league.',
    },
    {
      icon: FaUsers,
      title: 'Create Players',
      description:
        'Add new players to your league with detailed profiles and statistics.',
    },
    {
      icon: FaTrophy,
      title: 'Create Auctions',
      description:
        'Set up auctions with customizable bidding rules and time limits.',
    },
    {
      icon: FaUserPlus,
      title: 'Register Players',
      description:
        'Team owners can register their players for upcoming auctions.',
    },
    {
      icon: FaUserClock,
      title: 'Review Pending',
      description: 'Admins review and approve pending player registrations.',
    },
    {
      icon: FaCalendarPlus,
      title: 'Schedule Matches',
      description:
        'Create and manage match schedules with automated notifications.',
    },
    {
      icon: FaChartLine,
      title: 'Analytics',
      description: 'Access comprehensive insights and performance metrics.',
    },
  ];

  return (
    <div className="bg-white py-16 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Simple steps to manage your auction league efficiently
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.slice(0, 4).map((step, index) => (
            <div
              key={index}
              className="group relative bg-white/30 backdrop-blur-md border border-black/10 rounded-xl p-6 hover:border-black/20 hover:bg-white/50 hover:shadow-[inset_0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer text-center overflow-hidden"
            >
              {/* Inner shadow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>

              {/* Icon */}
              <div className="relative z-10 inline-flex items-center justify-center w-14 h-14 rounded-xl bg-black/5 border border-black/10 mb-4 group-hover:bg-black/15 group-hover:shadow-inner transition-all duration-300">
                <step.icon className="text-xl text-black" />
              </div>

              {/* Content */}
              <h3 className="relative z-10 text-lg font-bold text-black mb-3">
                {step.title}
              </h3>
              <p className="relative z-10 text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Secondary Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {steps.slice(4, 7).map((step, index) => (
            <div
              key={index + 4}
              className="group relative bg-white/30 backdrop-blur-md border border-black/10 rounded-xl p-6 hover:border-black/20 hover:bg-white/50 hover:shadow-[inset_0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer text-center overflow-hidden"
            >
              {/* Inner shadow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>

              {/* Icon */}
              <div className="relative z-10 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-black/5 border border-black/10 mb-4 group-hover:bg-black/15 group-hover:shadow-inner transition-all duration-300">
                <step.icon className="text-lg text-black" />
              </div>

              {/* Content */}
              <h3 className="relative z-10 text-base font-bold text-black mb-3">
                {step.title}
              </h3>
              <p className="relative z-10 text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
