import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Breadcrumbs from "./Breadcrumbs";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-indigo-50 relative">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      

      {/* Main Content */}
      <div
        className={`
          flex-1 min-h-screen flex flex-col transition-all duration-300
          xl:ml-60   
        `}
      >
        {/* Navbar */}
        <Navbar setIsSidebarOpen={setIsSidebarOpen} />

        {/* Page Content */}
        <div className="flex-1 p-4">
          {/* Breadcrumbs visible only on mobile & tablet, hidden on desktop view */}
          <div className="block xl:hidden mb-4">
            <Breadcrumbs />
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
