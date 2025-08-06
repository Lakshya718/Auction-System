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
import sidebarLogo from '../assets/sidebar.png';

const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const user = useSelector((state) => state.user.user);
  const role = useSelector((state) => state.user.role); // Get role directly from Redux store
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // For debugging - can be removed later
  useEffect(() => {
    console.log('Current user in Navbar:', user);
    console.log('Current role in Navbar:', role);
  }, [user, role]);

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
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
        scrolled ? 'bg-gray-800 shadow-lg' : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          {user && (
            <button
              onClick={toggleSidebar}
              className={`p-2 rounded-full text-white focus:outline-none transition-all duration-300 ${isSidebarOpen ? 'invisible' : 'visible'}`}
              aria-label="Open sidebar"
            >
              <img
                src={sidebarLogo}
                alt="AuctionSphere"
                className="h-7 w-7 object-contain transition-transform duration-300 group-hover:scale-110"
              />
            </button>
          )}
          <Link
            to="/"
            className="flex items-center space-x-3 group"
            onClick={closeMobileMenu}
          >
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 hover:from-pink-600 hover:to-purple-400 transition-all duration-300">
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
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-300"
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
                <span className="relative z-10 text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-300">
                  All Auctions
                </span>
                <div className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-gradient-to-r from-purple-500/20 to-transparent rounded-lg"></div>
              </Link>
              <Link to="/all-matches" className="group relative px-4 py-2">
                <span className="relative z-10 text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-300">
                  All Matches
                </span>
                <div className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left bg-gradient-to-r from-purple-500/20 to-transparent rounded-lg"></div>
              </Link>
              {role === 'admin' && (
                <Link
                  to="/pending-players"
                  className="group relative px-4 py-2"
                >
                  <span className="relative z-10 text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-300">
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
            className="text-white hover:text-gray-300 focus:outline-none"
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
                  className="flex items-center space-x-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors duration-300 w-full"
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
  );
};

export default Navbar;
