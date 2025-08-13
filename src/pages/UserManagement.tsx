import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Table from "../components/Table";
import type { Column } from "../components/Table";
import { useRidersAndSupervisors, useUsersByRole } from "../hooks/useUsers";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import InputField from "../components/InputField";
import Modal from "../components/Modal";
import ActionDropdown from "../components/ActionDropdown";
import SearchableSelect from "../components/SearchableSelect";
import api from "../services/api";
import { ProfileCode } from "../components/general";

import { localStorageHelper } from "../utils/localStorageHelper";

const TABS = [
  { label: "Supervisor", value: "supervisor" },
  { label: "Rider", value: "rider" },
];

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("supervisor");
  const navigate = useNavigate();
  
  // Pagination and search state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Assignment modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    riderProfileCode: "",
    supervisorId: "",
  });
  const [assignError, setAssignError] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSuccess, setAssignSuccess] = useState("");

  // Profile picture modal state
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [selectedProfilePicture, setSelectedProfilePicture] = useState({
    url: "",
    userName: ""
  });

  // Use new paginated API
  const { data: paginatedData, isLoading, error, refetch } = useUsersByRole({
    role: activeTab as 'rider' | 'supervisor',
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch,
    status: statusFilter,
  });

  // Keep old API for supervisor options in assign modal and tab counts
  const { data: allUsersData } = useRidersAndSupervisors();

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm("");
    setDebouncedSearch("");
    setStatusFilter("All");
  }, [activeTab]);

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

  const handleProfilePictureClick = (profilePicture: string, userName: string) => {
    setSelectedProfilePicture({
      url: profilePicture,
      userName: userName
    });
    setShowProfilePictureModal(true);
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

      // Refetch data to show updated assignments
      refetch();

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

  const supervisorOptions = (allUsersData?.supervisors || []).map((sup: any) => ({
    label: `${sup.name}${sup.profileCode ? ` (${sup.profileCode})` : ""}${sup.authRef?.identifier ? ` - ${sup.authRef.identifier}` : ""}`,
    value: sup._id,
  }));

  const columns: Column[] = [
    {
      key: "name",
      title: "Name",
      render: (value, record) => (
        <div className="flex items-center gap-2 pr-3">
          {record.profilePicture ? (
            <img
              src={record.profilePicture}
              alt={value}
              className="w-10 h-10 rounded-full border border-gray-200 object-cover bg-gray-100 cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
              onClick={() => handleProfilePictureClick(record.profilePicture, value)}
              title="Click to view profile picture"
            />
          ) : (
            <div 
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-indigo-100 text-indigo-600 font-semibold cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
              onClick={() => handleProfilePictureClick("", value)}
              title="No profile picture available"
            >
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
      render: (_value: any, record: any) => {
        return record.authRef?.identifier || "-";
      },
    },
    {
      key: "status",
      title: "Status",
      render: (_value, record) => {
        const status = record.status;
        
        const getStatusStyles = (status: string) => {
          switch (status?.toLowerCase()) {
            case "verified":
              return "bg-green-100 text-green-700";
            case "rejected":
            case "deactived":
              return "bg-red-100 text-red-700";
            case "pending":
              return "bg-yellow-100 text-yellow-700";
            default:
              return "bg-gray-100 text-gray-700";
          }
        };

        const getDotStyles = (status: string) => {
          switch (status?.toLowerCase()) {
            case "verified":
              return "bg-green-500";
            case "rejected":
            case "deactived":
              return "bg-red-500";
            case "pending":
              return "bg-yellow-500";
            default:
              return "bg-gray-500";
          }
        };

        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusStyles(status)}`}
          >
            <span
              className={`mr-1 w-2 h-2 rounded-full ${getDotStyles(status)}`}
            ></span>
            {status || 'Unknown'}
          </span>
        );
      },
    },
    {
      key: "lastLogin",
      title: "Last Login",
      render: (_value, record) => {
        const lastLoginAt = record.authRef?.lastLoginAt;
        if (!lastLoginAt) return "Never";
        const dateObj = new Date(lastLoginAt);
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
        key: "assignedSupervisor",
        title: "Assigned Supervisor",
        render: (value: any) => {
          if (!value) {
            return (
              <span className="text-gray-400 italic">Not assigned</span>
            );
          }
          return (
            <div className="flex flex-col">
              <div className="font-medium text-gray-900">
                {value.name}
              </div>
              <div className="text-sm text-gray-500">
                {value.profileCode} • {value.authRef?.identifier}
              </div>
              <div className="text-xs text-gray-400">
                Assigned: {new Date(value.assignedAt).toLocaleDateString()}
              </div>
            </div>
          );
        },
      },
      {
        key: "aadharNumber",
        title: "Aadhar Number",
        render: (_value: any, record: any) => {
          return record.document?.aadhaar?.ocrFront?.aadhaarNumber || "-";
        },
      },
      {
        key: "drivingLicenseNumber",
        title: "DL Number",
        render: (_value: any, record: any) => {
          return record.document?.drivingLicense?.ocrFront?.drivingLicenseNumber || "-";
        },
      },
      {
        key: "dateOfBirth",
        title: "Date of Birth",
        render: (_value: any, record: any) => {
          return record.dob || "-";
        },
      },
      {
        key: "onboardDate",
        title: "Onboard Date",
        render: (_value: any, record: any) => {
          if (!record.createdAt) return "-";
          const dateObj = new Date(record.createdAt);
          const day = String(dateObj.getDate()).padStart(2, "0");
          const month = String(dateObj.getMonth() + 1).padStart(2, "0");
          const year = dateObj.getFullYear();
          return `${day}-${month}-${year}`;
        },
      },
      {
        key: "address",
        title: "Address",
        render: (_value: any, record: any) => {
          const address = record.addressRef;
          if (!address) return "-";
          const parts = [];
          if (address.address) parts.push(address.address);
          if (address.cityDistrict) parts.push(address.cityDistrict);
          if (address.state) parts.push(address.state);
          if (address.pinCode) parts.push(address.pinCode);
          return parts.length > 0 ? parts.join(", ") : "-";
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
              {allUsersData?.total[
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
            data={paginatedData?.users.map(user => ({ ...user, id: user._id })) || []}
            isLoading={isLoading}
            actionButtonLabel="Assign Supervisor"
            actionButtonLoading={false}
            onActionButtonClick={() => setShowAssignModal(true)}
            showCheckbox={true}
            showSearch={true}
            searchPlaceholder="Search by name, profile code, phone, or DL number"
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            customFilters={[
              {
                label: "Status",
                options: [
                  { label: "All", value: "All" },
                  { label: "Verified", value: "verified" },
                  { label: "Pending", value: "pending" },
                  { label: "Rejected", value: "rejected" },
                  { label: "Deactivated", value: "deactived" }
                ],
                value: statusFilter,
                onChange: (value) => {
                  setStatusFilter(value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }
              }
            ]}
            pagination={{
              page: currentPage,
              limit: pageSize,
              total: paginatedData?.pagination?.totalCount || 0,
              onPageChange: setCurrentPage,
              onLimitChange: setPageSize,
              pageSizeOptions: [5, 10, 20, 50]
            }}
          />
        )}
        {/* Profile Picture Modal */}
        <Modal
          open={showProfilePictureModal}
          onClose={() => setShowProfilePictureModal(false)}
          title={`Profile Picture - ${selectedProfilePicture.userName}`}
        >
          <div className="flex flex-col items-center gap-4">
            {selectedProfilePicture.url ? (
              <div className="relative">
                <img
                  src={selectedProfilePicture.url}
                  alt={selectedProfilePicture.userName}
                  className="max-w-full max-h-96 rounded-lg shadow-lg object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 p-8">
                <div className="w-32 h-32 rounded-full border-2 border-gray-300 flex items-center justify-center bg-indigo-100 text-indigo-600 text-4xl font-semibold">
                  {selectedProfilePicture.userName.charAt(0)}
                </div>
                <p className="text-gray-500 text-center">
                  No profile picture available for this user
                </p>
              </div>
            )}
            <div className="flex justify-center mt-4">
              <Button
                variant="secondary"
                onClick={() => setShowProfilePictureModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>

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
