import React from 'react';
import { FiBell, FiSettings } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/user-management': 'User Management',
  '/admin-users': 'Admin Users',
  '/vehicle-master': 'Vehicle Master',
  '/finance': 'Finance',
  '/chat': 'Chat',
  '/latest-activity': 'Latest Activity',
  '/add-user': 'Add User',
};

const Navbar: React.FC = () => {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || '';

  return (
    <header className="h-20 bg-transparent flex items-center justify-between px-10 border-b border-gray-200 sticky top-0 z-10">
      {/* Page Title */}
      <div className="text-2xl font-bold text-indigo-700">{pageTitle}</div>
      <div className="flex items-center gap-6">
        {/* Notification */}
        <span className="relative cursor-pointer">
          <FiBell className="w-6 h-6 text-indigo-400" />
        </span>
        {/* Settings */}
        <span className="cursor-pointer">
          <FiSettings className="w-6 h-6 text-indigo-400" />
        </span>
        {/* User Info */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-indigo-600 font-semibold text-base leading-tight">Nabila A.</div>
            <div className="text-indigo-300 text-xs leading-tight">Admin</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-600 text-lg">
            N
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar; 