import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaArrowRight,
  FaNewspaper,
  FaUsers,
  FaInfoCircle,
  FaGithub,
  FaLinkedin,
  FaTrophy,
  FaChartLine,
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
import PlayerCard from '../components/PlayerCard'; // Assuming PlayerCard is in components
import ImageSlider from '../components/ImageSlider'; // Import ImageSlider
import HowItWorks from '../components/HowItWorks'; // Import HowItWorks component

const latestNews = [
  {
    id: 1,
    title: 'Auction Season Kicks Off with a Bang!',
    summary:
      'The much-anticipated auction season has finally begun, with teams battling it out for the best talent in the league...',
    image:
      'https://kheltoday.com/wp-content/uploads/2023/10/Bengal-Warriors-management-during-the-PKL-Season-10-Player-Auction-scaled.jpg',
  },
  {
    id: 2,
    title: 'New Record Set for Most Expensive Player',
    summary:
      'A new record was set today as a star player was sold for a staggering amount, shattering all previous records...',
    image:
      'https://uccricket.live/wp-content/uploads/2024/11/Rishab-Pant-768x368.webp',
  },
];

// New data for additional sections
const testimonials = [
  {
    id: 1,
    name: 'Alex Rodriguez',
    role: 'Team Owner - Lightning Bolts',
    image:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    quote:
      'AuctionSphere revolutionized how we build our team. The platform is intuitive and the real-time bidding creates an incredible atmosphere.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'Professional Player',
    image:
      'https://images.unsplash.com/photo-1494790108755-2616b612b2fd?w=150&h=150&fit=crop&crop=face',
    quote:
      'As a player, I love how transparent and fair the auction process is. It gave me the opportunity to showcase my value.',
    rating: 5,
  },
  {
    id: 3,
    name: 'Michael Thompson',
    role: 'League Commissioner',
    image:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    quote:
      'The analytics and insights provided by AuctionSphere help us make better decisions and create more competitive leagues.',
    rating: 5,
  },
];

const recentAuctions = [
  {
    id: 1,
    name: 'Football Premier League Auction 2025',
    status: 'completed',
    totalPlayers: 156,
    totalValue: '$45.2M',
    image:
      'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=250&fit=crop',
    date: '2025-08-05',
    sport: 'Football',
  },
  {
    id: 2,
    name: 'Basketball Championship Draft',
    status: 'live',
    totalPlayers: 89,
    totalValue: '$23.8M',
    image:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=250&fit=crop',
    date: '2025-08-07',
    sport: 'Basketball',
  },
  {
    id: 3,
    name: 'Cricket Champions League Auction',
    status: 'upcoming',
    totalPlayers: 78,
    totalValue: '$12.5M',
    image:
      'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=250&fit=crop&auto=format&q=60',
    date: '2025-08-10',
    sport: 'Kabaddi',
  },
  {
    id: 4,
    name: 'Volleyball World Series Auction',
    status: 'upcoming',
    totalPlayers: 64,
    totalValue: '$8.9M',
    image:
      'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=250&fit=crop',
    date: '2025-08-12',
    sport: 'Volleyball',
  },
];

