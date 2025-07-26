import React, { useState, useRef, useEffect } from "react";
import sidebarImage from "../assets/sidebar.png"; 
import {
  FaHome,
  FaUsers,
  FaUserPlus,
  FaList,
  FaUserShield,
  FaPlusCircle,
  FaClipboardList,
  FaCalendarAlt,
  FaBars,
  FaTimes,
  FaTachometerAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const allMenuItems = [
    { icon: <FaTachometerAlt />, label: "Dashboard", path: "/", roles: ["admin", "team_owner"] },
    { icon: <FaHome />, label: "All Auctions", path: "/all-auctions", roles: ["admin", "team_owner"] },
    { icon: <FaUsers />, label: "All Players", path: "/all-players", roles: ["admin"] },
    { icon: <FaUserPlus />, label: "Add Player", path: "/add-player", roles: ["admin"] },
    { icon: <FaList />, label: "All Teams", path: "/all-teams", roles: ["admin"] },
    { icon: <FaUserShield />, label: "Team Profile", path: "/team-profile", roles: ["team_owner"] },
    { icon: <FaPlusCircle />, label: "Create Auction", path: "/create-auction", roles: ["admin"] },
    { icon: <FaClipboardList />, label: "Pending Requests", path: "/pending-players", roles: ["admin"] },
    { icon: <FaCalendarAlt />, label: "Create Match", path: "/matches/create", roles: ["admin"] },
  ];

  const menuItems = allMenuItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Hamburger button - Visible only when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-5 left-0 z-50 p-2 rounded-full text-white focus:outline-none transition-all duration-300"
          aria-label="Open sidebar"
        >
          <img src={sidebarImage} className="h-5 w-5" alt="" srcset="" />
        </button>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white w-72 p-6 flex flex-col space-y-8 transform transition-transform duration-300 ease-in-out z-40 shadow-2xl ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* This div maintains the top spacing */}
        <div className="flex justify-between items-center py-6">
            {/* Content removed to keep space without text/icon */}
        </div>

        <nav className="flex flex-col space-y-2 flex-grow">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false); // close sidebar on navigation
              }}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 focus:outline-none transition-all duration-300 group"
              title={item.label}
            >
              <span className="text-xl text-gray-400 group-hover:text-white transition-colors duration-300">{item.icon}</span>
              <span className="text-lg font-medium text-gray-300 group-hover:text-white transition-colors duration-300">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto">
            <p className="text-center text-xs text-gray-500">© 2025 AuctionSphere. All rights reserved.</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;