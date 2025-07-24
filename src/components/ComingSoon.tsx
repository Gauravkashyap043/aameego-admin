import React from 'react';
import { FiClock, FiAlertCircle } from 'react-icons/fi';

interface ComingSoonProps {
  title?: string;
  message?: string;
  icon?: 'clock' | 'alert';
  className?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({
  title = 'Coming Soon',
  message = 'We\'re working hard to bring you this feature. Please check back later!',
  icon = 'clock',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-10 h-full min-h-[400px] ${className}`}>
      <div className="bg-white rounded-2xl shadow-md p-10 max-w-lg w-full text-center">
        <div className="flex justify-center mb-6">
          {icon === 'clock' ? (
            <FiClock className="text-indigo-500 w-16 h-16" />
          ) : (
            <FiAlertCircle className="text-indigo-500 w-16 h-16" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-indigo-700 mb-4">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-indigo-300 animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse delay-100"></div>
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;