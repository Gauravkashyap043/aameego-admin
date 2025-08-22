import Button from "../Button";
import { FiSearch, FiX } from "react-icons/fi";
import Modal from "../Modal";
import type { Vehicle } from "../../types";

export interface AssignVehicalModalProps {
  showAssignModal: boolean;
  handleCloseAssignModal: () => void;
  availableVehicles: Vehicle[];
  loadingAvailableVehicles: boolean;
  vehicleSearchTerm: string;
  setVehicleSearchTerm: (term: string) => void;
  vehicleFilterType: string;
  setVehicleFilterType: (type: string) => void;
  vehicleFilterCity: string;
  setVehicleFilterCity: (city: string) => void;
  selectedVehicle: string | null;
  setSelectedVehicle: (vehicleNumber: string) => void;
  handleAssignVehicle: () => void;
  assignLoading: boolean;
  getUniqueVehicleTypes: () => string[];
  getUniqueCities: () => string[];
  getFilteredVehicles: () => unknown[];
}

const AssignVehicalModal = (props: AssignVehicalModalProps) => {
  return (
    <Modal open={props.showAssignModal} onClose={props.handleCloseAssignModal}>
      <div className="p-6 w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Assign Vehicle</h3>
          <button
            onClick={props.handleCloseAssignModal}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="mb-4 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vehicle number, model, type, hub, or city..."
              value={props.vehicleSearchTerm}
              onChange={(e) => props.setVehicleSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-3">
            <select
              value={props.vehicleFilterType}
              onChange={(e) => props.setVehicleFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Vehicle Types</option>
              {props.getUniqueVehicleTypes().map((type: string) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={props.vehicleFilterCity}
              onChange={(e) => props.setVehicleFilterCity(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Cities</option>
              {props.getUniqueCities().map((city: string) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vehicle List */}
        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
          {props.loadingAvailableVehicles ? (
            <div className="p-4 text-center text-gray-500">
              Loading vehicles...
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {props.availableVehicles.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {props.vehicleSearchTerm ||
                  props.vehicleFilterType ||
                  props.vehicleFilterCity
                    ? "No vehicles match your search criteria"
                    : "No vehicles available"}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {props.availableVehicles.map((vehicle) => (
                    <div
                      key={vehicle._id || vehicle.vehicleNumber}
                      className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                        props.selectedVehicle === vehicle.vehicleNumber
                          ? "bg-blue-100 border-l-4 border-blue-500"
                          : ""
                      }`}
                      onClick={() =>
                        props.setSelectedVehicle(vehicle.vehicleNumber)
                      }
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">
                            {vehicle.vehicleNumber}
                          </div>
                          <div className="text-sm text-gray-600">
                            {vehicle.vehicleModel?.name} •{" "}
                            {vehicle.vehicleType?.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {vehicle.hub?.name} • {vehicle.city?.name}
                          </div>
                        </div>
                        {props.selectedVehicle === vehicle.vehicleNumber && (
                          <div className="text-blue-500">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mt-2 text-xs text-gray-500">
          Showing {props.getFilteredVehicles().length} of{" "}
          {props.availableVehicles.length} vehicles
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-4 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={props.handleCloseAssignModal}
            disabled={props.assignLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={props.handleAssignVehicle}
            disabled={!props.selectedVehicle || props.assignLoading}
            className="flex-1"
          >
            {props.assignLoading ? "Assigning..." : "Assign Vehicle"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AssignVehicalModal;
