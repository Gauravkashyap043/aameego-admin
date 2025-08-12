import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import InputField from './InputField';

interface VehicleStatusModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  assignment: any;
}

const VehicleStatusModal: React.FC<VehicleStatusModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading,
  assignment
}) => {
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [conditionDescription, setConditionDescription] = useState('');
  const [maintenanceDate, setMaintenanceDate] = useState('');
  const [damageDate, setDamageDate] = useState('');

  const handleSubmit = () => {
    const submitData: any = {
      status,
      notes
    };

    // Add condition description if provided
    if (conditionDescription.trim()) {
      submitData.returnVehicleCondition = {
        description: conditionDescription
      };
    }

    // Add appropriate date based on status
    if (status === 'maintenance' && maintenanceDate) {
      submitData.maintenanceDate = maintenanceDate;
    } else if (status === 'damaged' && damageDate) {
      submitData.damageDate = damageDate;
    }

    onSubmit(submitData);
  };

  const handleClose = () => {
    setStatus('');
    setNotes('');
    setConditionDescription('');
    setMaintenanceDate('');
    setDamageDate('');
    onClose();
  };

  const getStatusOptions = () => {
    const options = [
      { value: 'returned', label: 'Return Vehicle' },
      { value: 'maintenance', label: 'Send to Maintenance' },
      { value: 'damaged', label: 'Mark as Damaged' },
      { value: 'pending', label: 'Set to Pending' }
    ];

    // Filter out 'pending' if assignment is not currently assigned
    if (assignment?.status !== 'assigned') {
      return options.filter(option => option.value !== 'pending');
    }

    return options;
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <div className="p-6 w-[500px] max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Update Vehicle Status</h3>
        </div>

        {/* Vehicle Info */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            <div><strong>Vehicle:</strong> {assignment?.vehicle?.vehicleNumber}</div>
            <div><strong>Model:</strong> {assignment?.vehicle?.vehicleModel?.name}</div>
            <div><strong>Current Status:</strong> 
              <span className={`ml-1 px-2 py-1 rounded text-xs ${
                assignment?.status === 'assigned' ? 'bg-green-100 text-green-800' :
                assignment?.status === 'returned' ? 'bg-blue-100 text-blue-800' :
                assignment?.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                assignment?.status === 'damaged' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {assignment?.status?.charAt(0).toUpperCase() + assignment?.status?.slice(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Selection */}
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Select New Status *
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">-- Select Status --</option>
            {getStatusOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Conditional Fields */}
        {status === 'maintenance' && (
          <div className="mb-4">
            <InputField
              label="Maintenance Date *"
              type="date"
              value={maintenanceDate}
              onChange={(e) => setMaintenanceDate(e.target.value)}
              required
            />
          </div>
        )}

        {status === 'damaged' && (
          <div className="mb-4">
            <InputField
              label="Damage Date *"
              type="date"
              value={damageDate}
              onChange={(e) => setDamageDate(e.target.value)}
              required
            />
          </div>
        )}

        {/* Vehicle Condition */}
        {(status === 'returned' || status === 'maintenance' || status === 'damaged') && (
          <div className="mb-4">
            <InputField
              label="Vehicle Condition Description"
              type="textarea"
              value={conditionDescription}
              onChange={(e) => setConditionDescription(e.target.value)}
              placeholder="Describe the current condition of the vehicle..."
            />
          </div>
        )}

        {/* Notes */}
        <div className="mb-4">
          <InputField
            label="Notes"
            type="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!status || loading}
            className="flex-1"
          >
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default VehicleStatusModal;
