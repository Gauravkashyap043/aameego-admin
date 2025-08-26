import React, { useEffect, useState } from 'react';
import { FiBell, FiSettings, FiMenu } from 'react-icons/fi';
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

interface NavbarProps {
  setIsSidebarOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ setIsSidebarOpen }) => {
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || '';

  const [userName, setUserName] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [userInitial, setUserInitial] = useState<string>('U');
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    try {
      const storedName = localStorage.getItem('userName');
      const storedRole = localStorage.getItem('userRole');
      const token = localStorage.getItem('token');

      if (token) {
        if (storedName) {
          setUserName(storedName);
          setUserInitial(storedName.charAt(0).toUpperCase());
        }
        if (storedRole) setUserRole(storedRole);
      } else {
        setUserName('');
        setUserRole('');
        setUserInitial('U');
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      setUserName('');
      setUserRole('');
      setUserInitial('U');
    }
  }, []);

  return (
    <header
      className={`h-20 flex items-center justify-between px-6 border-b border-gray-200 sticky top-0 z-10 transition-colors duration-300 
      ${isScrolled ? 'bg-white shadow' : 'bg-transparent'}`}
    >
      {/* ✅ Page Title (Desktop only) */}
      <div className="hidden xl:block text-2xl font-bold text-indigo-700">
        {pageTitle}
      </div>

      {/* ✅ Hamburger Menu (Tablet/Mobile only) */}
      <button
        className="xl:hidden flex items-center gap-2 text-indigo-600 font-bold"
        onClick={() => setIsSidebarOpen(true)}
      >
        <FiMenu size={24} />
      </button>

      {/* Right side */}
      <div className="flex items-center gap-6 ml-auto">
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
            <div className="text-indigo-600 font-semibold text-base leading-tight">
              {userName || 'User'}
            </div>
            <div className="text-indigo-300 text-xs leading-tight">
              {userRole || 'Admin'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center font-bold text-indigo-600 text-lg">
            {userInitial}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
