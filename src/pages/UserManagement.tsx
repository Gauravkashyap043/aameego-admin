import React, { useState } from 'react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import type { Column } from '../components/Table';
import { useRidersAndSupervisors } from '../hooks/useUsers';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import InputField from '../components/InputField';
import Modal from '../components/Modal';

const TABS = [
  { label: 'Supervisor', value: 'supervisor' },
  { label: 'Rider', value: 'rider' },
];

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('supervisor');
  const { data, isLoading, error } = useRidersAndSupervisors();
  const navigate = useNavigate();
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    riderProfileCode: '',
    supervisorId: '',
  });
  const [assignError, setAssignError] = useState('');

  const tableData = activeTab === 'supervisor' ? data?.supervisors : data?.riders;

  const formatTableData = (users: any[] = []) => {
    return users.map(user => ({
      id: user._id,
      name: user.name || 'N/A',
      profileCode: user.profileCode,
      profileId: user._id,
      phone: user.authRef?.identifier || 'N/A',
      status: user.isVerified ? 'Verified' : 'Pending',
      statusColor: user.isVerified ? 'green' : 'yellow',
      lastLogin: user.authRef?.lastLoginAt ? user.authRef.lastLoginAt : null,
      profilePicture: user.profilePicture || '',
    }));
  };

  const handleView = (id: string) => {
    navigate(`/add-user/${id}`);
  };
  const handleEdit = (id: string) => {
    navigate(`/add-user/${id}`);
  };
  const handleDeactivate = (id: string) => {
    // TODO: Implement deactivate logic
    alert('Deactivate user: ' + id);
  };

  const supervisorOptions = (data?.supervisors || []).map((sup: any) => ({
    label: sup.name + (sup.profileCode ? ` (${sup.profileCode})` : ''),
    value: sup._id,
  }));

  const handleAssignChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAssignForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement assign supervisor logic
    if (!assignForm.riderProfileCode || !assignForm.supervisorId) {
      setAssignError('Both fields are required');
      return;
    }
    setAssignError('');
    alert(`Assign supervisor ${assignForm.supervisorId} to rider ${assignForm.riderProfileCode}`);
    setShowAssignModal(false);
    setAssignForm({ riderProfileCode: '', supervisorId: '' });
  };

  const columns: Column[] = [
    {
      key: 'name',
      title: 'Name',
      render: (value, record) => (
        <div className="flex items-center gap-2">
          {record.profilePicture ? (
            <img
              src={record.profilePicture}
              alt={value}
              className="w-10 h-10 rounded-full border border-gray-200 object-cover bg-gray-100"
            />
          ) : (
            <div className='w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-indigo-100 text-indigo-600 font-semibold'>
              {value.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-semibold text-primary cursor-pointer hover:underline">{value}</div>
            <div className="text-xs text-gray-500">Profile Code– <span className="font-bold">{record.profileCode}</span> <span className="ml-1 cursor-pointer" title="Copy">📋</span></div>
            <div className="text-xs text-gray-400">{record.profileId}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      title: 'Phone #',
    },
    {
      key: 'status',
      title: 'Status',
      render: (value, record) => (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${record.statusColor === 'green' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
          <span className={`mr-1 w-2 h-2 rounded-full ${record.statusColor === 'green' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
          {value}
        </span>
      ),
    },
    {
      key: 'lastLogin',
      title: 'Last Login',
      render: (value) => {
        if (!value) return 'Never';
        const dateObj = new Date(value);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}`;
      },
    },
    {
      key: 'actions',
      title: 'Action',
      render: (_value, record) => (
        <div className="relative">
          <button
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1"
            onClick={() => setActionDropdown(actionDropdown === record.id ? null : record.id)}
            type="button"
          >
            Actions <span>▼</span>
          </button>
          {actionDropdown === record.id && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded shadow-lg z-10">
              <button
                className="block w-full text-left px-4 py-2 hover:bg-indigo-50"
                onClick={() => { handleView(record.id); setActionDropdown(null); }}
              >
                View Details
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-indigo-50"
                onClick={() => { handleEdit(record.id); setActionDropdown(null); }}
              >
                Edit Details
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                onClick={() => { handleDeactivate(record.id); setActionDropdown(null); }}
              >
                Deactivate User
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="flex gap-4 mb-6">
          {TABS.map(tab => (
            <button
              key={tab.value}
              className={`px-6 py-2 rounded-t-lg font-semibold focus:outline-none transition-colors border-b-2 ${
                activeTab === tab.value
                  ? 'bg-white border-indigo-600 text-indigo-700'
                  : 'bg-indigo-100 border-transparent text-indigo-400 hover:text-indigo-600'
              }`}
              onClick={() => setActiveTab(tab.value)}
              type="button"
            >
              {tab.label} ({data?.total[tab.value === 'supervisor' ? 'supervisors' : 'riders'] || 0})
            </button>
          ))}
        </div>
        {error ? (
          <div className="text-red-500 p-4 bg-red-50 rounded-lg">
            Error loading users. Please try again.
          </div>
        ) : (
          <Table
            columns={columns}
            data={formatTableData(tableData)}
            isLoading={isLoading}
            actionButtonLabel="Assign Supervisor"
            actionButtonLoading={false}
            onActionButtonClick={() => setShowAssignModal(true)}
            showCheckbox={true}
            showSearch={true}
            searchPlaceholder="Search by name or phone"
            statusFilter={true}
          />
        )}
        {/* Assign Supervisor Modal */}
        <Modal
          open={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          title="Assign Supervisor to Rider"
        >
          <form onSubmit={handleAssignSubmit} className="flex flex-col gap-4">
            <InputField
              label="Rider Profile Code"
              name="riderProfileCode"
              value={assignForm.riderProfileCode}
              onChange={handleAssignChange}
              placeholder="Enter Rider Profile Code"
              required
            />
            <InputField
              label="Select Supervisor"
              name="supervisorId"
              type="select"
              value={assignForm.supervisorId}
              onChange={handleAssignChange}
              options={supervisorOptions}
              required
            />
            {assignError && <div className="text-red-500 text-sm">{assignError}</div>}
            <div className="flex gap-2 justify-end mt-2">
              <Button variant="secondary" type="button" onClick={() => setShowAssignModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Assign
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default UserManagement; 