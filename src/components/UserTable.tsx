import React, { useState, useMemo, useEffect } from "react";
import { FiChevronDown, FiSearch } from "react-icons/fi";
import FilterDropdown from "./FilterDropdown";

// ---------- Types ----------
type Column<T> = {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
};

type TableProps<T> = {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onActionClick?: (record: T) => void;
  rowsPerPage?: number;
  onSelectionChange?: (selected: T[]) => void;
  onSearch?: (value: string) => void;
  onAddNew?: () => void;
};

// ---------- Helpers ----------
const getTime = (d?: string) => {
  const t = new Date(d || "").getTime();
  return isNaN(t) ? 0 : t;
};

const ranges = {
  pastWeek: () => new Date().setDate(new Date().getDate() - 7),
  pastMonth: () => new Date().setMonth(new Date().getMonth() - 1),
  pastYear: () => new Date().setFullYear(new Date().getFullYear() - 1),
};

// ---------- Dropdown ----------
const ActionDropdown = ({ id, openId, setOpenId, onView }: any) => (
  <div className="relative dropdown-wrapper">
    <button
      onClick={() => setOpenId(openId === id ? null : id)}
      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-gray-800 text-[11px] rounded hover:bg-blue-200"
    >
      Actions
      <FiChevronDown
        className={`transform transition-transform ${openId === id ? "rotate-180" : "rotate-0"}`}
      />
    </button>
    {openId === id && (
      <div className="absolute right-0 mt-1 w-32 bg-white border rounded shadow-md z-50 text-xs text-gray-700">
        <button onClick={onView} className="block w-full text-left px-3 py-2 hover:bg-gray-100">View Details</button>
        <button onClick={() => alert("Edit clicked")} className="block w-full text-left px-3 py-2 hover:bg-gray-100">Edit Details</button>
        <button onClick={() => alert("Delete clicked")} className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600">Deactivate User</button>
      </div>
    )}
  </div>
);

// ---------- Table Row ----------
const TableRow = ({ row, i, startIndex, columns, selected, toggle, openId, setOpenId, onActionClick }: any) => (
  <tr className="hover:bg-gray-50 transition text-gray-700">
    <td className="px-2 py-2 border border-gray-300 w-12">
      <div className="flex items-center gap-1">
        <input type="checkbox" checked={selected} onChange={() => toggle(row.id)} />
        <span>{String(startIndex + i + 1).padStart(2, "0")}</span>
      </div>
    </td>
    {columns.map((col: any) => (
      <td key={col.key} className="px-2 py-2 border border-gray-300">
        {col.render ? col.render(row[col.key], row) : row[col.key]}
      </td>
    ))}
    <td className="px-2 py-2 border border-gray-300 text-center">{row.vehicleType || "2 Wheeler"}</td>
    <td className="px-2 py-2 border border-gray-300 text-center">{row.boardingDate || "18/07/2002"}</td>
    <td className="px-2 py-2 border border-gray-300 text-center">
      <ActionDropdown id={row.id} openId={openId} setOpenId={setOpenId} onView={() => onActionClick?.(row)} />
    </td>
  </tr>
);

// ---------- Mobile Card ----------
const MobileCard = ({ row, i, startIndex, columns, selected, toggle, openId, setOpenId, onActionClick }: any) => (
  <div className="border rounded-lg p-3 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={selected} onChange={() => toggle(row.id)} />
        <span className="text-xs text-gray-500">#{String(startIndex + i + 1).padStart(2, "0")}</span>
      </div>
      <ActionDropdown id={row.id} openId={openId} setOpenId={setOpenId} onView={() => onActionClick?.(row)} />
    </div>
    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-gray-700">
      {columns.map((col: any) => (
        <div key={col.key}><span className="font-medium">{col.title}:</span> {col.render ? col.render(row[col.key], row) : row[col.key]}</div>
      ))}
      <div><span className="font-medium">Vehicle:</span> {row.vehicleType || "2 Wheeler"}</div>
      <div><span className="font-medium">Boarding:</span> {row.boardingDate || "18/07/2002"}</div>
    </div>
  </div>
);

