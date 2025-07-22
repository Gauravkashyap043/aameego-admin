import React, { useState } from 'react';
import type { ReactNode } from 'react';

export type Column = {
  key: string;
  title: string;
  render?: (value: any, record: any) => ReactNode;
  width?: string;
};

type TableRow = {
  id: string;
  [key: string]: any;
};

type TableProps = {
  actionButtonLabel?: string;
  actionButtonLoading?: boolean;
  onActionButtonClick?: () => void;
  data: TableRow[];
  isLoading?: boolean;
  columns: Column[];
  showCheckbox?: boolean;
  showSearch?: boolean;
  searchPlaceholder?: string;
  statusFilter?: boolean;
  customFilters?: {
    label: string;
    options: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
  }[];
};

const Table: React.FC<TableProps> = ({ 
  actionButtonLabel, 
  actionButtonLoading = false, 
  onActionButtonClick,
  data = [],
  isLoading = false,
  columns = [],
  showCheckbox = false,
  showSearch = true,
  searchPlaceholder = "Search",
  statusFilter = false,
  customFilters = []
}) => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');

  const filteredData = data.filter(row => {
    const matchesSearch = search === '' || 
      columns.some(column => {
        const value = row[column.key];
        return value && value.toString().toLowerCase().includes(search.toLowerCase());
      });
    
    const matchesStatus = !statusFilter || status === 'All' || row.status === status;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 flex items-center justify-center">
        <div className="text-indigo-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      {/* Top Bar: Search, Filters, Action Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-b border-gray-200">
        <div className="flex flex-1 gap-2 items-center flex-wrap">
          {showSearch && (
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-56 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
          
          {customFilters.map((filter, index) => (
            <select
              key={index}
              value={filter.value}
              onChange={e => filter.onChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {filter.options.map(option => (
                <option key={option.value} value={option.value}>
                  {filter.label}: {option.label}
                </option>
              ))}
            </select>
          ))}

          {statusFilter && (
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">Status: All</option>
              <option value="Verified">Verified</option>
              <option value="Pending">Pending</option>
            </select>
          )}
        </div>
        {actionButtonLabel && (
          <button
            className="ml-auto px-6 py-2 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-60"
            onClick={onActionButtonClick}
            disabled={actionButtonLoading}
          >
            {actionButtonLoading ? (
              <span className="loader mr-2"></span>
            ) : null}
            {actionButtonLabel}
          </button>
        )}
      </div>

      {/* Table */}
      <table className="min-w-full text-sm text-left border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {showCheckbox && (
              <th className="p-4 border-b border-r border-gray-200">
                <input type="checkbox" className="accent-primary" />
              </th>
            )}
            {columns.map((column, index) => (
              <th 
                key={column.key} 
                className="p-4 border-b border-r border-gray-200"
                style={column.width ? { width: column.width } : undefined}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, idx) => (
            <tr key={row.id} className={idx % 2 === 1 ? 'bg-gray-50' : ''}>
              {showCheckbox && (
                <td className="p-4 border-b border-r border-gray-200">
                  <input type="checkbox" className="accent-primary" />
                </td>
              )}
              {columns.map((column) => (
                <td key={column.key} className="p-4 border-b border-r border-gray-200">
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t text-xs text-gray-500">
        <div>Showing {filteredData.length} entries</div>
        <div className="flex items-center gap-1">
          <button className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">&lt;</button>
          <button className="px-2 py-1 rounded bg-indigo-600 text-white">1</button>
          <button className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default Table; 