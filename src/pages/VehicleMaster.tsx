import React, { useState } from 'react';
import Layout from '../components/Layout';
import CollapsibleTable from '../components/CollapsibleTable';
import type { CollapsibleColumn } from '../components/CollapsibleTable';
import Button from '../components/Button';
import ActionDropdown from '../components/ActionDropdown';
import { useNavigate } from 'react-router-dom';
import { useVehicleList, useAllVehicles, useMaintenanceVehicles, type VehiclePage } from '../hooks/useVehicles';
import { useVehicleAssetList, useAssetStatistics, type VehicleAssetPage } from '../hooks/useVehicleAssets';
import QRCodeGenerator from '../components/QRCodeGenerator';
import BulkQRCodeGenerator from '../components/BulkQRCodeGenerator';
import { FiTruck, FiFileText, FiPackage, FiTool, FiAlertTriangle, FiUser, FiMapPin, FiCode, FiLoader } from 'react-icons/fi';

const VehicleMaster: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedVehicleForQR, setSelectedVehicleForQR] = useState<string | null>(null);
  const [showBulkQRModal, setShowBulkQRModal] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [rentedFilter, setRentedFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Determine the rented filter based on active tab
  const getRentedFilterForTab = () => {
    if (activeTab === 1) { // "Rented Vehicles" tab
      return 'true';
    }
    return rentedFilter; // Use manual filter for other tabs
  };

  const { data: vehiclePage, isLoading: loadingVehicles } = useVehicleList(page, limit, submittedSearch, getRentedFilterForTab(), statusFilter);
  const vehicles = (vehiclePage as VehiclePage | undefined)?.items ?? [];
  const total = (vehiclePage as VehiclePage | undefined)?.total ?? 0;

  // Maintenance vehicles data
  const { data: maintenancePage, isLoading: loadingMaintenance } = useMaintenanceVehicles(page, limit, submittedSearch);
  const maintenanceVehicles = (maintenancePage as VehiclePage | undefined)?.items ?? [];
  const maintenanceTotal = (maintenancePage as VehiclePage | undefined)?.total ?? 0;

  // Hook for fetching all vehicles for bulk QR generation
  const {
    data: allVehicles = [],
    isLoading: loadingAllVehicles,
    error: allVehiclesError,
    refetch: refetchAllVehicles
  } = useAllVehicles(submittedSearch, getRentedFilterForTab(), {
    enabled: false, // Don't fetch automatically
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: 1000, // Wait 1 second between retries
  });

  // Assets data
  const { data: assetsPage, isLoading: loadingAssets } = useVehicleAssetList(page, limit, {
    status: activeTab === 3 ? 'assigned' : undefined, // "Accessories Rented" tab
  });
  const assets = (assetsPage as VehicleAssetPage | undefined)?.items ?? [];
  const assetsTotal = (assetsPage as VehicleAssetPage | undefined)?.total ?? 0;

  // Asset statistics
  const { data: assetStats } = useAssetStatistics();
  // const totalPages = (vehiclePage as VehiclePage | undefined)?.totalPages ?? 1;

  const summaryCards = [
    {
      label: 'Total Vehicles',
      value: assetStats?.totalVehicles?.toString() || total.toString(),
      icon: <FiTruck className="w-6 h-6" />,
      link: 'View List',
    },
    {
      label: 'Vehicles Rented',
      value: assetStats?.rentedVehicles?.toString() || '0',
      icon: <FiFileText className="w-6 h-6" />,
      link: 'View all orders',
    },
    {
      label: 'Accessories',
      value: assetStats?.total?.toString() || '0',
      icon: <FiPackage className="w-6 h-6" />,
      link: 'View List',
    },
    {
      label: 'Rented Accessories',
      value: assetStats?.assigned?.toString() || '0',
      icon: <FiTool className="w-6 h-6" />,
      link: 'View List',
    },
    {
      label: 'Vehicles in Maintenance',
      value: assetStats?.maintenanceVehicles?.toString() || '0',
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

  // Tab click handler
  const handleTabClick = (tabIndex: number) => {
    setActiveTab(tabIndex);
    setPage(1); // Reset to first page when changing tabs

    // Reset manual filter when switching to "Rented Vehicles" tab
    if (tabIndex === 1) {
      setRentedFilter('');
    }
    
    // Reset status filter when changing tabs
    setStatusFilter('');
  };



  // Define collapsible columns for the vehicle table
  const vehicleCollapsibleColumns: CollapsibleColumn[] = [
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
      key: 'vehicleStatus',
      title: 'Vehicle Status',
      essential: true,
      render: (value: any) => {
        let color = 'bg-gray-100 text-gray-800 border-gray-300';
        let dot = 'bg-gray-400';
        let label = 'Unknown';
        
        switch (value) {
          case 'available':
            color = 'bg-green-100 text-green-800 border-green-300';
            dot = 'bg-green-500';
            label = 'Available';
            break;
          case 'assigned':
            color = 'bg-blue-100 text-blue-800 border-blue-300';
            dot = 'bg-blue-500';
            label = 'Assigned';
            break;
          case 'maintenance':
            color = 'bg-yellow-100 text-yellow-800 border-yellow-300';
            dot = 'bg-yellow-500';
            label = 'Maintenance';
            break;
          case 'damaged':
            color = 'bg-red-100 text-red-800 border-red-300';
            dot = 'bg-red-500';
            label = 'Damaged';
            break;
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
      key: 'numberPlateStatus',
      title: 'Number Plate Status',
      essential: false,
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
    //vehicle vendor
    {
      key: 'vehicleVendor',
      title: 'Vehicle Vendor',
      essential: true,
      render: (value: any) => (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-900">{value?.name || '-'}</span>
        </div>
      )
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
      essential: false,
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

  // Define collapsible columns for the assets table
  const assetCollapsibleColumns: CollapsibleColumn[] = [
    {
      key: 'assetName',
      title: 'Asset Name',
      essential: true,
      render: (value, record) => (
        <div className="flex items-center gap-3">
          {record.image ? (
            <img
              src={record.image}
              alt={value || 'Asset'}
              className="w-10 h-10 object-cover rounded-md border border-gray-200 flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200 flex-shrink-0">
              <FiPackage className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span
              className="font-semibold text-gray-900 cursor-pointer hover:text-indigo-600 hover:underline truncate"
              onClick={() => navigate(`/add-asset/${record.id}`)}
              title={value || 'Unnamed Asset'}
            >
              {value || 'Unnamed Asset'}
            </span>
            {record.serialNumber && (
              <span className="text-xs text-gray-500 truncate">
                SN: {record.serialNumber}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'assetType',
      title: 'Asset Type',
      essential: true,
      render: (value: any) => (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-900">{value?.name || '-'}</span>
        </div>
      )
    },
    {
      key: 'assetVendor',
      title: 'Vendor',
      essential: true,
      render: (value: any) => (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-900">{value?.name || '-'}</span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Status',
      essential: true,
      render: (value: any) => {
        let color = 'bg-yellow-100 text-yellow-800 border-yellow-300';
        let dot = 'bg-yellow-400';
        let label = 'Pending';
        if (value === 'available') {
          color = 'bg-green-100 text-green-800 border-green-300';
          dot = 'bg-green-500';
          label = 'Available';
        } else if (value === 'assigned') {
          color = 'bg-blue-100 text-blue-800 border-blue-300';
          dot = 'bg-blue-500';
          label = 'Assigned';
        } else if (value === 'maintenance') {
          color = 'bg-orange-100 text-orange-800 border-orange-300';
          dot = 'bg-orange-500';
          label = 'Maintenance';
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
      key: 'ownership',
      title: 'Ownership',
      essential: true,
      render: (value: any) => (
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${value === 'owned'
          ? 'bg-green-100 text-green-800 border border-green-300'
          : 'bg-blue-100 text-blue-800 border border-blue-300'
          }`}>
          {value === 'owned' ? 'Owned' : 'Rented'}
        </span>
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
              onClick: () => navigate(`/add-asset/${record.id}`),
            },
            {
              label: 'Assign',
              onClick: () => {
                // TODO: Implement assign functionality
                console.log('Assign asset:', record.id);
              },
            },
            {
              label: 'Delete',
              onClick: () => {
                // TODO: Implement delete functionality
                console.log('Delete asset:', record.id);
              },
            },
          ]}
        />
      ),
    },
    {
      key: 'serialNumber',
      title: 'Serial Number',
      essential: false,
      render: (value: any) => value || '-'
    },
    {
      key: 'condition',
      title: 'Condition',
      essential: false,
      render: (value: any) => {
        let color = 'bg-gray-100 text-gray-800 border-gray-300';
        let label = 'Unknown';
        if (value === 'new') {
          color = 'bg-green-100 text-green-800 border-green-300';
          label = 'New';
        } else if (value === 'good') {
          color = 'bg-blue-100 text-blue-800 border-blue-300';
          label = 'Good';
        } else if (value === 'fair') {
          color = 'bg-yellow-100 text-yellow-800 border-yellow-300';
          label = 'Fair';
        } else if (value === 'poor') {
          color = 'bg-red-100 text-red-800 border-red-300';
          label = 'Poor';
        }
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold border ${color}`}>
            {label}
          </span>
        );
      },
    },

    {
      key: 'assignedTo',
      title: 'Assigned To',
      essential: false,
      render: (value: any) => {
        if (!value) return <span className="text-gray-400">Not Assigned</span>;
        return (
          <div className="flex items-center gap-2">
            <FiUser className="text-blue-600 w-4 h-4" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">{value.name || 'Unknown'}</span>
              <span className="text-xs text-gray-500">{value.authRef?.identifier || 'No Phone'}</span>
            </div>
          </div>
        );
      }
    },
    {
      key: 'notes',
      title: 'Notes',
      essential: false,
      render: (value: any) => value || '-'
    },
    {
      key: 'addedBy',
      title: 'Added By',
      essential: false,
      render: (value: any) => value?.name || '-'
    },
    {
      key: 'createdAt',
      title: 'Created Date',
      essential: false,
      render: (value: any) => value ? new Date(value).toLocaleDateString() : '-'
    },
  ];

  // Define collapsible columns for maintenance vehicles
  const maintenanceCollapsibleColumns: CollapsibleColumn[] = [
    {
      key: 'vehicleNumber',
      title: 'Vehicle Number',
      essential: true,
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <FiTruck className="text-orange-600 w-4 h-4" />
          <span
            className="font-semibold text-gray-900 cursor-pointer hover:text-orange-600 hover:underline"
            onClick={() => navigate(`/add-vehicle/${record.id}`)}
          >
            {value}
          </span>
        </div>
      )
    },
    {
      key: 'maintenanceInfo',
      title: 'Maintenance Info',
      essential: true,
      render: (_value: any, record: any) => {
        const maintenanceAssignment = record.maintenanceAssignment;
        if (!maintenanceAssignment) {
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900">
                Maintenance Date: {record.maintenanceDate ? new Date(record.maintenanceDate).toLocaleDateString('en-GB') : 'N/A'}
              </span>
              <span className="text-xs text-gray-500">No detailed maintenance info</span>
            </div>
          );
        }
        
        return (
          <div className="flex flex-col">
            <div className="text-sm font-medium text-gray-900">
              {maintenanceAssignment.notes || 'No maintenance reason provided'}
            </div>
            <div className="text-xs text-gray-500">
              Date: {maintenanceAssignment.maintenanceDate ? new Date(maintenanceAssignment.maintenanceDate).toLocaleDateString('en-GB') : 'N/A'}
            </div>
            {maintenanceAssignment.assignedBy && (
              <div className="text-xs text-blue-600">
                By: {maintenanceAssignment.assignedBy.name || 'Unknown'}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'vehicleModel',
      title: 'Model',
      essential: true,
      render: (value: any) => (
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-900">{value?.name || '-'}</span>
        </div>
      )
    },
    {
      key: 'vehicleType',
      title: 'Type',
      essential: true,
      render: (value: any) => value?.name || '-'
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
      key: 'hub',
      title: 'Hub',
      essential: false,
      render: (value: any) => value?.name || '-'
    },
    {
      key: 'actions',
      title: 'Action',
      essential: true,
      render: (_value: any, record: any) => (
        <ActionDropdown
          items={[
            {
              label: 'View Details',
              onClick: () => navigate(`/add-vehicle/${record.id}`),
            },
            {
              label: 'Mark Available',
              onClick: () => {
                // TODO: Implement mark available functionality
                console.log('Mark vehicle available:', record.id);
              },
            },
          ]}
        />
      ),
    },
    {
      key: 'evType',
      title: 'EV Type',
      essential: false,
      render: (value: any) => value?.name || '-'
    },
    {
      key: 'vehicleVendor',
      title: 'Vendor',
      essential: false,
      render: (value: any) => value?.name || '-'
    },
    {
      key: 'vehicleRCNumber',
      title: 'RC Number',
      essential: false
    },
    {
      key: 'chassisNumber',
      title: 'Chassis Number',
      essential: false
    },
    {
      key: 'batteryNumber',
      title: 'Battery Number',
      essential: false
    },
    {
      key: 'supervisor',
      title: 'Supervisor',
      essential: false,
      render: (value: any) => value?.name || '-'
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
    vehicleVendor: v.vehicleVendor,
    vehicleRCNumber: v.vehicleRCNumber,
    vehicleStatus: v.vehicleStatus,
    numberPlateStatus: v.numberPlateStatus,
    invoiceAmount: v.invoiceAmount,
    deliveryDate: v.deliveryDate,
    currentAssignment: v.currentAssignment,
  }));

  // Map maintenance vehicles to table data
  const maintenanceTableData = maintenanceVehicles.map((v: any) => ({
    id: v._id,
    vehicleNumber: v.vehicleNumber,
    city: v.city,
    hub: v.hub,
    supervisor: v.supervisor,
    vehicleType: v.vehicleType,
    evType: v.evType,
    oem: v.oem,
    vehicleModel: v.vehicleModel,
    vehicleVendor: v.vehicleVendor,
    vehicleRCNumber: v.vehicleRCNumber,
    chassisNumber: v.chassisNumber,
    batteryNumber: v.batteryNumber,
    maintenanceAssignment: v.maintenanceAssignment,
    maintenanceDate: v.maintenanceDate,
  }));

  // Map assets to table data
  const assetsTableData = assets.map((asset: any) => ({
    id: asset._id,
    assetName: asset.assetName,
    assetType: asset.assetType,
    assetVendor: asset.assetVendor,
    status: asset.status,
    condition: asset.condition,
    serialNumber: asset.serialNumber,
    ownership: asset.ownership,
    image: asset.image,
    assignedTo: asset.assignedTo,
    notes: asset.notes,
    addedBy: asset.addedBy,
    createdAt: asset.createdAt,
  }));

  return (
    <Layout>

      <div className="min-h-screen bg-[#f6f7ff] p-8">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-[#3B36FF]">Vehicle Master</h2>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                refetchAllVehicles();
                setShowBulkQRModal(true);
              }}
              disabled={loadingAllVehicles}
              className="flex items-center gap-2"
            >
              {loadingAllVehicles ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <FiCode className="w-4 h-4" />
                  Import All Vehicle QR
                </>
              )}
            </Button>
            <Button variant="secondary" onClick={() => navigate("/add-asset")}>+ New Accessories</Button>
            <Button variant="primary" onClick={() => navigate("/add-vehicle")}>+ New Vehicle</Button>
          </div>
        </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {summaryCards.map((card, index) => (
            <div 
              key={card.label} 
              className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => {
                if (card.label === 'Vehicles in Maintenance') {
                  setActiveTab(4); // Switch to maintenance tab
                }
              }}
            >
              <div className="flex items-center gap-2">
                <div className="text-gray-600">{card.icon}</div>
                <span className="text-lg font-semibold">{card.value}</span>
              </div>
              <div className="text-xs text-gray-500 font-medium">{card.label}</div>
              <div className="text-xs text-[#3B36FF] font-medium hover:underline">{card.link}</div>
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
              onClick={() => handleTabClick(idx)}
            >
              {tab}
            </button>
          ))}
        </div>
        {/* Filters */}
        {activeTab === 0 && (
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Ownership:</label>
              <select
                value={rentedFilter}
                onChange={(e) => {
                  setRentedFilter(e.target.value);
                  setPage(1); // Reset to first page when filter changes
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="">All Vehicles</option>
                <option value="false">Owned Vehicles</option>
                <option value="true">Rented Vehicles</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1); // Reset to first page when filter changes
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="">All Status</option>
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="maintenance">Maintenance</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
          </div>
        )}

        {/* Vehicle Table */}
        {(activeTab === 0 || activeTab === 1) && (
          <CollapsibleTable
            columns={vehicleCollapsibleColumns}
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

        {/* Maintenance Table */}
        {activeTab === 4 && (
          <CollapsibleTable
            columns={maintenanceCollapsibleColumns}
            data={maintenanceTableData}
            isLoading={loadingMaintenance}
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
            searchPlaceholder="Search maintenance vehicles by number, model, type..."
            skeletonRows={8}
            skeletonShowStatus={true}
            skeletonShowActions={true}
            pagination={{
              page,
              limit,
              total: maintenanceTotal,
              onPageChange: setPage,
              onLimitChange: (n) => { setPage(1); setLimit(n); },
              pageSizeOptions: [10, 20, 50],
            }}
          />
        )}

        {/* Assets Table */}
        {(activeTab === 2 || activeTab === 3) && (
          <CollapsibleTable
            columns={assetCollapsibleColumns}
            data={assetsTableData}
            isLoading={loadingAssets}
            actionButtonLabel="+ New Accessories"
            onActionButtonClick={() => navigate('/add-asset')}
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
            searchPlaceholder="Search assets by name, type, serial number..."
            skeletonRows={8}
            skeletonShowStatus={true}
            skeletonShowActions={true}
            pagination={{
              page,
              limit,
              total: assetsTotal,
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

        {/* Bulk QR Code Generator Modal */}
        {showBulkQRModal && (
          <BulkQRCodeGenerator
            vehicles={allVehicles}
            onClose={() => setShowBulkQRModal(false)}
            isLoading={loadingAllVehicles}
            error={allVehiclesError}
            onRetry={refetchAllVehicles}
          />
        )}

      </div>
    </Layout>
  );
};

export default VehicleMaster; 