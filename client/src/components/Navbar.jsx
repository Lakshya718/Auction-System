import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaUserPlus, FaSignInAlt, FaUserCircle } from "react-icons/fa";
import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  const handleProfileClick = () => {
    navigate("/profile");
  };

  useEffect(() => {
    const handleScroll = () => {
      // Assuming Navbar height is around 64px (py-4 + some padding/margin)
      // The ImageSlider is h-screen, so it takes up the full viewport height.
      // We want the Navbar to become opaque when the user scrolls past the initial view of the ImageSlider.
      // A good threshold would be when the scroll position is greater than the viewport height minus the navbar's height.
      const navbarHeight = 64; // Approximate height of your navbar
      if (window.scrollY > window.innerHeight - navbarHeight) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${scrolled ? 'bg-gray-800 shadow-lg' : 'bg-transparent'}`}>
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 hover:from-pink-600 hover:to-purple-400 transition-all duration-300">
          AuctionSphere
        </Link>
        <div className="flex items-center space-x-4">
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
            <button
              onClick={handleProfileClick}
              className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500 hover:border-pink-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;