import React from 'react';

type TableSkeletonProps = {
  rows?: number;
  columns?: number;
  showAvatar?: boolean;
  showStatus?: boolean;
  showActions?: boolean;
};

const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  showAvatar = false,
  showStatus = false,
  showActions = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow">
      {/* Table Skeleton */}

      {/* Table Skeleton */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Expand/Collapse column */}
              <th className="w-8 px-6 py-3">
                <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              </th>
              {/* Dynamic columns */}
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-6 py-3">
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {/* Expand/Collapse button skeleton */}
                <td className="px-6 py-4">
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                </td>
                
                {/* Column skeletons */}
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    {colIndex === 0 && showAvatar ? (
                      // Avatar skeleton
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex flex-col gap-2">
                          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ) : colIndex === 1 && showStatus ? (
                      // Status badge skeleton
                      <div className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                    ) : colIndex === columns - 1 && showActions ? (
                      // Actions skeleton
                      <div className="w-20 h-8 bg-gray-200 rounded-md animate-pulse"></div>
                    ) : (
                      // Regular text skeleton
                      <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="w-48 h-4 bg-gray-200 rounded animate-pulse"></div>
        <div className="flex items-center space-x-2">
          <div className="w-24 h-8 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="flex space-x-1">
            <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse"></div>
          </div>
          <div className="w-16 h-8 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default TableSkeleton;
