import React from "react";
import Layout from "../components/Layout";
import ComingSoon from "../components/ComingSoon";
import { FiUsers, FiTruck, FiDollarSign, FiActivity } from 'react-icons/fi';

const Dashboard: React.FC = () => {
  // Sample dashboard stats - these would come from an API in a real implementation
  const stats = [
    { title: 'Total Users', value: '_', icon: <FiUsers className="w-8 h-8 text-indigo-500" /> },
    { title: 'Active Vehicles', value: '_', icon: <FiTruck className="w-8 h-8 text-indigo-500" /> },
    { title: 'Revenue', value: '_', icon: <FiDollarSign className="w-8 h-8 text-indigo-500" /> },
    { title: 'Activities', value: '_', icon: <FiActivity className="w-8 h-8 text-indigo-500" /> },
  ];

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-indigo-700 mb-6">Dashboard Overview</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 flex items-center">
              <div className="mr-4">{stat.icon}</div>
              <div>
                <h2 className="text-gray-500 text-sm">{stat.title}</h2>
                <p className="text-2xl font-bold text-indigo-700">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Area - Using ComingSoon for now */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <ComingSoon
            title="Enhanced Dashboard Coming Soon"
            message="We're working on a comprehensive dashboard with charts, analytics, and real-time data visualization."
            className="min-h-[300px] p-0"
          />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;