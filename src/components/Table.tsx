import React, { useState } from 'react';

const mockData = [
  {
    id: 1,
    name: 'Samanta William',
    profileCode: 'ACD58',
    profileId: 'DL132020',
    phone: '+91 9140697986',
    address: 'Noida Uttar Pradesh 233231',
    boardingDate: '12-04-2025',
    dob: '12-04-2025',
    aadhaar: '324959848749',
    vehicleType: '2 Wheeler',
    vehicleNo: 'UP82 AN5012',
    status: 'Verified',
    statusColor: 'green',
    hub: 'Gurugram',
    supervisor: 'Rahul Sharma',
  },
  {
    id: 2,
    name: 'Gaurav William',
    profileCode: 'ACD58',
    profileId: 'DL132020',
    phone: '+91 9140697986',
    address: 'Ghaziabad Uttar Pradesh 233231',
    boardingDate: '12-04-2025',
    dob: '12-04-2025',
    aadhaar: '324959848749',
    vehicleType: '2 Wheeler',
    vehicleNo: 'UP82 AN5012',
    status: 'Pending',
    statusColor: 'yellow',
    hub: 'Gurugram',
    supervisor: 'Rahul Sharma',
  },
  // ... more mock rows
];

const Table: React.FC = () => {
  const [search, setSearch] = useState('');
  const [show, setShow] = useState('Latest');
  const [status, setStatus] = useState('All');

  const filteredData = mockData.filter(row => {
    const matchesSearch =
      row.name.toLowerCase().includes(search.toLowerCase()) ||
      row.phone.includes(search);
    const matchesStatus =
      status === 'All' || row.status === status;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      {/* Top Bar: Search, Filters, New User Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 border-b border-gray-200">
        <div className="flex flex-1 gap-2 items-center">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-56 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={show}
            onChange={e => setShow(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Latest">Show: Latest</option>
            <option value="Oldest">Show: Oldest</option>
          </select>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">Status: All</option>
            <option value="Verified">Status: Verified</option>
            <option value="Pending">Status: Pending</option>
          </select>
        </div>
        <button className="ml-auto px-6 py-2 bg-indigo-600 text-white rounded font-semibold hover:bg-indigo-700 flex items-center gap-2">
          + New User
        </button>
      </div>
      {/* Table */}
      <table className="min-w-full text-sm text-left border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 border-b border-r border-gray-200"><input type="checkbox" className="accent-primary" /></th>
            <th className="p-4 border-b border-r border-gray-200">#</th>
            <th className="p-4 border-b border-r border-gray-200">Name</th>
            <th className="p-4 border-b border-r border-gray-200">Phone #</th>
            <th className="p-4 border-b border-r border-gray-200">Address</th>
            <th className="p-4 border-b border-r border-gray-200">Boarding Date</th>
            <th className="p-4 border-b border-r border-gray-200">Date of Birth</th>
            <th className="p-4 border-b border-r border-gray-200">Aadhaar #</th>
            <th className="p-4 border-b border-r border-gray-200">Vehicle Type</th>
            <th className="p-4 border-b border-r border-gray-200">Vehicle #</th>
            <th className="p-4 border-b border-r border-gray-200">Status</th>
            <th className="p-4 border-b border-r border-gray-200">Hub Location</th>
            <th className="p-4 border-b border-r border-gray-200">Supervisor</th>
            <th className="p-4 border-b border-gray-200">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, idx) => (
            <tr key={row.id} className={idx % 2 === 1 ? 'bg-gray-50' : ''}>
              <td className="p-4 border-b border-r border-gray-200"><input type="checkbox" className="accent-primary" /></td>
              <td className="p-4 border-b border-r border-gray-200">{idx + 1}</td>
              <td className="p-4 border-b border-r border-gray-200">
                <div className="flex items-center gap-2">
                  {/* <img src="/src/assets/aameego_full_logo.png" alt="avatar" className="w-10 h-10 rounded-full" /> */}
                  <div className='w-16 h-10 rounded-full border border-gray-200'></div>
                  <div>
                    <div className="font-semibold text-primary cursor-pointer hover:underline">{row.name}</div>
                    <div className="text-xs text-gray-500">Profile Code– <span className="font-bold">{row.profileCode}</span> <span className="ml-1 cursor-pointer" title="Copy">📋</span></div>
                    <div className="text-xs text-gray-400">{row.profileId}</div>
                  </div>
                </div>
              </td>
              <td className="p-4 border-b border-r border-gray-200">{row.phone}</td>
              <td className="p-4 border-b border-r border-gray-200">{row.address}</td>
              <td className="p-4 border-b border-r border-gray-200">{row.boardingDate}</td>
              <td className="p-4 border-b border-r border-gray-200">{row.dob}</td>
              <td className="p-4 border-b border-r border-gray-200">{row.aadhaar}</td>
              <td className="p-4 border-b border-r border-gray-200">{row.vehicleType}</td>
              <td className="p-4 border-b border-r border-gray-200">{row.vehicleNo}</td>
              <td className="p-4 border-b border-r border-gray-200">
                <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${row.statusColor === 'green' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  <span className={`mr-1 w-2 h-2 rounded-full ${row.statusColor === 'green' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                  {row.status}
                </span>
              </td>
              <td className="p-4 border-b border-r border-gray-200">{row.hub}</td>
              <td className="p-4 border-b border-r border-gray-200">{row.supervisor}</td>
              <td className="p-4 border-b border-gray-200">
                <button className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1">Actions <span>▼</span></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t text-xs text-gray-500">
        <div>Showing data 1 to 8 of 256K entries</div>
        <div className="flex items-center gap-1">
          <button className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">&lt;</button>
          <button className="px-2 py-1 rounded bg-indigo-600 text-white">1</button>
          <button className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">2</button>
          <button className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">3</button>
          <span>...</span>
          <button className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">40</button>
          <button className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200">&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default Table; 