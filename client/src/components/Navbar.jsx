import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaUserPlus,
  FaSignInAlt,
  FaUserCircle,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import React, { useState, useEffect } from 'react';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const user = useSelector((state) => state.user.user);
  const role = useSelector((state) => state.user.role); // Get role directly from Redux store
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // For debugging - can be removed later
  useEffect(() => {}, [user, role]);

  const handleProfileClick = () => {
    navigate('/profile');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    closeMobileMenu();
  };

  useEffect(() => {
    const handleScroll = () => {
      const navbarHeight = 64;
      if (window.scrollY > window.innerHeight - navbarHeight) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
          scrolled
            ? 'bg-gray-800/30 backdrop-blur-sm shadow-lg'
            : 'bg-transparent'
        }`}
      >
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {user && (
              <button
                onClick={toggleSidebar}
                className={`p-2 rounded-full focus:outline-none transition-all duration-300 ${isSidebarOpen ? 'invisible' : 'visible'} ${
                  scrolled
                    ? 'text-black hover:text-gray-700'
                    : 'text-blue-400 hover:text-blue-300'
                }`}
                aria-label="Open sidebar"
              >
                <FaBars className="h-6 w-6 transition-transform duration-300 hover:scale-110" />
              </button>
            )}
            <Link
              to="/"
              className="flex items-center space-x-3 group"
              onClick={closeMobileMenu}
            >
              <span
                className={`text-2xl font-bold transition-all duration-300 ${
                  scrolled
                    ? 'text-black'
                    : 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-yellow-400 hover:from-yellow-400 hover:to-blue-400'
                }`}
              >
                AuctionSphere
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-md transition-all duration-300 shadow-md"
                >
                  <FaUserPlus />
                  <span>Register</span>
                </Link>
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-md transition-all duration-300 shadow-md"
                >
                  <FaSignInAlt />
                  <span>Login</span>
                </Link>
              </>
            ) : (
              <div className="flex items-center space-x-6">
                <Link to="/all-auctions" className="group relative px-4 py-2">
                  <span
                    className={`relative z-10 text-sm font-medium transition-colors duration-300 ${
                      scrolled
                        ? 'text-black group-hover:text-gray-700'
                        : 'text-gray-300 group-hover:text-white'
                    }`}
                  >
                    All Auctions
                  </span>
                  <div className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-gradient-to-r from-purple-500/20 to-transparent rounded-lg"></div>
                </Link>
                <Link to="/all-matches" className="group relative px-4 py-2">
                  <span
                    className={`relative z-10 text-sm font-medium transition-colors duration-300 ${
                      scrolled
                        ? 'text-black group-hover:text-gray-700'
                        : 'text-gray-300 group-hover:text-white'
                    }`}
                  >
                    All Matches
                  </span>
                  <div className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-gradient-to-r from-purple-500/20 to-transparent rounded-lg"></div>
                </Link>
                <Link to="/live-matches" className="group relative px-4 py-2">
                  <span
                    className={`relative z-10 text-sm font-medium transition-colors duration-300 ${
                      scrolled
                        ? 'text-black group-hover:text-gray-700'
                        : 'text-gray-300 group-hover:text-white'
                    }`}
                  >
                    Live Cricket
                  </span>
                  <div className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-gradient-to-r from-green-500/20 to-transparent rounded-lg"></div>
                </Link>
                {role === 'admin' && (
                  <Link
                    to="/pending-players"
                    className="group relative px-4 py-2"
                  >
                    <span
                      className={`relative z-10 text-sm font-medium transition-colors duration-300 ${
                        scrolled
                          ? 'text-black group-hover:text-gray-700'
                          : 'text-gray-300 group-hover:text-white'
                      }`}
                    >
                      Pending Players
                    </span>
                    <div className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-gradient-to-r from-purple-500/20 to-transparent rounded-lg"></div>
                  </Link>
                )}
                <div className="h-6 w-[1px] bg-gradient-to-b from-transparent via-gray-500/50 to-transparent"></div>
                <button
                  onClick={handleProfileClick}
                  className="relative w-8 h-8 rounded-full overflow-hidden border-[1.5px] border-purple-500 hover:border-pink-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Go to Profile"
                >
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaUserCircle className="w-full h-full text-gray-400" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className={`focus:outline-none transition-colors duration-300 ${
                scrolled
                  ? 'text-black hover:text-gray-700'
                  : 'text-white hover:text-gray-300'
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-gray-800 shadow-lg">
            <div className="px-4 py-4 space-y-4">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-md transition-all duration-300 shadow-md w-full"
                    onClick={closeMobileMenu}
                  >
                    <FaUserPlus />
                    <span>Register</span>
                  </Link>
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-md transition-all duration-300 shadow-md w-full"
                    onClick={closeMobileMenu}
                  >
                    <FaSignInAlt />
                    <span>Login</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/all-auctions"
                    className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors duration-300"
                    onClick={closeMobileMenu}
                  >
                    All Auctions
                  </Link>
                  <Link
                    to="/all-matches"
                    className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors duration-300"
                    onClick={closeMobileMenu}
                  >
                    All Matches
                  </Link>
                  {role === 'admin' && (
                    <Link
                      to="/pending-players"
                      className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors duration-300"
                      onClick={closeMobileMenu}
                    >
                      Pending Players
                    </Link>
                  )}
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors duration-300 w-full text-left"
                  >
                    <FaUserCircle />
                    <span>Profile</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Floating Scroll to Top Button */}
      {scrolled && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-40 p-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          aria-label="Scroll to top"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      )}
    </>
  );
};

export default Navbar;