const Homescreen = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen">
      {/* Image Slider Section (Full Width) */}
      <ImageSlider />

      {/* Welcome Section (Now below slider, full width) */}
      <section className="py-12 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-center relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-float"
            style={{ animationDelay: '1s' }}
          ></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 animate-gradient mb-4">
            Welcome, {user?.playerName || 'Champion'}!
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed">
            The ultimate platform for player auctions. Build your dream team,
            dominate the league, and write your own legacy in the world of
            sports.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            {user ? (
              <button
                onClick={handleProfileClick}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-base font-semibold rounded-full shadow-lg transform hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out animate-pulse-glow"
              >
                <span>Go to Your Dashboard</span>
                <FaArrowRight className="text-base" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-base font-semibold rounded-full shadow-lg transform hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out"
                >
                  <span>Get Started</span>
                  <FaArrowRight className="text-base" />
                </button>
                <button
                  onClick={() => navigate('/news')}
                  className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-purple-500 text-purple-400 text-base font-semibold rounded-full hover:bg-purple-500 hover:text-white transform hover:scale-105 transition-all duration-300 ease-in-out"
                >
                  <FaNewspaper className="text-base" />
                  <span>Latest News</span>
                </button>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
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
              <div key={index} className="group cursor-pointer">
                <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50 hover:border-purple-500/50 transform hover:scale-105 transition-all duration-300">
                  <stat.icon className="text-3xl text-purple-400 mx-auto mb-2 group-hover:text-pink-400 transition-colors duration-300" />
                  <div className="text-xl font-bold text-white mb-1">
                    {stat.title}
                  </div>
                  <div className="text-gray-400 text-sm">{stat.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Auctions Section */}
      <section className="py-12 bg-gradient-to-br from-purple-900/20 to-pink-900/20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              <FaTrophy className="inline-block mr-2" />
              Recent Sports Auctions
            </h2>
            <p className="text-gray-300 text-base max-w-2xl mx-auto mb-4">
              Explore auction events across Football, Basketball, Kabaddi, and
              Volleyball
            </p>
            <button
              onClick={() => navigate('/auctions')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 text-sm font-semibold"
            >
              View All Auctions <FaArrowRight className="inline ml-1" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentAuctions.map((auction) => (
              <div
                key={auction.id}
                className="bg-gray-800/70 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-gray-700/50 hover:border-purple-500/50 transform hover:scale-105 transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={auction.image}
                    alt={auction.name}
                    className="w-full h-36 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold ${
                        auction.status === 'live'
                          ? 'bg-green-500 text-white animate-pulse'
                          : auction.status === 'completed'
                            ? 'bg-gray-500 text-white'
                            : 'bg-yellow-500 text-black'
                      }`}
                    >
                      {auction.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-semibold">
                      {auction.sport}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {auction.name}
                  </h3>
                  <div className="space-y-1 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Players</span>
                      <span className="text-purple-400 font-semibold">
                        {auction.totalPlayers}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Value</span>
                      <span className="text-green-400 font-semibold">
                        {auction.totalValue}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold text-sm"
                  >
                    {auction.status === 'live'
                      ? 'Join Live'
                      : auction.status === 'upcoming'
                        ? 'Register'
                        : 'View Results'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Stats Section */}
      <section className="py-12 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              <FaChartLine className="inline-block mr-2" />
              Platform at a Glance
            </h2>
            <p className="text-gray-300 text-base max-w-2xl mx-auto">
              Numbers that showcase our growing community and successful
              auctions
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: FaUsers,
                label: 'Active Players',
                value: '125K+',
                color: 'from-blue-400 to-blue-600',
              },
              {
                icon: FaTrophy,
                label: 'Completed Auctions',
                value: '2,500+',
                color: 'from-yellow-400 to-yellow-600',
              },
              {
                icon: FaGlobe,
                label: 'Countries',
                value: '45+',
                color: 'from-green-400 to-green-600',
              },
              {
                icon: FaBolt,
                label: 'Live Bids/Min',
                value: '850+',
                color: 'from-purple-400 to-purple-600',
              },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center group cursor-pointer transform hover:scale-110 transition-all duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r ${stat.color} mb-3 group-hover:shadow-lg group-hover:shadow-current/25`}
                >
                  <stat.icon className="text-xl text-white" />
                </div>
                <div
                  className={`text-3xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}
                >
                  {stat.value}
                </div>
                <p className="text-gray-400 text-sm font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories / Testimonials Section */}
      <section className="py-12 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/6 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/6 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              <FaStar className="inline-block mr-2" />
              Success Stories
            </h2>
            <p className="text-gray-300 text-base max-w-2xl mx-auto">
              Hear from our community of players, team owners, and league
              organizers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-gray-800/70 backdrop-blur-sm p-5 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transform hover:scale-105 transition-all duration-300 relative"
              >
                <FaQuoteLeft className="text-purple-400 text-xl mb-3 opacity-70" />
                <p className="text-gray-300 mb-4 leading-relaxed italic text-sm line-clamp-3">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-purple-500"
                  />
                  <div>
                    <h4 className="font-semibold text-white text-sm">
                      {testimonial.name}
                    </h4>
                    <p className="text-xs text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mt-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400 text-xs" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Video Section */}
      <section id="demo-section" className="py-12 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              <FaPlay className="inline-block mr-2" />
              See AuctionSphere in Action
            </h2>
            <p className="text-gray-300 text-base mb-6 max-w-xl mx-auto">
              Watch how our platform transforms the auction experience with
              cutting-edge technology
            </p>

            <div
              className="relative group cursor-pointer"
              onClick={scrollToDemo}
            >
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-1">
                <div className="bg-gray-800 rounded-lg p-6 md:p-12 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20"></div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                      <FaPlay className="text-purple-600 text-2xl ml-1" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      Platform Demo
                    </h3>
                    <p className="text-gray-300 max-w-md mx-auto text-sm">
                      Experience the future of sports auctions with our
                      interactive demo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose AuctionSphere Section */}
      <section className="py-12 bg-gradient-to-br from-blue-900/30 to-purple-900/30 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              <FaRocket className="inline-block mr-2" />
              Why Choose AuctionSphere?
            </h2>
            <p className="text-gray-300 text-base max-w-2xl mx-auto">
              Experience the next generation of sports auctions with modern
              features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              {
                icon: FaShieldAlt,
                title: 'Secure & Transparent',
                description:
                  'Bank-grade security with full transparency in every transaction',
                color: 'from-green-400 to-emerald-600',
                bgColor: 'from-green-600/20 to-emerald-800/20',
              },
              {
                icon: FaBolt,
                title: 'Real-time Bidding',
                description:
                  'Lightning-fast bids with instant updates and live notifications',
                color: 'from-yellow-400 to-orange-600',
                bgColor: 'from-yellow-600/20 to-orange-800/20',
              },
              {
                icon: FaChartLine,
                title: 'Advanced Analytics',
                description:
                  'AI-powered insights and detailed performance metrics',
                color: 'from-blue-400 to-cyan-600',
                bgColor: 'from-blue-600/20 to-cyan-800/20',
              },
              {
                icon: FaGlobe,
                title: 'Global Community',
                description:
                  'Connect with players and teams from around the world',
                color: 'from-purple-400 to-pink-600',
                bgColor: 'from-purple-600/20 to-pink-800/20',
              },
              {
                icon: FaUsers,
                title: 'Expert Support',
                description: '24/7 dedicated support from auction specialists',
                color: 'from-indigo-400 to-purple-600',
                bgColor: 'from-indigo-600/20 to-purple-800/20',
              },
              {
                icon: FaTrophy,
                title: 'Proven Success',
                description:
                  'Join thousands of successful auctions and happy users',
                color: 'from-orange-400 to-red-600',
                bgColor: 'from-orange-600/20 to-red-800/20',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br ${feature.bgColor} p-5 rounded-xl border border-gray-700/50 hover:border-opacity-75 transform hover:scale-105 transition-all duration-300 group`}
              >
                <div
                  className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${feature.color} mb-3 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="text-lg text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold text-base hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start Your Journey Today
            </button>
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-10 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FaNewspaper /> Latest News
            </h2>
            <button
              onClick={() => navigate('/news')}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 text-sm"
            >
              View All News <FaArrowRight className="text-xs" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {latestNews.map((news) => (
              <div
                key={news.id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300"
              >
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-56 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-lg font-bold mb-2">{news.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                    {news.summary}
                  </p>
                  <a
                    onClick={() => navigate('/news')}
                    className="inline-block hover:cursor-pointer text-purple-400 hover:text-purple-300 font-semibold transition-colors text-sm"
                  >
                    See More <FaArrowRight className="inline ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Build Your Dream Team?
            </h2>
            <p className="text-lg text-white/90 mb-6 max-w-xl mx-auto leading-relaxed">
              Join thousands of teams and players who trust AuctionSphere for
              their auction needs. Start your journey to championship glory
              today!
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
              <button
                onClick={() => navigate('/register')}
                className="bg-white text-purple-600 px-6 py-3 rounded-full font-bold text-base hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Free Trial
              </button>
              <button
                onClick={scrollToDemo}
                className="border-2 border-white text-white px-6 py-3 rounded-full font-bold text-base hover:bg-white hover:text-purple-600 transform hover:scale-105 transition-all duration-300"
              >
                Watch Demo
              </button>
            </div>

            <div className="flex justify-center items-center gap-6 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400" />
                <span>No Setup Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-400" />
                <span>Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <HowItWorks />
      </section>

      {/* Quick Start Guide Section */}
      <section className="py-12 bg-gray-900 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              <FaRocket className="inline-block mr-2" />
              Get Started in Minutes
            </h2>
            <p className="text-gray-300 text-base max-w-2xl mx-auto">
              Follow these simple steps to join the auction revolution
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Create Account',
                  description: 'Sign up with your email or social account',
                  icon: FaUsers,
                  color: 'from-blue-500 to-cyan-500',
                },
                {
                  step: '02',
                  title: 'Set Up Profile',
                  description:
                    'Complete profile and choose role (Player/Team Owner)',
                  icon: FaShieldAlt,
                  color: 'from-purple-500 to-pink-500',
                },
                {
                  step: '03',
                  title: 'Verify Account',
                  description: 'Complete verification process for registration',
                  icon: FaCheckCircle,
                  color: 'from-green-500 to-emerald-500',
                },
                {
                  step: '04',
                  title: 'Start Bidding',
                  description: 'Join live auctions and build your dream team',
                  icon: FaTrophy,
                  color: 'from-orange-500 to-red-500',
                },
              ].map((step, index) => (
                <div key={index} className="relative">
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-0">
                      <FaArrowRight className="text-2xl text-gray-700" />
                    </div>
                  )}
                  <div className="bg-gray-800/70 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transform hover:scale-105 transition-all duration-300 relative z-10 text-center">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${step.color} mb-4 mx-auto`}
                    >
                      <step.icon className="text-lg text-white" />
                    </div>
                    <div
                      className={`text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r ${step.color} opacity-20`}
                    >
                      {step.step}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-12 bg-gradient-to-br from-gray-800 via-gray-900 to-black relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-500/20 to-pink-500/20"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              <FaInfoCircle className="inline-block mr-2" />
              About AuctionSphere
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Revolutionizing sports auctions with cutting-edge technology and
              unparalleled user experience
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
                <h3 className="text-xl font-bold text-purple-400 mb-3">
                  Our Mission
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  To democratize sports team building by providing a
                  transparent, fair, and exciting platform where talent meets
                  opportunity. We believe every player deserves a chance to
                  shine and every team deserves access to the best talent.
                </p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm p-5 rounded-xl border border-gray-700/50 hover:border-pink-500/50 transition-all duration-300">
                <h3 className="text-xl font-bold text-pink-400 mb-3">
                  Our Vision
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  To become the global standard for sports auctions, fostering a
                  community where innovation, fairness, and passion for sports
                  converge to create extraordinary team-building experiences.
                </p>
              </div>
            </div>

            {/* Right Content - Features */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-6">
                Why Choose AuctionSphere?
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 p-3 rounded-lg border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105">
                  <div className="text-purple-400 text-xl mb-2">🚀</div>
                  <h4 className="text-base font-semibold text-white mb-1">
                    Real-time Bidding
                  </h4>
                  <p className="text-gray-300 text-xs">
                    Experience the thrill of live auctions with instant updates
                  </p>
                </div>

                <div className="bg-gradient-to-br from-pink-600/20 to-pink-800/20 p-3 rounded-lg border border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 transform hover:scale-105">
                  <div className="text-pink-400 text-xl mb-2">🔒</div>
                  <h4 className="text-base font-semibold text-white mb-1">
                    Secure Transactions
                  </h4>
                  <p className="text-gray-300 text-xs">
                    Bank-grade security for all your auction activities
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 p-3 rounded-lg border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105">
                  <div className="text-blue-400 text-xl mb-2">📊</div>
                  <h4 className="text-base font-semibold text-white mb-1">
                    Advanced Analytics
                  </h4>
                  <p className="text-gray-300 text-xs">
                    AI-powered insights to make informed decisions
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 p-3 rounded-lg border border-green-500/30 hover:border-green-400/50 transition-all duration-300 transform hover:scale-105">
                  <div className="text-green-400 text-xl mb-2">🌍</div>
                  <h4 className="text-base font-semibold text-white mb-1">
                    Global Reach
                  </h4>
                  <p className="text-gray-300 text-xs">
                    Connect with players and teams worldwide
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-1">
                500K+
              </div>
              <p className="text-gray-400 text-xs">Registered Players</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-1">
                1,200+
              </div>
              <p className="text-gray-400 text-xs">Active Teams</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-1">
                50M+
              </div>
              <p className="text-gray-400 text-xs">Total Bids Placed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-1">
                99.9%
              </div>
              <p className="text-gray-400 text-xs">Platform Uptime</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="mt-10 text-center">
            <h3 className="text-lg font-bold text-white mb-4">
              Connect With Us
            </h3>
            <div className="flex justify-center gap-4">
              <a
                href="https://github.com/Lakshya718/Auction-System"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition-colors transform hover:scale-110"
              >
                <FaGithub className="text-xl text-white" />
              </a>
              <a
                href="https://www.linkedin.com/in/lakshya-kantiwal-253a8925a/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-500 p-2 rounded-full transition-colors transform hover:scale-110"
              >
                <FaLinkedin className="text-xl text-white" />
              </a>
              <a
                href="https://www.linkedin.com/in/yuvraj-singh-rajput-12489925a/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-500 p-2 rounded-full transition-colors transform hover:scale-110"
              >
                <FaLinkedin className="text-xl text-white" />
              </a>
            </div>
            <p className="text-gray-400 text-xs mt-3">
              Built with ❤️ by the AuctionSphere Team | © 2025 All Rights
              Reserved
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homescreen;
