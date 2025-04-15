import { useNavigate } from "react-router-dom";
export default function Navbar() {
  const navigate = useNavigate();
  return (
      <nav className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white">
        {/* Left Side - Auction System Name */}
        <div className="text-xl font-bold hover:cursor-pointer" onClick={() => navigate('/')}>Auction System</div>
  
        {/* Middle - Navigation Links */}
        <div className="flex space-x-6">
          <a href="#about" className="hover:text-gray-300">About</a>
          <a href="#events" className="hover:text-gray-300">Events</a>
          <a href="#register-team" className="hover:text-gray-300">Register as Team</a>
          <a href="#register-player" className="hover:text-gray-300">Register as Player</a>
        </div>
  
        {/* Right Side - Player Icon */}
        <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center cursor-pointer">
          <span className="text-sm"onClick={() => navigate('/admin')}>P</span> {/* Placeholder for Player Icon/Image */}
        </div>
      </nav>
    );
  }
  