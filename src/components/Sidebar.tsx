import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from "../assets/aameego_full_logo.png";
import { FiActivity, FiDollarSign, FiHome, FiMessageCircle, FiTruck, FiUserCheck, FiUsers } from 'react-icons/fi';

const navItems = [
  { label: 'Dashboard', icon: <FiHome />, path: '/dashboard' },
  { label: 'User Management', icon: <FiUsers />, path: '/user-management' },
  { label: 'Admin Users', icon: <FiUserCheck />, path: '/admin-users' },
  { label: 'Vehicle Master', icon: <FiTruck />, path: '/vehicle-master' },
  { label: 'Finance', icon: <FiDollarSign />, path: '/finance' },
  { label: 'Chat', icon: <FiMessageCircle />, path: '/chat' },
  { label: 'Lastest Activity', icon: <FiActivity />, path: '/latest-activity' },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="w-60 bg-indigo-600 text-white min-h-screen flex flex-col items-center py-8 fixed left-0 top-0 bottom-0 z-50">
      {/* Logo */}
      <div className="mb-12 flex flex-col items-center">
        <img src={logo} alt="Aameego Logo" className="h-10 w-auto" />
      </div>
      {/* Navigation */}
      <nav className="w-full pl-4">
        {navItems.map(item => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-8 py-3 ml-1 font-semibold text-base rounded-l-2xl mb-1 transition-colors cursor-pointer ${isActive ? 'bg-white text-indigo-600' : 'hover:bg-indigo-500'}`
            }
            end
          >
            <span className="flex items-center text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar; 