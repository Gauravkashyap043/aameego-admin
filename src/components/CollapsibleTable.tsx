import React, { useState } from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import TableSkeleton from './TableSkeleton';

// CSS for search input placeholder
const searchInputStyles = `
  .search-input::placeholder {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .search-input:focus::placeholder {
    color: #9CA3AF;
  }
`;

export type CollapsibleColumn = {
  key: string;
  title: string;
  render?: (value: any, record: any) => React.ReactNode;
  width?: string;
  essential?: boolean; // Show in collapsed view
};

type CollapsibleTableRow = {
  id: string;
  [key: string]: any;
};

type CollapsibleTableProps = {
  data: CollapsibleTableRow[];
  columns: CollapsibleColumn[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (record: any) => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchButtonLabel?: string;
  onSearchSubmit?: () => void;
  actionButtonLabel?: string;
  onActionButtonClick?: () => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
    pageSizeOptions?: number[];
  };
  // Skeleton loading props
  skeletonRows?: number;
  skeletonShowAvatar?: boolean;
  skeletonShowStatus?: boolean;
  skeletonShowActions?: boolean;
};

const CollapsibleTable: React.FC<CollapsibleTableProps> = ({
  data = [],
  columns = [],
  isLoading = false,
  emptyMessage = "No data available",
  onRowClick,
  showSearch = true,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  searchButtonLabel,
  onSearchSubmit,
  actionButtonLabel,
  onActionButtonClick,
  pagination,
  skeletonRows = 5,
  skeletonShowAvatar = false,
  skeletonShowStatus = false,
  skeletonShowActions = false
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Separate essential and additional columns
  const essentialColumns = columns.filter(col => col.essential);
  const additionalColumns = columns.filter(col => !col.essential);

  const toggleRowExpansion = (rowId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowId)) {
      newExpanded.delete(rowId);
    } else {
      newExpanded.add(rowId);
    }
    setExpandedRows(newExpanded);
  };

  const isRowExpanded = (rowId: string) => {
    return expandedRows.has(rowId);
  };

  // Pagination calculations
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1;
  const currentPage = pagination ? pagination.page : 1;
  const currentLimit = pagination ? pagination.limit : data.length || 10;
  const showingStart = pagination
    ? (pagination.total === 0 ? 0 : (currentPage - 1) * currentLimit + 1)
    : (data.length === 0 ? 0 : 1);
  const showingEnd = pagination
    ? Math.min(pagination.total, (currentPage - 1) * currentLimit + data.length)
    : data.length;

  function getPaginationItems(): (number | 'ellipsis')[] {
    if (!pagination) return [1];
    const items: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
      return items;
    }
    const firstTwo = [1, 2];
    const lastTwo = [totalPages - 1, totalPages];
    items.push(...firstTwo);
    if (currentPage > 4) items.push('ellipsis');
    if (!firstTwo.includes(currentPage) && !lastTwo.includes(currentPage)) {
      items.push(currentPage);
    }
    if (currentPage < totalPages - 3) items.push('ellipsis');
    items.push(...lastTwo);
    const dedup: (number | 'ellipsis')[] = [];
    for (const it of items) {
      if (dedup.length === 0 || dedup[dedup.length - 1] !== it) {
        dedup.push(it);
      }
    }
    if (dedup[0] === 'ellipsis') dedup.shift();
    if (dedup[dedup.length - 1] === 'ellipsis') dedup.pop();
    return dedup;
  }

  // Remove the early return for loading state to keep search and buttons visible

  return (
    <>
      <style>{searchInputStyles}</style>
      <div className="bg-white rounded-lg shadow">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {showSearch && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue || ''}
                onChange={onSearchChange ? (e) => onSearchChange(e.target.value) : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && onSearchSubmit) {
                    e.preventDefault();
                    onSearchSubmit();
                  }
                }}
                className="w-full sm:w-80 lg:w-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm placeholder-gray-400 search-input"
                style={{
                  minWidth: '280px'
                }}
              />
              {onSearchSubmit && (
                <button
                  onClick={onSearchSubmit}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors text-sm"
                >
                  {searchButtonLabel || 'Search'}
                </button>
              )}
            </div>
          )}
        </div>

        {actionButtonLabel && (
          <button
            onClick={onActionButtonClick}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors text-sm"
          >
            {actionButtonLabel}
          </button>
        )}
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto min-h-[400px]">
        {isLoading ? (
          <TableSkeleton
            rows={skeletonRows}
            columns={columns.filter(col => col.essential).length}
            showAvatar={skeletonShowAvatar}
            showStatus={skeletonShowStatus}
            showActions={skeletonShowActions}
          />
        ) : (
          <table className="min-w-full divide-y divide-gray-200 min-h-[350px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-8 px-3 sm:px-6 py-3"></th>
                {essentialColumns.map((column) => (
                  <th
                    key={column.key}
                    className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    style={column.width ? { width: column.width } : undefined}
                  >
                    <span className="hidden sm:inline">{column.title}</span>
                    <span className="sm:hidden">{column.title.length > 8 ? column.title.substring(0, 8) + '...' : column.title}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.length === 0 ? (
                <tr>
                  <td 
                    colSpan={essentialColumns.length + 1} 
                    className="px-3 sm:px-6 py-12 text-center text-gray-500"
                  >
                    <div className="min-h-[300px] flex items-center justify-center">
                      {emptyMessage}
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <React.Fragment key={row.id}>
                    {/* Main Row */}
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-4">
                        <button
                          onClick={() => toggleRowExpansion(row.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {isRowExpanded(row.id) ? (
                            <FiChevronDown className="w-4 h-4" />
                          ) : (
                            <FiChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                      {essentialColumns.map((column) => (
                        <td
                          key={column.key}
                          className="px-3 sm:px-6 py-4 text-sm text-gray-900 cursor-pointer"
                          onClick={() => onRowClick && onRowClick(row)}
                        >
                          <div className="min-w-0">
                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                          </div>
                        </td>
                      ))}
                    </tr>
                    
                    {/* Expanded Row */}
                    {isRowExpanded(row.id) && additionalColumns.length > 0 && (
                      <tr className="bg-gray-50">
                        <td></td>
                        <td colSpan={essentialColumns.length} className="px-3 sm:px-6 py-4">
                          <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                              {additionalColumns.map((column) => (
                                <div key={column.key} className="flex flex-col">
                                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                    {column.title}
                                  </dt>
                                  <dd className="text-sm text-gray-900 break-words">
                                    {column.render ? column.render(row[column.key], row) : row[column.key] || '-'}
                                  </dd>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
              
              {/* Add spacer rows to ensure minimum height for dropdowns */}
              {data.length > 0 && data.length < 5 && (
                Array.from({ length: 5 - data.length }, (_, index) => (
                  <tr key={`spacer-${index}`} className="h-16">
                    <td colSpan={essentialColumns.length + 1}></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Responsive Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-3 sm:px-6 py-3 border-t border-gray-200 bg-gray-50 gap-3">
          <div className="flex items-center text-xs sm:text-sm text-gray-700">
            Showing {showingStart} to {showingEnd} of {pagination.total} results
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:space-x-2">
            <select
              className="border border-gray-300 rounded-md px-2 sm:px-3 py-1 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={currentLimit}
              onChange={(e) => pagination.onLimitChange && pagination.onLimitChange(parseInt(e.target.value, 10))}
              disabled={isLoading}
            >
              {(pagination.pageSizeOptions ?? [10, 20, 50]).map((n) => (
                <option key={n} value={n}>{n} per page</option>
              ))}
            </select>
            
            <nav className="flex items-center space-x-1">
              <button
                className="px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage <= 1 || isLoading}
                onClick={() => pagination.onPageChange(Math.max(1, currentPage - 1))}
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>
              
              {getPaginationItems().map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-500">
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium ${
                      item === currentPage
                        ? 'bg-indigo-600 text-white'
                        : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => !isLoading && pagination.onPageChange(item)}
                    disabled={isLoading}
                  >
                    {item}
                  </button>
                )
              )}
              
              <button
                className="px-2 sm:px-3 py-1 rounded-md border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage >= totalPages || isLoading}
                onClick={() => pagination.onPageChange(Math.min(totalPages, currentPage + 1))}
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default CollapsibleTable;