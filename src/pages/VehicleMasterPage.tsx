import React, { useState } from "react";
import Button from "../components/Button";
import ActionDropdown from "../components/ActionDropdown";
import { useNavigate } from "react-router-dom";
import { useVehicleList, type VehiclePage } from "../hooks/useVehicles";
import QRCodeGenerator from "../components/QRCodeGenerator";
import {
  FiTruck,
  FiFileText,
  FiPackage,
  FiTool,
  FiAlertTriangle,
} from "react-icons/fi";

const VehicleMaster: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedVehicleForQR, setSelectedVehicleForQR] =
    useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [sort, setSort] = useState("Latest");
  const [status, setStatus] = useState("Pending");

  const { data: vehiclePage } = useVehicleList(page, limit, submittedSearch);
  const vehicles = (vehiclePage as VehiclePage | undefined)?.items ?? [];
  const total = (vehiclePage as VehiclePage | undefined)?.total ?? 0;

  const summaryCards = [
    {
      label: "Total Vehicles",
      value: total.toString(),
      icon: <FiTruck className="w-8 h-8 text-[#3B36FF]" />,
      link: "View List",
    },
    {
      label: "Vehicles Rented",
      value: "450",
      icon: <FiFileText className="w-8 h-8 text-[#FF6B00]" />,
      link: "View all orders",
    },
    {
      label: "Accessories",
      value: "560",
      icon: <FiPackage className="w-8 h-8 text-[#FF3D57]" />,
      link: "View List",
    },
    {
      label: "Rented Accessories",
      value: "160",
      icon: <FiTool className="w-8 h-8 text-[#00B894]" />,
      link: "View List",
    },
    {
      label: "Documents Expired",
      value: "560",
      icon: <FiAlertTriangle className="w-8 h-8 text-[#FFC107]" />,
      link: "View List",
    },
  ];

  const tabs = [
    "All Vehicles",
    "Rented Vehicles",
    "All Accessories",
    "Accessories Rented",
    "Maintenance",
    "Documents Expired",
    "Disassembles",
  ];

  const handleShowQR = (vehicleNumber: string) => {
    setSelectedVehicleForQR(vehicleNumber);
    setShowQRModal(true);
  };

  return (
    <div className="min-h-screen bg-[#f6f7ff] p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-[#3B36FF]">
          Vehicle Master
        </h2>
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary">+ New Accessories</Button>
          <Button variant="primary" onClick={() => navigate("/add-vehicle")}>
            + New Vehicle
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow p-4 flex flex-col gap-2"
          >
            <div className="flex items-center gap-3">
              {card.icon}
              <span className="text-2xl font-bold">{card.value}</span>
            </div>
            <div className="text-sm text-gray-500 font-medium">
              {card.label}
            </div>
            <a
              href="#"
              className="text-sm text-[#3B36FF] font-medium hover:underline"
            >
              {card.link}
            </a>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {tabs.map((tab, idx) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              activeTab === idx
                ? "bg-[#3B36FF] text-white"
                : "bg-white text-gray-600 border"
            }`}
            onClick={() => setActiveTab(idx)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex gap-2 flex-1">
          <input
            type="text"
            placeholder="Search"
            className="px-3 py-2 border rounded-lg text-sm flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSubmittedSearch(search)}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="Latest">Show: Latest</option>
            <option value="Oldest">Show: Oldest</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="Pending">Status: Pending</option>
            <option value="Active">Status: Active</option>
            <option value="Inactive">Status: Inactive</option>
          </select>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate("/add-vehicle")}
          className="self-start md:self-auto"
        >
          + New Vehicle
        </Button>
      </div>

      {/* Table for Desktop/Tablet */}
      <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full table-auto text-xs border border-gray-200">
          <thead className="bg-gray-50 text-gray-600 font-semibold">
            <tr>
              <th className="px-3 py-2 text-left">
                <input type="checkbox" />
              </th>
              <th className="px-3 py-2 text-left">Vehicle #</th>
              <th className="px-3 py-2 text-left">Boarded On</th>
              <th className="px-3 py-2 text-left">Hub Location</th>
              <th className="px-3 py-2 text-left">RC/F</th>
              <th className="px-3 py-2 text-left">Insurance Exp</th>
              <th className="px-3 py-2 text-left">Vendor</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Model</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Inclusions</th>
              <th className="px-3 py-2 text-left">Asset Code</th>
              <th className="px-3 py-2 text-left">Supervisor</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v: any, idx: number) => (
              <tr
                key={v._id}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="px-3 py-2">
                  <input type="checkbox" />
                </td>
                <td
                  className="px-3 py-2 cursor-pointer"
                  onClick={() => navigate(`/add-vehicle/${v._id}`)}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src="/vehicle-placeholder.png"
                      alt="vehicle"
                      className="w-8 h-8 rounded object-cover"
                    />
                    <div>
                      <p className="font-semibold text-[#3B36FF] hover:underline">
                        {v.vehicleNumber || "DL52 12346"}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Two Wheeler / Battery Operated
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-2">12-04-2025</td>
                <td className="px-3 py-2">
                  {v.hub?.name || "Noida Uttar Pradesh"}
                </td>
                <td className="px-3 py-2">1234567890</td>
                <td className="px-3 py-2">12-04-2025</td>
                <td className="px-3 py-2">{v.vendor || "Sun Mobility"}</td>
                <td className="px-3 py-2">{v.evType?.name || "2 Wheeler"}</td>
                <td className="px-3 py-2">
                  {v.vehicleModel?.name || "i-Praise"}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      v.status === "Retired"
                        ? "bg-red-100 text-red-600"
                        : v.status === "Pending"
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {v.status || "Active"}
                  </span>
                </td>
                <td className="px-3 py-2">Helmet</td>
                <td className="px-3 py-2">UP32 AN9012</td>
                <td className="px-3 py-2">ABC005</td>
                <td className="px-3 py-2 text-right">
                  <ActionDropdown
                    items={[
                      {
                        label: "Edit",
                        onClick: () => navigate(`/add-vehicle/${v._id}`),
                      },
                      {
                        label: "Generate QR",
                        onClick: () => handleShowQR(v.vehicleNumber),
                      },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Card layout for Mobile */}
      <div className="md:hidden space-y-4">
        {vehicles.map((v: any, idx: number) => (
          <div
            key={v._id}
            className="bg-white rounded-xl shadow p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/vehicle-placeholder.png"
                  alt="vehicle"
                  className="w-10 h-10 rounded object-cover"
                />
                <div>
                  <p className="font-semibold text-[#3B36FF]">
                    {v.vehicleNumber || "DL52 12346"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Two Wheeler / Battery Operated
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  v.status === "Retired"
                    ? "bg-red-100 text-red-600"
                    : v.status === "Pending"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {v.status || "Active"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <p className="text-gray-500">Boarded On</p>
              <p>12-04-2025</p>

              <p className="text-gray-500">Hub Location</p>
              <p>{v.hub?.name || "Noida Uttar Pradesh"}</p>

              <p className="text-gray-500">RC/F</p>
              <p>1234567890</p>

              <p className="text-gray-500">Insurance Exp</p>
              <p>12-04-2025</p>

              <p className="text-gray-500">Vendor</p>
              <p>{v.vendor || "Sun Mobility"}</p>

              <p className="text-gray-500">Type</p>
              <p>{v.evType?.name || "2 Wheeler"}</p>

              <p className="text-gray-500">Model</p>
              <p>{v.vehicleModel?.name || "i-Praise"}</p>

              <p className="text-gray-500">Asset Code</p>
              <p>UP32 AN9012</p>

              <p className="text-gray-500">Supervisor</p>
              <p>ABC005</p>

              <p className="text-gray-500">Inclusions</p>
              <p>Helmet</p>
            </div>

            <div className="flex justify-end">
              <ActionDropdown
                items={[
                  {
                    label: "Edit",
                    onClick: () => navigate(`/add-vehicle/${v._id}`),
                  },
                  {
                    label: "Generate QR",
                    onClick: () => handleShowQR(v.vehicleNumber),
                  },
                ]}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-500 flex-wrap gap-2">
        <p>
          Showing data 1 to {limit} of {total} entries
        </p>
        <div className="flex gap-2 flex-wrap">
          {[1, 2, 3, 4, "...", 40].map((p, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded ${
                page === p
                  ? "bg-[#3B36FF] text-white"
                  : "bg-white border text-gray-600"
              }`}
              onClick={() => typeof p === "number" && setPage(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* QR Modal */}
      {showQRModal && selectedVehicleForQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Vehicle QR Code
              </h3>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setSelectedVehicleForQR(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
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
  );
};

export default VehicleMaster;
