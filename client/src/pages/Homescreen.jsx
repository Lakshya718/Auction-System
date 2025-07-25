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
      'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=1998&auto=format&fit=crop',
    playerRole: 'Forward',
  },
  {
    _id: '3',
    playerName: 'Neymar Jr.',
    profilePhoto:
      'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?q=80&w=1930&auto=format&fit=crop',
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
      'data:image/jpeg;base64,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',
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
      <section className="py-20 bg-gray-900 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-fade-in-down">
          Welcome, {user?.playerName || 'Champion'}!
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto animate-fade-in-up animation-delay-300">
          The ultimate platform for player auctions. Build your dream team,
          dominate the league, and write your own legacy.
        </p>
        <div className='items-center justify-center flex'>
          <button
            onClick={handleProfileClick}
            className="mt-8 flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-full shadow-lg transform hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-in-out animate-fade-in-up animation-delay-600"
          >
            <span>Go to Your Dashboard</span>
            <FaArrowRight />
          </button>
        </div>
      </section>

      {/* Featured Players Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 flex items-center justify-center gap-4">
            <FaUsers /> Featured Players
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 flex items-center justify-center gap-4">
            <FaNewspaper /> Latest News
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {latestNews.map((news) => (
              <div
                key={news.id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300"
              >
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{news.title}</h3>
                  <p className="text-gray-400">{news.summary}</p>
                  <a
                    href="#"
                    className="inline-block mt-4 text-purple-400 hover:text-purple-300 font-semibold"
                  >
                    Read More <FaArrowRight className="inline ml-1" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section>
        <HowItWorks/>
</section>
      {/* About Us Section */}
      <section className="py-20 bg-gray-800 text-center">
        <h2 className="text-4xl font-bold mb-4">
          <FaInfoCircle className="inline-block mr-2" />
          About AuctionSphere
        </h2>
        <p className="text-lg text-gray-400 mb-8">
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
