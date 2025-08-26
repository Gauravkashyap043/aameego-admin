// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import logo from "../assets/aameego_full_logo.png";
// import { FiActivity, FiDollarSign, FiHome, FiMessageCircle, FiTruck, FiUserCheck, FiUsers } from 'react-icons/fi';

// const navItems = [
//   { label: 'Dashboard', icon: <FiHome />, path: '/dashboard' },
//   { label: 'User Management', icon: <FiUsers />, path: '/user-management' },
//   { label: 'Admin Users', icon: <FiUserCheck />, path: '/admin-users' },
//   { label: 'Vehicle Master', icon: <FiTruck />, path: '/vehicle-master' },
//   { label: 'Finance', icon: <FiDollarSign />, path: '/finance' },
//   { label: 'Chat', icon: <FiMessageCircle />, path: '/chat' },
//   { label: 'Lastest Activity', icon: <FiActivity />, path: '/latest-activity' },
// ];

// const Sidebar: React.FC = () => {
//   // const navigate = useNavigate();
//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.clear();
//     window.location.href = '/';
//   };

//   return (
//     <aside className="w-60 bg-indigo-600 text-white min-h-screen flex flex-col items-center py-8 fixed left-0 top-0 bottom-0 z-50">
//       {/* Logo */}
//       <div className="mb-12 flex flex-col items-center">
//         <img src={logo} alt="Aameego Logo" className="h-10 w-auto" />
//       </div>
//       {/* Navigation */}
//       <nav className="w-full pl-4 flex-1">
//         {navItems.map(item => (
//           <NavLink
//             key={item.label}
//             to={item.path}
//             className={({ isActive }) =>
//               `flex items-center gap-4 px-8 py-3 ml-1 font-semibold text-base rounded-l-full mb-1 transition-colors cursor-pointer ${isActive ? 'bg-white text-indigo-600' : 'hover:bg-indigo-500'}`
//             }
//             end
//           >
//             <span className="flex items-center text-lg">{item.icon}</span>
//             {item.label}
//           </NavLink>
//         ))}
//       </nav>
//       {/* Logout Button */}
//       <button
//         onClick={handleLogout}
//         className="mt-8 mb-2 px-6 py-2 bg-white text-indigo-600 font-semibold rounded-lg shadow hover:bg-indigo-50 transition-colors w-48"
//       >
//         Logout
//       </button>
//     </aside>
//   );
// };

// export default Sidebar; 


import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/aameego_full_logo.png";
import {
  FiActivity,
  FiDollarSign,
  FiHome,
  FiMessageCircle,
  FiTruck,
  FiUserCheck,
  FiUsers,
} from "react-icons/fi";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: <FiHome />, path: "/dashboard" },
  { label: "User Management", icon: <FiUsers />, path: "/user-management" },
  { label: "Admin Users", icon: <FiUserCheck />, path: "/admin-users" },
  { label: "Vehicle Master", icon: <FiTruck />, path: "/vehicle-master" },
  { label: "Finance", icon: <FiDollarSign />, path: "/finance" },
  { label: "Chat", icon: <FiMessageCircle />, path: "/chat" },
  { label: "Latest Activity", icon: <FiActivity />, path: "/latest-activity" },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-60 bg-indigo-600 text-white flex flex-col items-center py-8 z-40 transform transition-transform duration-300 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          xl:translate-x-0`}
      >
        {/* Logo */}
        <div className="mb-12 flex flex-col items-center">
          <img src={logo} alt="Aameego Logo" className="h-10 w-auto" />
        </div>

        {/* Navigation */}
        <nav className="w-full pl-4 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-4 px-8 py-3 ml-1 font-semibold text-base rounded-l-full mb-1 transition-colors cursor-pointer ${
                  isActive
                    ? "bg-white text-indigo-600"
                    : "hover:bg-indigo-500"
                }`
              }
              end
              onClick={() => setIsOpen(false)} 
            >
              <span className="flex items-center text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-8 mb-2 px-6 py-2 bg-white text-indigo-600 font-semibold rounded-lg shadow hover:bg-indigo-50 transition-colors w-48"
        >
          Logout
        </button>
      </aside>
    </>
  );
};

export default Sidebar;








