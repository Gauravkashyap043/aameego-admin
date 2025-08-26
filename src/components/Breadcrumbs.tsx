import React from "react";
import { useLocation } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  
  const currentPage =
    pathnames[pathnames.length - 1] || "dashboard";

  return (
    <nav className="flex items-center text-sm text-gray-600 mb-4">
      <span className="flex items-center">
        <FiChevronRight className="mr-2" />
        <span className="font-semibold text-indigo-600 capitalize">
          {currentPage.replace(/-/g, " ")}
        </span>
      </span>
    </nav>
  );
};

export default Breadcrumbs;
