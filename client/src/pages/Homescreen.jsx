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
} from 'react-icons/fa';
import PlayerCard from '../components/PlayerCard'; // Assuming PlayerCard is in components
import ImageSlider from '../components/ImageSlider'; // Import ImageSlider
import HowItWorks from '../components/HowItWorks'; // Import HowItWorks component

// Dummy Data
const featuredPlayers = [
  {
    _id: '1',
    playerName: 'Lionel Messi',
    profilePhoto:
      'https://images.unsplash.com/photo-1671016233853-5db7def7ff76?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fG1lc3NpfGVufDB8fDB8fHww?q=80&w=1974&auto=format&fit=crop',
    playerRole: 'Forward',
  },
  {
    _id: '2',
    playerName: 'Christiano Ronaldo',
    profilePhoto:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7OKQoMdfiI57E8ytdxfrTaQ9TAwSGWIXaBQ&s?q=80&w=1998&auto=format&fit=crop',
    playerRole: 'Forward',
  },
  {
    _id: '3',
    playerName: 'Neymar Jr.',
    profilePhoto:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBTEMe9t7yAgoOzXgYa60XP-sCFi48LIGNfw&s?q=80&w=1930&auto=format&fit=crop',
    playerRole: 'Midfielder',
  },
];

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
      <section className="py-8 bg-gray-900 text-center">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-fade-in-down">
          Welcome, {user?.playerName || 'Champion'}!
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-300 max-w-xl mx-auto animate-fade-in-up animation-delay-300">
          The ultimate platform for player auctions. Build your dream team,
          dominate the league, and write your own legacy.
        </p>
        <div className="items-center justify-center flex">
          {user ? (
            <button
              onClick={handleProfileClick}
              className="mt-4 flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-full shadow-md transform hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out animate-fade-in-up animation-delay-600"
            >
              <span>Go to Your Dashboard</span>
              <FaArrowRight className="text-sm" />
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="mt-4 flex items-center justify-center gap-2 px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-semibold rounded-full shadow-md transform hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out animate-fade-in-up animation-delay-600"
            >
              <span>Get Started</span>
              <FaArrowRight className="text-sm" />
            </button>
          )}
        </div>
      </section>

      {/* Featured Players Section */}
      <section className="py-12 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-3">
            <FaUsers /> Featured Players
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPlayers.map((player) => (
              <div
                key={player._id}
                className="transform hover:-translate-y-2 transition-transform duration-300"
              >
                <PlayerCard player={player} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest News Section */}
      <section className="py-12 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3">
            <FaNewspaper /> Latest News
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {latestNews.map((news) => (
              <div
                key={news.id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300"
              >
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{news.title}</h3>
                  <p className="text-gray-400">{news.summary}</p>
                  <a
                    href="#"
                    className="inline-block mt-4 text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    See More <FaArrowRight className="inline ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section>
        <HowItWorks />
      </section>
      {/* About Us Section */}
      <section className="py-12 bg-gray-800 text-center">
        <h2 className="text-3xl font-bold mb-3">
          <FaInfoCircle className="inline-block mr-2" />
          About AuctionSphere
        </h2>
        <p className="text-base text-gray-400 mb-6 max-w-3xl mx-auto">
          AuctionSphere is a revolutionary platform designed to bring the
          excitement of sports auctions to fans and team owners worldwide.
        </p>
        <div className="flex justify-center flex-wrap">
          <div className="flex flex-col items-center mx-4 my-4">
            <h3 className="text-xl font-bold">Lakshya Kantiwal</h3>
            <div className="flex justify-center space-x-4 mt-2">
              <a
                href="https://github.com/Lakshya718"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <FaGithub size={24} />
              </a>
              <a
                href="https://www.linkedin.com/in/lakshya-kantiwal-253a8925a/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
          <div className="flex flex-col items-center mx-4 my-4">
            <h3 className="text-xl font-bold">Yuvraj Singh</h3>
            <div className="flex justify-center space-x-4 mt-2">
              <a
                href="https://github.com/yuvraj-singh-cs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <FaGithub size={24} />
              </a>
              <a
                href="https://www.linkedin.com/in/yuvraj-singh-rajput-12489925a/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white"
              >
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homescreen;