// ---------- Main ----------
export function UserTable<T extends { id: string; name?: string; status?: string; boardingDate?: string; vehicleType?: string; }>(props: TableProps<T>) {
  const { columns, data, isLoading, onActionClick, rowsPerPage = 7, onSelectionChange, onSearch, onAddNew } = props;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [sortFilter, setSortFilter] = useState<any>("latest");
  const [statusFilter, setStatusFilter] = useState<any>("all");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // close dropdown on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => !(e.target as HTMLElement).closest(".dropdown-wrapper") && setOpenDropdownId(null);
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // filtering + sorting
  const filteredData = useMemo(() => {
    let result = [...data];
    if (search.trim()) result = result.filter(r => (r.name || "").toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== "all") {
      const filter = statusFilter.toLowerCase();
      result = result.filter(r => filter === "deactive" ? ["deactive","inactive","deactivated"].includes((r.status||"").toLowerCase()) : (r.status||"").toLowerCase() === filter);
    }
    if (sortFilter === "latest" || sortFilter === "oldest") {
      result.sort((a, b) => sortFilter === "latest" ? getTime(b.boardingDate) - getTime(a.boardingDate) : getTime(a.boardingDate) - getTime(b.boardingDate));
    } else if (ranges[sortFilter as keyof typeof ranges]) {
      const t = (ranges as any)[sortFilter]();
      result = result.filter(r => getTime(r.boardingDate) >= t);
    }
    return result;
  }, [data, search, sortFilter, statusFilter]);

  useEffect(() => setCurrentPage(1), [search, sortFilter, statusFilter]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  // selection
  const updateSelection = (ids: Set<string>) => {
    setSelectedIds(ids);
    onSelectionChange?.(data.filter(d => ids.has(d.id)));
  };
  const toggleSelectAll = (checked: boolean) => updateSelection(new Set(checked ? [...selectedIds, ...paginatedData.map(r => r.id)] : [...selectedIds].filter(id => !paginatedData.find(r => r.id === id))));
  const toggleSelect = (id: string) => updateSelection(new Set(selectedIds.has(id) ? [...selectedIds].filter(x => x !== id) : [...selectedIds, id]));
  const allSelected = paginatedData.length > 0 && paginatedData.every(r => selectedIds.has(r.id));

  // pagination numbers
  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    const max = 5;
    if (totalPages <= max) for (let i = 1; i <= totalPages; i++) pages.push(i);
    else if (currentPage <= 3) pages.push(1, 2, 3, 4, "...", totalPages);
    else if (currentPage >= totalPages - 2) pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    else pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    return pages.map((p, i) => p === "..." ? <span key={i} className="px-2 text-gray-500">...</span> : <button key={p} onClick={() => setCurrentPage(p as number)} className={`px-3 py-1 rounded-lg text-xs border ${currentPage === p ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"}`}>{p}</button>);
  };

  return (
    <div>
     {/* Controls */}
<div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 mb-3">
  {/* Search */}
  <div className="flex items-center w-full sm:w-1/4 bg-indigo-50 px-3 py-2 rounded-lg text-xs shadow-sm">
    <FiSearch className="text-gray-400 mr-2" size={14} />
    <input
      type="text"
      placeholder="Search"
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        onSearch?.(e.target.value);
      }}
      className="bg-transparent outline-none w-full text-xs text-gray-600 placeholder-gray-400"
    />
  </div>

  {/* Show Filter */}
  <FilterDropdown
    label="Show"
    value={sortFilter}
    onChange={setSortFilter}
    options={[
      { label: "Latest", value: "latest" },
      { label: "Oldest", value: "oldest" },
      { label: "Past Week", value: "pastWeek" },
      { label: "Past Month", value: "pastMonth" },
      { label: "Past Year", value: "pastYear" },
    ]}
  />

  {/* Status Filter */}
  <FilterDropdown
    label="Status"
    value={statusFilter}
    onChange={setStatusFilter}
    options={[
      { label: "All", value: "all" },
      { label: "Pending", value: "pending" },
      { label: "Verified", value: "verified" },
      { label: "Deactive", value: "deactive" },
      { label: "Rejected", value: "rejected" },
    ]}
  />

  {/* Keep Button */}
  <div className="ml-auto">
    <button
      onClick={onAddNew}
      className="px-3 py-2 bg-blue-600 text-white text-xs rounded-lg"
    >
      Assign supervisor
    </button>
  </div>
</div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full border border-gray-300 text-[11px] text-left">
          <thead>
            <tr className="bg-gray-100 uppercase tracking-wide">
              <th className="px-2 py-2 border border-gray-300 text-left w-12"><input type="checkbox" checked={allSelected} onChange={e => toggleSelectAll(e.target.checked)} /> #</th>
              {columns.map(col => <th key={col.key.toString()} className="px-2 py-2 border border-gray-300">{col.title}</th>)}
              <th className="px-2 py-2 border border-gray-300">Vehicle</th>
              <th className="px-2 py-2 border border-gray-300">Boarding</th>
              <th className="px-2 py-2 border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan={columns.length + 3} className="text-center py-4">Loading...</td></tr> :
             paginatedData.length === 0 ? <tr><td colSpan={columns.length + 3} className="text-center py-4">No data</td></tr> :
             paginatedData.map((row, i) => <TableRow key={row.id} {...{ row, i, startIndex, columns, selected: selectedIds.has(row.id), toggle: toggleSelect, openId: openDropdownId, setOpenId: setOpenDropdownId, onActionClick }} />)}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-3 lg:hidden">
        {isLoading ? <div className="text-center py-4">Loading...</div> :
         paginatedData.length === 0 ? <div className="text-center py-4">No data</div> :
         paginatedData.map((row, i) => <MobileCard key={row.id} {...{ row, i, startIndex, columns, selected: selectedIds.has(row.id), toggle: toggleSelect, openId: openDropdownId, setOpenId: setOpenDropdownId, onActionClick }} />)}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center mt-3 gap-2">
        <span className="text-xs text-gray-600">Page {currentPage} of {totalPages}</span>
        <div className="flex flex-wrap items-center gap-1">
          <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-2 py-1 border rounded-lg text-xs disabled:opacity-50">Prev</button>
          {renderPageNumbers()}
          <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-2 py-1 border rounded-lg text-xs disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
