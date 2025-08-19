import React, { useState } from 'react';
import Layout from '../components/Layout';
import CollapsibleTable from '../components/CollapsibleTable';
import type { CollapsibleColumn } from '../components/CollapsibleTable';
import Button from '../components/Button';
import ActionDropdown from '../components/ActionDropdown';
import { useNavigate } from 'react-router-dom';
import { useVehicleList, type VehiclePage } from '../hooks/useVehicles';
import QRCodeGenerator from '../components/QRCodeGenerator';
import { FiTruck, FiFileText, FiPackage, FiTool, FiAlertTriangle, FiUser, FiMapPin } from 'react-icons/fi';

const VehicleMaster: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedVehicleForQR, setSelectedVehicleForQR] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');

  const { data: vehiclePage, isLoading: loadingVehicles } = useVehicleList(page, limit, submittedSearch);
  const vehicles = (vehiclePage as VehiclePage | undefined)?.items ?? [];
  const total = (vehiclePage as VehiclePage | undefined)?.total ?? 0;
  // const totalPages = (vehiclePage as VehiclePage | undefined)?.totalPages ?? 1;

  const summaryCards = [
    {
      label: 'Total Vehicles',
      value: total.toString(),
      icon: <FiTruck className="w-6 h-6" />,
      link: 'View List',
    },
    {
      label: 'Vehicles Rented',
      value: '_',
      icon: <FiFileText className="w-6 h-6" />,
      link: 'View all orders',
    },
    {
      label: 'Accessories',
      value: '_',
      icon: <FiPackage className="w-6 h-6" />,
      link: 'View List',
    },
    {
      label: 'Rented Accessories',
      value: '_',
      icon: <FiTool className="w-6 h-6" />,
      link: 'View List',
    },
    {
      label: 'Documents Expired',
      value: '_',
      icon: <FiAlertTriangle className="w-6 h-6" />,
      link: 'View List',
    },
  ];

  const tabs = [
    'All Vehicles',
    'Rented Vehicles',
    'All Accessories',
    'Accessories Rented',
    'Maintenance',
    'Documents Expired',
    'Disassembles',
  ];

  // QR code handler
  const handleShowQR = (vehicleNumber: string) => {
    setSelectedVehicleForQR(vehicleNumber);
    setShowQRModal(true);
  };



  // Define collapsible columns for the vehicle table
  const collapsibleColumns: CollapsibleColumn[] = [
    {
      key: 'vehicleNumber',
      title: 'Vehicle Number',
      essential: true,
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <FiTruck className="text-indigo-600 w-4 h-4" />
          <span 
            className="font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 hover:underline"
            onClick={() => navigate(`/add-vehicle/${record.id}`)}
          >
            {value}
          </span>
        </div>
      )
    },
    {
      key: 'numberPlateStatus',
      title: 'Number Plate Status',
      essential: true,
      render: (value: any) => {
        let color = 'bg-yellow-100 text-yellow-800 border-yellow-300';
        let dot = 'bg-yellow-400';
        let label = 'Pending';
        if (value === 'available') {
          color = 'bg-green-100 text-green-800 border-green-300';
          dot = 'bg-green-500';
          label = 'Available';
        } else if (value === 'rejected') {
          color = 'bg-red-100 text-red-800 border-red-300';
          dot = 'bg-red-500';
          label = 'Rejected';
        }
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold border ${color}`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${dot}`}></span>
            {label}
          </span>
        );
      },
    },
    {
      key: 'evType',
      title: 'EV Type',
      essential: true,
      render: (value: any) => (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-900">{value?.name || '-'}</span>
        </div>
      )
    },
    {
      key: 'currentAssignment',
      title: 'Assigned To',
      essential: true,
      render: (value: any) => {
        if (!value) return <span className="text-gray-400">-</span>;
        const rider = value.rider;
        if (!rider) return <span className="text-gray-400">Unknown Rider</span>;
        
        const name = rider?.accountRef?.name || rider.name || 'No Name';
        const phone = rider?.accountRef?.identifier || rider.identifier || 'No Phone';
        // const profileCode = rider?.profileCode || rider.profileCode || 'No Code';
        
        return (
          <div className="flex items-center gap-2">
            <FiUser className="text-blue-600 w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">{name}</span>
              <span className="text-xs text-gray-500">{phone}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'city',
      title: 'City',
      essential: true,
      render: (value: any) => (
        <div className="flex items-center gap-1">
          <FiMapPin className="text-gray-400 w-3 h-3" />
          <span>{value?.name || '-'}</span>
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Action',
      essential: true,
      render: (_value: any, record: any) => (
        <ActionDropdown
          items={[
            {
              label: 'Edit',
              onClick: () => navigate(`/add-vehicle/${record.id}`),
            },
            {
              label: 'Generate QR',
              onClick: () => handleShowQR(record.vehicleNumber),
            },
          ]}
        />
      ),
    },
    {
      key: 'vehicleType',
      title: 'Type',
      essential: false,
      render: (value: any) => value?.name || '-'
    },
    {
      key: 'vehicleModel',
      title: 'Model',
      essential: false,
      render: (value: any) => value?.name || '-'
    },
    {
      key: 'hub',
      title: 'Hub',
      essential: false,
      render: (value: any) => value?.name || '-'
    },
    {
      key: 'supervisor',
      title: 'Supervisor',
      essential: false,
      render: (value: any) => value?.name || '-'
    },
    {
      key: 'oem',
      title: 'OEM',
      essential: false,
      render: (value: any) => value?.name || '-'
    },
    {
      key: 'vehicleRCNumber',
      title: 'RC Number',
      essential: false
    },
    {
      key: 'invoiceAmount',
      title: 'Invoice Amount',
      essential: false,
      render: (value: any) => value ? `₹${value}` : '-'
    },
    {
      key: 'deliveryDate',
      title: 'Delivery Date',
      essential: false,
      render: (value: any) => value ? new Date(value).toLocaleDateString() : '-'
    },
  ];

  // Map vehicles to table data
  const tableData = vehicles.map((v: any) => ({
    id: v._id,
    vehicleNumber: v.vehicleNumber,
    city: v.city,
    hub: v.hub,
    supervisor: v.supervisor,
    vehicleType: v.vehicleType,
    evType: v.evType,
    oem: v.oem,
    vehicleModel: v.vehicleModel,
    vehicleRCNumber: v.vehicleRCNumber,
    numberPlateStatus: v.numberPlateStatus,
    invoiceAmount: v.invoiceAmount,
    deliveryDate: v.deliveryDate,
    currentAssignment: v.currentAssignment,
  }));

  return (
    <Layout>

      <div className="min-h-screen bg-[#f6f7ff] p-8">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-[#3B36FF]">Vehicle Master</h2>
          <div className="flex gap-2">
            <Button variant="secondary">+ New Accessories</Button>
            <Button variant="primary" onClick={() => navigate("/add-vehicle")}>+ New Vehicle</Button>
          </div>
        </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {summaryCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl shadow p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="text-gray-600">{card.icon}</div>
                <span className="text-lg font-semibold">{card.value}</span>
              </div>
              <div className="text-xs text-gray-500 font-medium">{card.label}</div>
              <a href="#" className="text-xs text-[#3B36FF] font-medium hover:underline">{card.link}</a>
            </div>
          ))}
        </div>
        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {tabs.map((tab, idx) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-t-lg text-sm font-medium focus:outline-none whitespace-nowrap ${activeTab === idx
                ? 'bg-white text-[#3B36FF] shadow border-b-2 border-[#3B36FF]'
                : 'bg-transparent text-gray-500'
                }`}
              onClick={() => setActiveTab(idx)}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Table */}
        {activeTab === 0 && (
          <CollapsibleTable
            columns={collapsibleColumns}
            data={tableData}
            isLoading={loadingVehicles}
            actionButtonLabel="+ New Vehicle"
            onActionButtonClick={() => navigate('/add-vehicle')}
            showSearch
            searchValue={search}
            onSearchChange={(v) => {
              setSearch(v);
              if (v.trim() === '') {
                setPage(1);
                setSubmittedSearch('');
              }
            }}
            searchButtonLabel="Search"
            onSearchSubmit={() => { setPage(1); setSubmittedSearch(search); }}
            searchPlaceholder="Search vehicles by number, model, type..."
            skeletonRows={8}
            skeletonShowStatus={true}
            skeletonShowActions={true}
            pagination={{
              page,
              limit,
              total,
              onPageChange: setPage,
              onLimitChange: (n) => { setPage(1); setLimit(n); },
              pageSizeOptions: [10, 20, 50],
            }}
          />
        )}

        {/* QR Code Modal */}
        {showQRModal && selectedVehicleForQR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Vehicle QR Code</h3>
                <button
                  onClick={() => {
                    setShowQRModal(false);
                    setSelectedVehicleForQR(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <QRCodeGenerator
                value={selectedVehicleForQR}
                title="Vehicle QR Code"
                downloadFileName={`vehicle-qr-${selectedVehicleForQR}.png`}
                downloadText="Download QR Code"
                className="w-full"
              />
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default VehicleMaster; 