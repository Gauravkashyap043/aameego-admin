import React, { useState } from 'react';
import type { ReactNode } from 'react';

export type Column = {
  key: string;
  title: string;
  render?: (value: any, record: any) => ReactNode;
  width?: string;
};

export type PaginationProps = {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  pageSizeOptions?: number[];
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
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchButtonLabel?: string;
  onSearchSubmit?: () => void;
  statusFilter?: boolean;
  customFilters?: {
    label: string;
    options: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
  }[];
  pagination?: PaginationProps;
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
  searchValue,
  onSearchChange,
  searchButtonLabel,
  onSearchSubmit,
  statusFilter = false,
  customFilters = [],
  pagination
}) => {
  const [search, setSearch] = useState(searchValue ?? '');
  const isControlledSearch = typeof searchValue === 'string' && typeof onSearchChange === 'function';
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

  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1;
  const currentPage = pagination ? pagination.page : 1;
  const currentLimit = pagination ? pagination.limit : filteredData.length || 10;
  const showingStart = pagination
    ? (pagination.total === 0 ? 0 : (currentPage - 1) * currentLimit + 1)
    : (filteredData.length === 0 ? 0 : 1);
  const showingEnd = pagination
    ? Math.min(pagination.total, (currentPage - 1) * currentLimit + filteredData.length)
    : filteredData.length;

  function getPaginationItems(): (number | 'ellipsis')[] {
    if (!pagination) return [1];
    const items: (number | 'ellipsis')[] = [];
    // Show all when total pages small
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
      return items;
    }
    const firstTwo = [1, 2];
    const lastTwo = [totalPages - 1, totalPages];
    // Start
    items.push(...firstTwo);
    // Ellipsis after start if gap exists
    if (currentPage > 4) items.push('ellipsis');
    // Current page (only if not in first or last two)
    if (!firstTwo.includes(currentPage) && !lastTwo.includes(currentPage)) {
      items.push(currentPage);
    }
    // Ellipsis before end if gap exists
    if (currentPage < totalPages - 3) items.push('ellipsis');
    // End
    items.push(...lastTwo);
    // Deduplicate consecutive items (in case of overlaps)
    const dedup: (number | 'ellipsis')[] = [];
    for (const it of items) {
      if (dedup.length === 0 || dedup[dedup.length - 1] !== it) {
        dedup.push(it);
      }
    }
    // Remove ellipsis at boundaries
    if (dedup[0] === 'ellipsis') dedup.shift();
    if (dedup[dedup.length - 1] === 'ellipsis') dedup.pop();
    return dedup;
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
              value={isControlledSearch ? searchValue : search}
              onChange={e => {
                if (isControlledSearch) {
                  onSearchChange!(e.target.value);
                } else {
                  setSearch(e.target.value);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && typeof onSearchSubmit === 'function') {
                  e.preventDefault();
                  onSearchSubmit();
                }
              }}
              className="w-56 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
          {showSearch && typeof onSearchSubmit === 'function' && (
            <button
              type="button"
              onClick={onSearchSubmit}
              className="px-3 py-2 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700"
            >
              {searchButtonLabel ?? 'Search'}
            </button>
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
            {columns.map((column) => (
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
      <div className="flex items-center justify-between p-4 border-t text-xs text-gray-600">
        {pagination ? (
          <div>
            Showing {showingStart}–{showingEnd} of {pagination.total}
          </div>
        ) : (
          <div>Showing {filteredData.length} entries</div>
        )}
        <div className="flex items-center gap-2">
          {pagination && (
            <select
              className="px-2 py-1 border rounded"
              value={currentLimit}
              onChange={(e) => pagination.onLimitChange && pagination.onLimitChange(parseInt(e.target.value, 10))}
            >
              {(pagination.pageSizeOptions ?? [10, 20, 50]).map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>
          )}
          <button
            className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            disabled={!pagination || currentPage <= 1}
            onClick={() => pagination && pagination.onPageChange(Math.max(1, currentPage - 1))}
          >
            &lt;
          </button>
          {pagination
            ? getPaginationItems().map((it, idx) =>
                it === 'ellipsis' ? (
                  <span key={`e-${idx}`} className="px-2 py-1 text-gray-400">…</span>
                ) : (
                  <button
                    key={it}
                    className={`px-2 py-1 rounded ${
                      it === currentPage
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => pagination.onPageChange(it)}
                  >
                    {it}
                  </button>
                )
              )
            : (
              <button className="px-2 py-1 rounded bg-indigo-600 text-white" disabled>
                1
              </button>
            )}
          <button
            className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
            disabled={!pagination || currentPage >= totalPages}
            onClick={() => pagination && pagination.onPageChange(Math.min(totalPages, currentPage + 1))}
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
};

export default Table; 