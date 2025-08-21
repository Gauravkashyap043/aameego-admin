import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiUser, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import Button from './Button';

interface Asset {
  _id: string;
  assetName: string;
  assetType: {
    _id: string;
    name: string;
  };
  vehicle: {
    _id: string;
    vehicleNumber: string;
  };
  status: 'available' | 'assigned' | 'damaged' | 'lost' | 'maintenance';
  condition: 'new' | 'good' | 'fair' | 'poor';
  ownership: 'owned' | 'rented';
  assignedTo?: {
    _id: string;
    name: string;
    authRef: {
      identifier: string;
    };
  };
  serialNumber?: string;
  assetVendor?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}

interface AssetsTableProps {
  assets: Asset[];
  isLoading: boolean;
  onEdit?: (asset: Asset) => void;
  onDelete?: (assetId: string) => void;
  onAssign?: (asset: Asset) => void;
  onReturn?: (asset: Asset) => void;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  searchPlaceholder?: string;
  searchButtonLabel?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
    pageSizeOptions: number[];
  };
}

const AssetsTable: React.FC<AssetsTableProps> = ({
  assets,
  isLoading,
  // onEdit,
  onDelete,
  onAssign,
  onReturn,
  showSearch = false,
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  searchPlaceholder = 'Search assets...',
  searchButtonLabel = 'Search',
  pagination,
}) => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(searchValue);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'assigned':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'damaged':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'lost':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'assigned':
        return 'bg-blue-500';
      case 'damaged':
        return 'bg-red-500';
      case 'lost':
        return 'bg-gray-500';
      case 'maintenance':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit?.();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <div className="animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-6 bg-gray-300 rounded"></div>
                <div className="w-16 h-6 bg-gray-300 rounded"></div>
                <div className="w-24 h-6 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Search Bar */}
      {showSearch && (
        <div className="p-6 border-b border-gray-200">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                onSearchChange?.(e.target.value);
              }}
              placeholder={searchPlaceholder}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B36FF] focus:border-transparent"
            />
            <Button variant="primary" type="submit">
              {searchButtonLabel}
            </Button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vehicle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Condition
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ownership
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {assets.map((asset) => (
              <tr key={asset._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-[#3B36FF] flex items-center justify-center">
                        <FiPackage className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {asset.assetName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {asset.assetType?.name} • {asset.serialNumber || 'No Serial'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {asset.vehicle?.vehicleNumber || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold border ${getStatusColor(asset.status)}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${getStatusDot(asset.status)}`}></span>
                    {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${getConditionColor(asset.condition)}`}>
                    {asset.condition.charAt(0).toUpperCase() + asset.condition.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {asset.assignedTo ? (
                    <div className="flex items-center">
                      <FiUser className="text-blue-600 w-4 h-4 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {asset.assignedTo.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {asset.assignedTo.authRef?.identifier}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Not Assigned</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                    asset.ownership === 'owned' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {asset.ownership.charAt(0).toUpperCase() + asset.ownership.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate(`/add-asset/${asset._id}`)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit Asset"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                    {asset.status === 'available' && onAssign && (
                      <button
                        onClick={() => onAssign(asset)}
                        className="text-green-600 hover:text-green-900"
                        title="Assign Asset"
                      >
                        <FiUser className="w-4 h-4" />
                      </button>
                    )}
                    {asset.status === 'assigned' && onReturn && (
                      <button
                        onClick={() => onReturn(asset)}
                        className="text-orange-600 hover:text-orange-900"
                        title="Return Asset"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(asset._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Asset"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} results
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={pagination.limit}
                onChange={(e) => pagination.onLimitChange(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                {pagination.pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
              <div className="flex space-x-1">
                <button
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                  disabled={pagination.page * pagination.limit >= pagination.total}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsTable;
