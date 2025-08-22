import React from 'react';
// import Modal from './Modal';
import Button from '../Button';
import Modal from '../Modal';

interface UnassignVehicleModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  assignment: any;
  notes: string;
  setNotes: (notes: string) => void;
}

const UnassignVehicleModal: React.FC<UnassignVehicleModalProps> = ({
  open,
  onClose,
  onSubmit,
  loading,
  assignment,
  notes,
  setNotes,
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-6 w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Unassign Vehicle</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {assignment && (
          <div className="mb-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Confirm Vehicle Unassignment
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>This action will:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Remove the vehicle assignment from this rider</li>
                      <li>Set the vehicle status back to available</li>
                      <li>Close the current assignment record</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Vehicle Details:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div><span className="font-medium">Vehicle Number:</span> {assignment.vehicle?.vehicleNumber}</div>
                <div><span className="font-medium">Model:</span> {assignment.vehicle?.vehicleModel?.name}</div>
                <div><span className="font-medium">Type:</span> {assignment.vehicle?.vehicleType?.name}</div>
                <div><span className="font-medium">Assigned On:</span> {assignment.assignmentDate ? new Date(assignment.assignmentDate).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about the unassignment..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <div className="flex space-x-3 justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onSubmit}
            disabled={loading}
          >
            {loading ? "Unassigning..." : "Unassign Vehicle"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UnassignVehicleModal;
