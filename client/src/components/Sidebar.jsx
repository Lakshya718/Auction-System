import React, { useState } from "react";
import { FaHome, FaUsers, FaUserPlus, FaList, FaUserShield, FaPlusCircle, FaClipboardList, FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const allMenuItems = [
    { icon: <FaHome />, label: "All Auctions", path: "/all-auctions", roles: ["admin", "team_owner"] },
    { icon: <FaUsers />, label: "All Players", path: "/all-players", roles: ["admin"] },
    { icon: <FaUserPlus />, label: "Add Player", path: "/add-player", roles: ["admin"] },
    { icon: <FaList />, label: "All Teams", path: "/all-teams", roles: ["admin"] },
    { icon: <FaUserShield />, label: "Team Profile", path: "/team-profile", roles: ["team_owner"] },
    { icon: <FaPlusCircle />, label: "Create Auction", path: "/create-auction", roles: ["admin"] },
    { icon: <FaClipboardList />, label: "Pending Player Requests", path: "/pending-players", roles: ["admin"] },
    { icon: <FaCalendarAlt />, label: "Create Match", path: "/matches/create", roles: ["admin"] },
  ];

  const menuItems = allMenuItems.filter(item => item.roles.includes(role));

  return (
    <div className={`bg-gray-800 text-white h-screen p-4 flex flex-col transition-width duration-300 ${collapsed ? "w-16" : "w-64"}`}>
      <button
        onClick={toggleSidebar}
        className="mb-6 p-2 bg-gray-700 rounded hover:bg-gray-600 focus:outline-none"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? ">>" : "<<"}
      </button>
      <nav className="flex flex-col space-y-2 flex-grow">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex items-center space-x-3 p-2 rounded hover:bg-gray-700 focus:outline-none"
            title={collapsed ? item.label : ""}
          >
            <span className="text-lg">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
