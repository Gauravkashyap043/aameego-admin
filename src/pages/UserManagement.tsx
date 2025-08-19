import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import CollapsibleTable from "../components/CollapsibleTable";
// import type { Column } from "../components/Table";
import type { CollapsibleColumn } from "../components/CollapsibleTable";
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
  const [hasDocumentsFilter, setHasDocumentsFilter] = useState("all");

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

  // Convert role modal state
  const [showConvertRoleModal, setShowConvertRoleModal] = useState(false);
  const [selectedUserForConversion, setSelectedUserForConversion] = useState<any>(null);
  const [convertRoleLoading, setConvertRoleLoading] = useState(false);
  const [convertRoleError, setConvertRoleError] = useState("");
  const [convertRoleSuccess, setConvertRoleSuccess] = useState("");

  // Use new paginated API
  const { data: paginatedData, isLoading, error, refetch } = useUsersByRole({
    role: activeTab as 'rider' | 'supervisor',
    page: currentPage,
    limit: pageSize,
    search: debouncedSearch,
    status: statusFilter,
    hasDocuments: hasDocumentsFilter,
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
    setHasDocumentsFilter("all");
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

  const handleConvertRole = (user: any) => {
    setSelectedUserForConversion(user);
    setShowConvertRoleModal(true);
    setConvertRoleError("");
    setConvertRoleSuccess("");
  };

  const handleConfirmConvertRole = async () => {
    if (!selectedUserForConversion) return;

    setConvertRoleLoading(true);
    setConvertRoleError("");
    setConvertRoleSuccess("");

    try {
      // Call the API to convert supervisor to rider
      await api.put(`/user/${selectedUserForConversion._id}/convert-role`, {
        newRole: 'rider'
      });

      setConvertRoleSuccess("Role converted successfully!");
      
      // Refetch data to show updated user list
      refetch();

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowConvertRoleModal(false);
        setSelectedUserForConversion(null);
        setConvertRoleSuccess("");
      }, 500);
    } catch (error: any) {
      console.error("Error converting role:", error);
      setConvertRoleError(
        error.response?.data?.message ||
          "Failed to convert role. Please try again."
      );
    } finally {
      setConvertRoleLoading(false);
    }
  };

  const supervisorOptions = (allUsersData?.supervisors || []).map((sup: any) => {
    const riderCount = sup.assignedUser?.length || 0;
    return {
      label: `${sup.name || 'N/A'}${sup.profileCode ? ` (${sup.profileCode})` : ""}${sup.authRef?.identifier ? ` - ${sup.authRef.identifier}` : ""} - ${riderCount} riders`,
      value: sup._id,
    };
  });

  // Get unassigned riders (riders without assignedSupervisor)
  const riderOptions = (allUsersData?.riders || [])
    .filter((rider: any) => !rider.assignedSupervisor) // Only include unassigned riders
    .map((rider: any) => ({
      label: `${rider.name || 'N/A'} (${rider.profileCode})${rider.authRef?.identifier ? ` - ${rider.authRef.identifier}` : ""}`,
      value: rider.profileCode, // Use profile code as value
    }));

  // Define collapsible columns for the user table
  const collapsibleColumns: CollapsibleColumn[] = [
    {
      key: "name",
      title: "Name",
      essential: true,
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
      key: "status",
      title: "Status",
      essential: true,
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
      key: "phone",
      title: "Phone #",
      essential: true,
      render: (_value: any, record: any) => {
        return record.authRef?.identifier || "-";
      },
    },
    {
      key: "lastLogin",
      title: "Last Login",
      essential: false,
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
    // Additional fields for supervisors only
    ...(activeTab === "supervisor" ? [
      {
        key: "riderCount",
        title: "Assigned Riders",
        essential: false,
        render: (_value: any, record: any) => {
          const riderCount = record.assignedUser?.length || 0;
          return (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{riderCount}</span>
              <span className="text-xs text-gray-500">riders</span>
            </div>
          );
        },
      },
      {
        key: "actions",
        title: "Action",
        essential: true,
        render: (_value: any, record: any) => {
          const actionItems = [
            {
              label: "Edit Details",
              onClick: () => handleViewUserDetails(record.id),
            },
          ];

          // Add convert role option only for supervisors
          actionItems.push({
            label: "Convert to Rider",
            onClick: () => handleConvertRole(record),
          });

          actionItems.push({
            label: "Deactivate User",
            onClick: () => handleDeactivate(record.id),
          });

          return <ActionDropdown items={actionItems} />;
        },
      },
    ] : []),
    // Additional fields for riders only
    ...(activeTab === "rider" ? [
      {
        key: "assignedSupervisor",
        title: "Assigned Supervisor",
        essential: true,
        render: (_value: any, record: any) => {
          const assignedSupervisor = record.assignedSupervisor;
          if (!assignedSupervisor) {
            return (
              <span className="text-gray-400 italic">Not assigned</span>
            );
          }
          return (
            <div className="flex flex-col">
              <div className="font-medium text-gray-900">
                {assignedSupervisor.name || 'N/A'}
              </div>
              <div className="text-sm text-gray-500">
                {assignedSupervisor.profileCode} • {assignedSupervisor.authRef?.identifier || 'N/A'}
              </div>
              <div className="text-xs text-gray-400">
                Assigned: {new Date(assignedSupervisor.assignedAt).toLocaleDateString('en-GB')}
              </div>
            </div>
          );
        },
      },
      {
        key: "aadharNumber",
        title: "Aadhar Number",
        essential: false,
        render: (_value: any, record: any) => {
          return record.document?.aadhaar?.ocrFront?.aadhaarNumber || "-";
        },
      },
      {
        key: "drivingLicenseNumber",
        title: "DL Number",
        essential: false,
        render: (_value: any, record: any) => {
          return record.document?.drivingLicense?.ocrFront?.drivingLicenseNumber || "-";
        },
      },
      {
        key: "dateOfBirth",
        title: "Date of Birth",
        essential: false,
        render: (_value: any, record: any) => {
          return record.dob || "-";
        },
      },
      {
        key: "onboardDate",
        title: "Onboard Date",
        essential: false,
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
        essential: false,
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
      {
        key: "actions",
        title: "Action",
        essential: true,
        render: (_value: any, record: any) => {
          const actionItems = [
            {
              label: "Edit Details",
              onClick: () => handleViewUserDetails(record.id),
            },
          ];

          actionItems.push({
            label: "Deactivate User",
            onClick: () => handleDeactivate(record.id),
          });

          return <ActionDropdown items={actionItems} />;
        },
      },
    ] : []),
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
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                >
                  <option value="All">All</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="deactived">Deactivated</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Documents:</label>
                <select
                  value={hasDocumentsFilter}
                  onChange={(e) => {
                    setHasDocumentsFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Users</option>
                  <option value="true">With Documents</option>
                  <option value="false">Without Documents</option>
                </select>
              </div>
            </div>
            
            <CollapsibleTable
            columns={collapsibleColumns}
            data={paginatedData?.users.map(user => ({ ...user, id: user._id })) || []}
            isLoading={isLoading}
            actionButtonLabel="Assign Supervisor"
            onActionButtonClick={() => setShowAssignModal(true)}
            showSearch={true}
            searchPlaceholder={activeTab === "supervisor" ? "Search supervisors by name, profile code, or phone" : "Search riders by name, profile code, or phone"}
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchButtonLabel="Search"
            onSearchSubmit={() => {
              setCurrentPage(1);
              setDebouncedSearch(searchTerm);
            }}
            pagination={{
              page: currentPage,
              limit: pageSize,
              total: paginatedData?.pagination?.totalCount || 0,
              onPageChange: setCurrentPage,
              onLimitChange: setPageSize,
              pageSizeOptions: [5, 10, 20, 50]
            }}
            />
          </div>
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
            <SearchableSelect
              label="Select Rider"
              value={assignForm.riderProfileCode}
              onChange={(value) => setAssignForm(prev => ({ ...prev, riderProfileCode: value }))}
              options={riderOptions}
              placeholder={`Search riders by name or profile code (${riderOptions.length} available)...`}
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

        {/* Convert Role Modal */}
        <Modal
          open={showConvertRoleModal}
          onClose={() => {
            setShowConvertRoleModal(false);
            setSelectedUserForConversion(null);
            setConvertRoleError("");
            setConvertRoleSuccess("");
          }}
          title="Convert Supervisor to Rider"
        >
          <div className="p-6">
            {selectedUserForConversion && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Confirm Role Conversion
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Important: Role Conversion
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Converting a supervisor to a rider will:</p>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          <li>Remove all rider assignments from this supervisor</li>
                          <li>Change their role from supervisor to rider</li>
                          <li>Update their permissions and access levels</li>
                          <li>Move them to the rider list</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">User Details:</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div><span className="font-medium">Name:</span> {selectedUserForConversion.name || 'N/A'}</div>
                    <div><span className="font-medium">Profile Code:</span> {selectedUserForConversion.profileCode}</div>
                    <div><span className="font-medium">Phone:</span> {selectedUserForConversion.authRef?.identifier || 'N/A'}</div>
                    <div><span className="font-medium">Current Role:</span> Supervisor</div>
                    <div><span className="font-medium">Assigned Riders:</span> {selectedUserForConversion.assignedUser?.length || 0}</div>
                  </div>
                </div>
              </div>
            )}

            {convertRoleError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm text-red-600">{convertRoleError}</div>
              </div>
            )}

            {convertRoleSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm text-green-600">{convertRoleSuccess}</div>
              </div>
            )}

            <div className="flex space-x-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowConvertRoleModal(false);
                  setSelectedUserForConversion(null);
                  setConvertRoleError("");
                  setConvertRoleSuccess("");
                }}
                disabled={convertRoleLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmConvertRole}
                disabled={convertRoleLoading}
              >
                {convertRoleLoading ? "Converting..." : "Convert to Rider"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default UserManagement;
