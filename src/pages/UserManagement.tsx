import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Table from "../components/Table";
import type { Column } from "../components/Table";
import { useRidersAndSupervisors } from "../hooks/useUsers";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import Modal from "../components/Modal";
import ActionDropdown from "../components/ActionDropdown";
import SearchableSelect from "../components/SearchableSelect";
import api from "../services/api";
import { ProfileCode } from "../components/general";
import { formatTableData } from "../utils/helper";
import { localStorageHelper } from "../utils/localStorageHelper";

const TABS = [
  { label: "Supervisor", value: "supervisor" },
  { label: "Rider", value: "rider" },
];

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("supervisor");
  const { data, isLoading, error } = useRidersAndSupervisors();
  const navigate = useNavigate();
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    riderProfileCode: "",
    supervisorId: "",
  });
  const [assignError, setAssignError] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState("");

  const tableData =
    activeTab === "supervisor" ? data?.supervisors : data?.riders;

  useEffect(() => {
    const activeTab = localStorageHelper.get("ACTIVE_TAB");
    if (!activeTab) return;
    setActiveTab(activeTab);
  }, []);

  const handleViewUserDetails = (id: string) => {
    navigate(`/add-user/${id}`);
  };

  const handleDeactivate = (id: string) => {
    alert("Deactivate user: " + id);
  };

  const handleAssignChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setAssignForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assignForm.riderProfileCode || !assignForm.supervisorId) {
      setAssignError("Both fields are required");
      return;
    }

    setAssignLoading(true);
    setAssignError("");
    setAssignSuccess("");

    try {
      // Call the assign rider API
      await api.post("/supervisor-rider/assign-rider", {
        riderProfileCode: assignForm.riderProfileCode,
        supervisorId: assignForm.supervisorId,
      });

      setAssignSuccess("Rider assigned successfully!");
      setAssignForm({ riderProfileCode: "", supervisorId: "" });

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowAssignModal(false);
        setAssignSuccess("");
      }, 2000);
    } catch (error: any) {
      console.error("Error assigning rider:", error);
      setAssignError(
        error.response?.data?.message ||
          "Failed to assign rider. Please try again."
      );
    } finally {
      setAssignLoading(false);
    }
  };

  const handleToggleTab = (activeTab: string) => {
    localStorageHelper.set("ACTIVE_TAB", activeTab);
    setActiveTab(activeTab);
  };

  const supervisorOptions = (data?.supervisors || []).map((sup: any) => ({
    label: `${sup.name}${sup.profileCode ? ` (${sup.profileCode})` : ""}${sup.authRef?.identifier ? ` - ${sup.authRef.identifier}` : ""}`,
    value: sup._id,
  }));

  const columns: Column[] = [
    {
      key: "name",
      title: "Name",
      render: (value, record) => (
        <div className="flex items-center gap-2">
          {record.profilePicture ? (
            <img
              src={record.profilePicture}
              alt={value}
              className="w-10 h-10 rounded-full border border-gray-200 object-cover bg-gray-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-indigo-100 text-indigo-600 font-semibold">
              {value.charAt(0)}
            </div>
          )}
          <div>
            <div
              className="font-semibold text-primary cursor-pointer hover:underline mb-1"
              onClick={() => handleViewUserDetails(record.id)}
            >
              {value}
            </div>
            <ProfileCode record={record} />
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      title: "Phone #",
    },
    {
      key: "status",
      title: "Status",
      render: (value, record) => {
        const getStatusStyles = (color: string) => {
          switch (color) {
            case "green":
              return "bg-green-100 text-green-700";
            case "red":
              return "bg-red-100 text-red-700";
            case "orange":
              return "bg-orange-100 text-orange-700";
            case "yellow":
            default:
              return "bg-yellow-100 text-yellow-700";
          }
        };

        const getDotStyles = (color: string) => {
          switch (color) {
            case "green":
              return "bg-green-500";
            case "red":
              return "bg-red-500";
            case "orange":
              return "bg-orange-500";
            case "yellow":
            default:
              return "bg-yellow-500";
          }
        };

        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusStyles(
              record.statusColor
            )}`}
          >
            <span
              className={`mr-1 w-2 h-2 rounded-full ${getDotStyles(
                record.statusColor
              )}`}
            ></span>
            {value}
          </span>
        );
      },
    },
    {
      key: "lastLogin",
      title: "Last Login",
      render: (value) => {
        if (!value) return "Never";
        const dateObj = new Date(value);
        const day = String(dateObj.getDate()).padStart(2, "0");
        const month = String(dateObj.getMonth() + 1).padStart(2, "0");
        const year = dateObj.getFullYear();
        const hours = String(dateObj.getHours()).padStart(2, "0");
        const minutes = String(dateObj.getMinutes()).padStart(2, "0");
        return `${day}-${month}-${year} ${hours}:${minutes}`;
      },
    },
    // Additional fields for riders only
    ...(activeTab === "rider" ? [
      {
        key: "aadharNumber",
        title: "Aadhar Number",
        render: (value: any) => value || "-",
      },
      {
        key: "drivingLicenseNumber",
        title: "DL Number",
        render: (value: any) => value || "-",
      },
      {
        key: "dateOfBirth",
        title: "Date of Birth",
        render: (value: any) => {
          if (!value) return "-";
         return value;
        },
      },
      {
        key: "onboardDate",
        title: "Onboard Date",
        render: (value: any) => {
          if (!value) return "-";
          const dateObj = new Date(value);
          const day = String(dateObj.getDate()).padStart(2, "0");
          const month = String(dateObj.getMonth() + 1).padStart(2, "0");
          const year = dateObj.getFullYear();
          return `${day}-${month}-${year}`;
        },
      },
      {
        key: "address",
        title: "Address",
        render: (value: any, record: any) => {
          if (!value && !record.address) return "-";
          const address = value || record.address;
          if (typeof address === "string") return address;
          if (typeof address === "object") {
            const parts = [];
            if (address.address) parts.push(address.address);
            if (address.cityDistrict) parts.push(address.cityDistrict);
            if (address.state) parts.push(address.state);
            if (address.pinCode) parts.push(address.pinCode);
            return parts.length > 0 ? parts.join(", ") : "-";
          }
          return "-";
        },
      },
    ] : []),
    {
      key: "actions",
      title: "Action",
      render: (_value, record) => (
        <ActionDropdown
          items={[
            {
              label: "Edit Details",
              onClick: () => handleViewUserDetails(record.id),
            },
            {
              label: "Deactivate User",
              onClick: () => handleDeactivate(record.id),
              className: "text-red-600 hover:bg-red-50",
            },
          ]}
        />
      ),
    },
  ];

  return (
    <Layout>
      <div className="p-8">
        <div className="flex gap-4 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              className={`px-6 py-2 rounded-t-lg font-semibold focus:outline-none transition-colors border-b-2 ${
                activeTab === tab.value
                  ? "bg-white border-indigo-600 text-indigo-700"
                  : "bg-indigo-100 border-transparent text-indigo-400 hover:text-indigo-600"
              }`}
              onClick={() => handleToggleTab(tab.value)}
              type="button"
            >
              {tab.label} (
              {data?.total[
                tab.value === "supervisor" ? "supervisors" : "riders"
              ] || 0}
              )
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
            <SearchableSelect
              label="Select Supervisor"
              value={assignForm.supervisorId}
              onChange={(value) => setAssignForm(prev => ({ ...prev, supervisorId: value }))}
              options={supervisorOptions}
              placeholder={`Search and select a supervisor (${supervisorOptions.length} available)...`}
              required
            />
            {assignError && (
              <div className="text-red-500 text-sm">{assignError}</div>
            )}
            {assignSuccess && (
              <div className="text-green-600 text-sm">{assignSuccess}</div>
            )}
            <div className="flex gap-2 justify-end mt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setShowAssignModal(false)}
                disabled={assignLoading}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={assignLoading}>
                {assignLoading ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default UserManagement;
