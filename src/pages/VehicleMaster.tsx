import React, { useState } from 'react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Button from '../components/Button';
import ActionDropdown from '../components/ActionDropdown';
import { useNavigate } from 'react-router-dom';
import { useVehicleList, type VehiclePage } from '../hooks/useVehicles';
import QRCode from 'react-qr-code';
import { FiTruck, FiFileText, FiPackage, FiTool, FiAlertTriangle } from 'react-icons/fi';

const summaryCards = [
  {
    label: 'Total Vehicles',
    value: '_',
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

const VehicleMaster: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const [qrVehicleId, setQrVehicleId] = useState<string | null>(null);
  const qrRef = React.useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const { data: vehiclePage, isLoading: loadingVehicles } = useVehicleList(page, limit, search);
  const vehicles = (vehiclePage as VehiclePage | undefined)?.items ?? [];
  const total = (vehiclePage as VehiclePage | undefined)?.total ?? 0;
  // const totalPages = (vehiclePage as VehiclePage | undefined)?.totalPages ?? 1;

  // Download QR code handler
  const handleDownloadQR = (vehicleNumber: string) => {
    setQrVehicleId(vehicleNumber);
    setTimeout(() => {
      const svg = qrRef.current?.querySelector('svg');
      if (!svg) return;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const canvas = document.createElement('canvas');
      const img = new window.Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const pngFile = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngFile;
          downloadLink.download = `vehicle-qr-${vehicleNumber}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      };
      img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgString)));
    }, 100); // Wait for QR to render
  };

  // Define columns for the vehicle table
  const columns = [
    { key: 'vehicleNumber', title: 'Vehicle Number' },
    { key: 'city', title: 'City', render: (value: any) => value?.name || '-' },
    { key: 'hub', title: 'Hub', render: (value: any) => value?.name || '-' },
    { key: 'supervisor', title: 'Supervisor', render: (value: any) => value?.name || "_"},
    { key: 'vehicleType', title: 'Type', render: (value: any) => value?.name || '-' },
    { key: 'oem', title: 'OEM', render: (value: any) => value?.name || '-' },
    { key: 'vehicleModel', title: 'Model', render: (value: any) => value?.name || '-' },
    { key: 'vehicleRCNumber', title: 'RC Number' },
    {
      key: 'currentAssignment',
      title: 'Assigned To',
      render: (value: any) => {
        if (!value) return '-';
        const rider = value.rider;
        return rider ? `${rider?.accountRef?.name || rider.identifier} (${rider.identifier || 'No phone'})` : 'Unknown Rider';
      },
    },
    {
      key: 'numberPlateStatus',
      title: 'Number Plate Status',
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
    { key: 'invoiceAmount', title: 'Invoice Amount' },
    { key: 'deliveryDate', title: 'Delivery Date', render: (value: any) => value ? new Date(value).toLocaleDateString() : '-' },
    {
      key: 'actions',
      title: 'Action',
      render: (_value: any, record: any) => (
        <ActionDropdown
          items={[
            {
              label: 'Edit',
              onClick: () => navigate(`/add-vehicle/${record.id}`),
            },
            {
              label: 'Download QR',
              onClick: () => handleDownloadQR(record.vehicleNumber),
            },
          ]}
        />
      ),
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
      {/* Hidden QR code renderer for download */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} ref={qrRef}>
        {qrVehicleId && <QRCode value={qrVehicleId} size={256} />}
      </div>
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
          <Table
            columns={columns}
            data={tableData}
            isLoading={loadingVehicles}
            actionButtonLabel="+ New Vehicle"
            onActionButtonClick={() => navigate('/add-vehicle')}
            showSearch
            searchValue={search}
            onSearchChange={(v) => { setPage(1); setSearch(v); }}
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

      </div>
    </Layout>
  );
};

export default VehicleMaster; 