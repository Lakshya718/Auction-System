import React, { useRef, useEffect } from 'react';
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
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ role, isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  const allMenuItems = [
    {
      icon: <FaTachometerAlt />,
      label: 'Dashboard',
      path: '/profile',
      roles: ['admin', 'team_owner'],
    },
    {
      icon: <FaList />,
      label: 'All Auctions',
      path: '/all-auctions',
      roles: ['admin', 'team_owner'],
    },
    {
      icon: <FaUsers />,
      label: 'All Players',
      path: '/all-players',
      roles: ['admin'],
    },
    {
      icon: <FaUserPlus />,
      label: 'Add Player',
      path: '/add-player',
      roles: ['admin'],
    },
    {
      icon: <FaList />,
      label: 'All Teams',
      path: '/all-teams',
      roles: ['admin'],
    },
    {
      icon: <FaUserShield />,
      label: 'Team Profile',
      path: '/team-profile',
      roles: ['team_owner'],
    },
    {
      icon: <FaPlusCircle />,
      label: 'Create Auction',
      path: '/create-auction',
      roles: ['admin'],
    },
    {
      icon: <FaClipboardList />,
      label: 'Pending Requests',
      path: '/pending-players',
      roles: ['admin'],
    },
    {
      icon: <FaCalendarAlt />,
      label: 'Create Match',
      path: '/matches/create',
      roles: ['admin'],
    },
    {
      icon: <FaCalendarAlt />,
      label: 'All Matches',
      path: '/all-matches',
      roles: ['admin', 'team_owner'],
    },
  ];

  const menuItems = allMenuItems.filter((item) => item.roles.includes(role));

  return (
    <>
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gradient-to-r from-gray-900 via-gray-800/95 to-gray-800/40 text-white w-64 px-6 flex flex-col transform transition-transform duration-300 ease-in-out z-40 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="flex flex-col space-y-3 flex-1 justify-center">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.path);
                setIsOpen(false); // close sidebar on navigation
              }}
              className="w-full flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gradient-to-r hover:from-purple-500 hover:via-purple-400/80 hover:to-transparent focus:outline-none transition-all duration-300 group relative overflow-hidden"
              title={item.label}
            >
              <div className="w-[30px] flex items-center justify-center">
                <span className="text-base text-gray-400 group-hover:text-white transition-colors duration-300">
                  {item.icon}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors duration-300">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        <p className="text-center text-xs text-gray-500 pb-4">
          © 2025 AuctionSphere. All rights reserved.
        </p>
      </div>
    </>
  );
};

export default Sidebar;
