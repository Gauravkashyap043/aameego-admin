import React, { useState } from "react";
import { useFetchVehicleAssignment } from "../../hooks/useFetchVehicleAssignment";
import { useUpdateVehicleStatus } from "../../hooks/useVehicleStatus";
import VehicleStatusModal from "../VehicleStatusModal";
import { handleDownloadFile } from "../../utils/helper";
import { FiDownload, FiEye } from "react-icons/fi";
import Button from "../Button";
import AssignVehicalModal from "../modals/AssignVehicalModal";
import Modal from "../Modal";
import { useAvailableVehicles } from "../../hooks/useVehicles";

export interface VehicalDetailsProps {
  userId: string;
}

const VehicalDetails = ({ userId }: VehicalDetailsProps) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    url: string;
    type: string;
  } | null>(null);
  const updateVehicleStatus = useUpdateVehicleStatus();
  const {
    data: vehicleAssignmentsRaw,
    isLoading: loadingAssignments,
    error: vehicleAssignmentsError,
    refetch: refetchAssignments,
  } = useFetchVehicleAssignment(userId);
  const {
    data: availableVehical,
    refetch: fetchAvailableVehical,
    isFetching: isFetchingAvailableVehicle,
  } = useAvailableVehicles();

  const vehicleAssignments: any[] = Array.isArray(vehicleAssignmentsRaw)
    ? vehicleAssignmentsRaw
    : [];

  const handleVehicleStatusUpdate = (data: any) => {
    if (!selectedAssignment) return;

    updateVehicleStatus.mutate(
      {
        assignmentId: selectedAssignment._id,
        data,
      },
      {
        onSuccess: () => {
          // Refetch vehicle assignments after successful update
          setTimeout(() => {
            refetchAssignments();
          }, 500);
        },
      }
    );

    setShowStatusModal(false);
    setSelectedAssignment(null);
  };

  const handleOpenStatusModal = (assignment: any) => {
    setSelectedAssignment(assignment);
    setShowStatusModal(true);
  };

  const handleOpenAssignModal = async () => {
    const { data } = await fetchAvailableVehical();
    console.log("Fetched available vehicles:", data.data);
    if (data) {
      setShowAssignModal(true);
    }
  };
  console.log("Available vehicles for assignment:", availableVehical);

  //   const handleAssignVehicle = async () => {
  //     if (!selectedVehicle || !authId) return;
  //     setAssignLoading(true);
  //     try {
  //       await api.post("/vehicle-assignment/assign/admin", {
  //         vehicleNumber: selectedVehicle,
  //         riderId: authId, // This should be the user's auth ID
  //         vehicleCondition: { description: "Assigned by admin" },
  //       });
  //       toast.success("Vehicle assigned successfully!");
  //       setShowAssignModal(false);
  //       setSelectedVehicle("");
  //       // Reset filters
  //       setVehicleSearchTerm("");
  //       setVehicleFilterType("");
  //       setVehicleFilterCity("");
  //       // Refetch assignments
  //       setTimeout(() => window.location.reload(), 500);
  //     } catch (err: any) {
  //       toast.error(err?.response?.data?.message || "Failed to assign vehicle");
  //     } finally {
  //       setAssignLoading(false);
  //     }
  //   };

  return (
    <div>
      <div>
        {loadingAssignments ? (
          <div className="text-center text-gray-500 py-12">
            Loading vehicle assignments...
          </div>
        ) : vehicleAssignmentsError ? (
          <div className="text-center text-red-500 py-12">
            Failed to load vehicle assignments.
          </div>
        ) : (
          <div>
            {vehicleAssignments.length > 0 ? (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Current Vehicle Assignment
                </h3>
                {vehicleAssignments.map((assignment: any, idx: number) => {
                  const vehicle = assignment.vehicle;
                  if (!vehicle) return null;
                  const getFileType = (url: string) => {
                    if (!url) return "image";
                    const ext = url.split(".").pop()?.toLowerCase();
                    if (ext === "pdf") return "pdf";
                    return "image";
                  };
                  return (
                    <div
                      key={assignment._id || idx}
                      className="mb-8 p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg border border-green-100"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xl font-bold text-gray-900">
                            Currently Assigned Vehicle
                          </span>
                          <span
                            className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${
                              assignment.status === "assigned"
                                ? "bg-green-100 text-green-800"
                                : assignment.status === "returned"
                                ? "bg-blue-100 text-blue-800"
                                : assignment.status === "maintenance"
                                ? "bg-yellow-100 text-yellow-800"
                                : assignment.status === "damaged"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {assignment.status?.charAt(0).toUpperCase() +
                              assignment.status?.slice(1)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleOpenStatusModal(assignment)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          disabled={updateVehicleStatus.isPending}
                        >
                          Update Status
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="mb-2">
                            <b>Model:</b> {vehicle?.vehicleModel?.name || "N/A"}
                          </div>
                          <div className="mb-2">
                            <b>Type:</b> {vehicle?.vehicleType?.name || "N/A"}
                          </div>
                          <div className="mb-2">
                            <b>Number:</b> {vehicle?.vehicleNumber || "N/A"}
                          </div>
                          <div className="mb-2">
                            <b>Hub:</b> {vehicle?.hub?.name || "N/A"}
                          </div>
                          <div className="mb-2">
                            <b>City:</b> {vehicle?.city?.name || "N/A"}
                          </div>
                          <div className="mb-2">
                            <b>Assigned On:</b>{" "}
                            {assignment.assignmentDate
                              ? new Date(
                                  assignment.assignmentDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                          {assignment.returnDate && (
                            <div className="mb-2">
                              <b>Returned On:</b>{" "}
                              {new Date(
                                assignment.returnDate
                              ).toLocaleDateString()}
                            </div>
                          )}
                          {assignment.maintenanceDate && (
                            <div className="mb-2">
                              <b>Maintenance Date:</b>{" "}
                              {new Date(
                                assignment.maintenanceDate
                              ).toLocaleDateString()}
                            </div>
                          )}
                          {assignment.damageDate && (
                            <div className="mb-2">
                              <b>Damage Date:</b>{" "}
                              {new Date(
                                assignment.damageDate
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="mb-2">
                            <b>RC Registration Date:</b>{" "}
                            {vehicle?.rcRegistrationDate
                              ? new Date(
                                  vehicle.rcRegistrationDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                          <div className="mb-2">
                            <b>RC Expiry Date:</b>{" "}
                            {vehicle?.rcExpiryDate
                              ? new Date(
                                  vehicle.rcExpiryDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                          <div className="mb-2">
                            <b>Fitness Certificate No.:</b>{" "}
                            {vehicle?.fitnessCertificateNumber || "N/A"}
                          </div>
                          <div className="mb-2">
                            <b>Fitness Expiry:</b>{" "}
                            {vehicle?.fitnessCertificateExpDate
                              ? new Date(
                                  vehicle.fitnessCertificateExpDate
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                        </div>
                      </div>
                      {/* Vehicle Documents */}
                      <div className="mt-6">
                        <div className="font-semibold mb-2">
                          Vehicle Documents
                        </div>
                        {vehicle?.insurance?.documents ? (
                          <div className="flex flex-wrap gap-4">
                            {/* RC Document */}
                            {vehicle.insurance.documents.rc && (
                              <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    RC
                                  </span>
                                  <span className="ml-auto text-xs text-gray-400">
                                    {vehicle.insurance.documents.rc.name}
                                  </span>
                                </div>
                                <div className="flex flex-col items-center mt-2">
                                  <span className="text-xs text-gray-500">
                                    {vehicle.insurance.documents.rc.url
                                      ? "Available"
                                      : "Not available"}
                                  </span>
                                  {vehicle.insurance.documents.rc.size && (
                                    <span className="text-xs text-gray-400">
                                      {(
                                        vehicle.insurance.documents.rc.size /
                                        1024
                                      ).toFixed(1)}{" "}
                                      KB
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2 mt-2">
                                  {vehicle.insurance.documents.rc.url && (
                                    <>
                                      <button
                                        className="text-blue-500 hover:text-blue-700"
                                        title="Download RC"
                                        onClick={() =>
                                          handleDownloadFile(
                                            vehicle.insurance.documents.rc.url,
                                            vehicle.insurance.documents.rc
                                              .name || "rc.pdf"
                                          )
                                        }
                                      >
                                        <FiDownload />
                                      </button>
                                      <button
                                        className="text-gray-500 hover:text-gray-700"
                                        title="View RC"
                                        onClick={() =>
                                          setPreviewModal({
                                            open: true,
                                            url: vehicle.insurance.documents.rc
                                              .url,
                                            type: getFileType(
                                              vehicle.insurance.documents.rc.url
                                            ),
                                          })
                                        }
                                      >
                                        <FiEye />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                            {/* Fitness Certificate Document */}
                            {vehicle.insurance.documents.fitnessCertificate && (
                              <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    Fitness Certificate
                                  </span>
                                  <span className="ml-auto text-xs text-gray-400">
                                    {
                                      vehicle.insurance.documents
                                        .fitnessCertificate.name
                                    }
                                  </span>
                                </div>
                                <div className="flex flex-col items-center mt-2">
                                  <span className="text-xs text-gray-500">
                                    {vehicle.insurance.documents
                                      .fitnessCertificate.url
                                      ? "Available"
                                      : "Not available"}
                                  </span>
                                  {vehicle.insurance.documents
                                    .fitnessCertificate.size && (
                                    <span className="text-xs text-gray-400">
                                      {(
                                        vehicle.insurance.documents
                                          .fitnessCertificate.size / 1024
                                      ).toFixed(1)}{" "}
                                      KB
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2 mt-2">
                                  {vehicle.insurance.documents
                                    .fitnessCertificate.url && (
                                    <>
                                      <button
                                        className="text-blue-500 hover:text-blue-700"
                                        title="Download Fitness Certificate"
                                        onClick={() =>
                                          handleDownloadFile(
                                            vehicle.insurance.documents
                                              .fitnessCertificate.url,
                                            vehicle.insurance.documents
                                              .fitnessCertificate.name ||
                                              "fitness_certificate.pdf"
                                          )
                                        }
                                      >
                                        <FiDownload />
                                      </button>
                                      <button
                                        className="text-gray-500 hover:text-gray-700"
                                        title="View Fitness Certificate"
                                        onClick={() =>
                                          setPreviewModal({
                                            open: true,
                                            url: vehicle.insurance.documents
                                              .fitnessCertificate.url,
                                            type: getFileType(
                                              vehicle.insurance.documents
                                                .fitnessCertificate.url
                                            ),
                                          })
                                        }
                                      >
                                        <FiEye />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                            {/* Insurance Document */}
                            {vehicle.insurance.documents.insurance && (
                              <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">
                                    Insurance
                                  </span>
                                  <span className="ml-auto text-xs text-gray-400">
                                    {vehicle.insurance.documents.insurance.name}
                                  </span>
                                </div>
                                <div className="flex flex-col items-center mt-2">
                                  <span className="text-xs text-gray-500">
                                    {vehicle.insurance.documents.insurance.url
                                      ? "Available"
                                      : "Not available"}
                                  </span>
                                  {vehicle.insurance.documents.insurance
                                    .size && (
                                    <span className="text-xs text-gray-400">
                                      {(
                                        vehicle.insurance.documents.insurance
                                          .size / 1024
                                      ).toFixed(1)}{" "}
                                      KB
                                    </span>
                                  )}
                                </div>
                                <div className="flex gap-2 mt-2">
                                  {vehicle.insurance.documents.insurance
                                    .url && (
                                    <>
                                      <button
                                        className="text-blue-500 hover:text-blue-700"
                                        title="Download Insurance"
                                        onClick={() =>
                                          handleDownloadFile(
                                            vehicle.insurance.documents
                                              .insurance.url,
                                            vehicle.insurance.documents
                                              .insurance.name || "insurance.pdf"
                                          )
                                        }
                                      >
                                        <FiDownload />
                                      </button>
                                      <button
                                        className="text-blue-500 hover:text-blue-700"
                                        title="View Insurance"
                                        onClick={() =>
                                          setPreviewModal({
                                            open: true,
                                            url: vehicle.insurance.documents
                                              .insurance.url,
                                            type: getFileType(
                                              vehicle.insurance.documents
                                                .insurance.url
                                            ),
                                          })
                                        }
                                      >
                                        <FiEye />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            No documents available
                          </div>
                        )}
                      </div>

                      {/* Notes Section */}
                      {assignment.notes && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="font-semibold text-sm text-gray-700 mb-1">
                            Notes:
                          </div>
                          <div className="text-sm text-gray-600">
                            {assignment.notes}
                          </div>
                        </div>
                      )}

                      {/* Vehicle Condition */}
                      {assignment.returnVehicleCondition?.description && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <div className="font-semibold text-sm text-gray-700 mb-1">
                            Vehicle Condition:
                          </div>
                          <div className="text-sm text-gray-600">
                            {assignment.returnVehicleCondition.description}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-gray-500 mb-4">
                  <div className="text-lg font-medium mb-2">
                    No vehicle currently assigned
                  </div>
                  <div className="text-sm">
                    This user is not currently assigned to any vehicle.
                  </div>
                </div>
                <Button
                  variant="primary"
                  onClick={handleOpenAssignModal}
                  disabled={isFetchingAvailableVehicle}
                >
                  {isFetchingAvailableVehicle
                    ? "Loading..."
                    : "Assign New Vehicle"}
                </Button>
              </div>
            )}

            {/* Assign New Vehicle Section */}
            {/* {vehicleAssignments.filter(
              (assignment: any) => assignment.status === "assigned"
            ).length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-gray-500 mb-4">
                  <div className="text-lg font-medium mb-2">
                    No vehicle currently assigned
                  </div>
                  <div className="text-sm">
                    This user is not currently assigned to any vehicle.
                  </div>
                </div>
                <Button
                  variant="primary"
                  onClick={handleOpenAssignModal}
                  disabled={isFetchingAvailableVehicle}
                >
                  {isFetchingAvailableVehicle
                    ? "Loading..."
                    : "Assign New Vehicle"}
                </Button>
              </div>
            )} */}

            {/* Vehicle History */}
            {/* {vehicleAssignments.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Vehicle Assignment History
                </h3>
                <div className="space-y-4">
                  {vehicleAssignments
                    .filter(
                      (assignment: any) => assignment.status !== "assigned"
                    )
                    .sort(
                      (a: any, b: any) =>
                        new Date(b.updatedAt || b.createdAt).getTime() -
                        new Date(a.updatedAt || a.createdAt).getTime()
                    )
                    .map((assignment: any, idx: number) => {
                      const vehicle = assignment.vehicle;
                      if (!vehicle) return null;

                      return (
                        <div
                          key={assignment._id || idx}
                          className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-900">
                                {vehicle.vehicleNumber}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  assignment.status === "returned"
                                    ? "bg-blue-100 text-blue-800"
                                    : assignment.status === "maintenance"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : assignment.status === "damaged"
                                    ? "bg-red-100 text-red-800"
                                    : assignment.status === "pending"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {assignment.status?.charAt(0).toUpperCase() +
                                  assignment.status?.slice(1)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">
                              {assignment.updatedAt
                                ? new Date(
                                    assignment.updatedAt
                                  ).toLocaleDateString()
                                : assignment.createdAt
                                ? new Date(
                                    assignment.createdAt
                                  ).toLocaleDateString()
                                : "N/A"}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <b>Model:</b>{" "}
                              {vehicle.vehicleModel?.name || "N/A"}
                            </div>
                            <div>
                              <b>Type:</b> {vehicle.vehicleType?.name || "N/A"}
                            </div>
                            <div>
                              <b>Assigned:</b>{" "}
                              {assignment.assignmentDate
                                ? new Date(
                                    assignment.assignmentDate
                                  ).toLocaleDateString()
                                : "N/A"}
                            </div>
                            <div>
                              <b>Hub:</b> {vehicle.hub?.name || "N/A"}
                            </div>
                          </div>
                          {assignment.notes && (
                            <div className="mt-2 text-sm text-gray-600">
                              <b>Notes:</b> {assignment.notes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )} */}
          </div>
        )}
      </div>

      <AssignVehicalModal
        showAssignModal={showAssignModal}
        handleCloseAssignModal={() => setShowAssignModal(false)}
        availableVehicles={availableVehical || []}
        loadingAvailableVehicles={loadingAssignments}
        vehicleSearchTerm=""
        setVehicleSearchTerm={() => {}}
        assignLoading={updateVehicleStatus.isPending}
        handleAssignVehicle={() => {}}
        selectedVehicle=""
        setSelectedVehicle={() => {}}
        getUniqueVehicleTypes={() => []}
        getUniqueCities={() => []}
        getFilteredVehicles={() => vehicleAssignments}
        vehicleFilterType={""}
        setVehicleFilterType={function (type: string): void {
          throw new Error("Function not implemented.");
        }}
        vehicleFilterCity={""}
        setVehicleFilterCity={function (city: string): void {
          throw new Error("Function not implemented.");
        }}
      />

      <VehicleStatusModal
        open={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedAssignment(null);
        }}
        onSubmit={handleVehicleStatusUpdate}
        loading={updateVehicleStatus.isPending}
        assignment={selectedAssignment}
      />

      <Modal open={!!previewModal?.open} onClose={() => setPreviewModal(null)}>
        {previewModal?.type === "pdf" ? (
          <iframe
            src={previewModal.url}
            title="PDF Preview"
            className="w-[80vw] h-[80vh]"
          />
        ) : (
          <img
            src={previewModal?.url}
            alt="Document Preview"
            className="max-w-[80vw] max-h-[80vh] rounded-lg"
          />
        )}
      </Modal>
    </div>
  );
};

export default VehicalDetails;
