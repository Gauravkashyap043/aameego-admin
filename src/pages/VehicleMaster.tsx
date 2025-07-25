import React, { useState } from 'react';
import Layout from '../components/Layout';
import Table from '../components/Table';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { useVehicleList } from '../hooks/useVehicles';
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
  const [actionDropdown, setActionDropdown] = useState<string | null>(null);
  const [qrVehicleId, setQrVehicleId] = useState<string | null>(null);
  const qrRef = React.useRef<HTMLDivElement>(null);

  const { data: vehicles = [], isLoading: loadingVehicles } = useVehicleList();

  // Define columns for the vehicle table
  const columns = [
    { key: 'vehicleNumber', title: 'Vehicle Number' },
    { key: 'city', title: 'City', render: (value: any) => value?.name || '-' },
    { key: 'hub', title: 'Hub', render: (value: any) => value?.name || '-' },
    { key: 'supervisor', title: 'Supervisor', render: (value: any) => value?.name || value?.identifier || '-' },
    { key: 'vehicleType', title: 'Type', render: (value: any) => value?.name || '-' },
    { key: 'oem', title: 'OEM', render: (value: any) => value?.name || '-' },
    { key: 'vehicleModel', title: 'Model', render: (value: any) => value?.name || '-' },
    { key: 'vehicleRCNumber', title: 'RC Number' },
    {
      key: 'numberPlateStatus',
      title: 'Status',
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
                onClick={() => { navigate(`/add-vehicle/${record.id}`); setActionDropdown(null); }}
              >
                View
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-indigo-50"
                onClick={() => { navigate(`/add-vehicle/${record.id}`); setActionDropdown(null); }}
              >
                Edit
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-indigo-50"
                onClick={() => { handleDownloadQR(record.id); setActionDropdown(null); }}
              >
                Download QR
              </button>
            </div>
          )}
        </div>
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
  }));

  // Download QR code handler
  const handleDownloadQR = (vehicleId: string) => {
    setQrVehicleId(vehicleId);
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
          downloadLink.download = `vehicle-qr-${vehicleId}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
      };
      img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgString)));
    }, 100); // Wait for QR to render
  };

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
          />
        )}
      </div>
    </Layout>
  );
};

export default VehicleMaster; 