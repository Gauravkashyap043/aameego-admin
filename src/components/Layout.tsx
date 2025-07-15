import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen bg-indigo-50">
    <Sidebar />
    <div className="ml-60 flex-1 min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1">{children}</div>
    </div>
  </div>
);

export default Layout; 