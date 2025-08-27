import React, { useState } from 'react';
import { useUpdateVehicleStatus } from '../hooks/useVehicleAssignment';

interface VehicleStatusUpdateProps {
  vehicleId: string;
  currentStatus: string;
  onStatusUpdated?: () => void;
}

const VehicleStatusUpdate: React.FC<VehicleStatusUpdateProps> = ({ 
  vehicleId, 
  currentStatus, 
  onStatusUpdated 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'available' | 'maintenance' | 'damaged'>('available');
  const [notes, setNotes] = useState('');
  const [condition, setCondition] = useState('');

  const updateStatusMutation = useUpdateVehicleStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateStatusMutation.mutateAsync({
        vehicleId,
        status,
        notes: notes || undefined,
        returnVehicleCondition: condition ? {
          description: condition,
          images: [],
          videos: []
        } : undefined
      });
      
      setIsOpen(false);
      setNotes('');
      setCondition('');
      onStatusUpdated?.();
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'damaged':
        return 'bg-red-100 text-red-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-lg font-semibold text-gray-800">Current Vehicle Status</h4>
          <div className="flex items-center space-x-3 mt-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentStatus)}`}>
              {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#3B36FF] text-white px-4 py-2 rounded-lg hover:bg-[#2A25FF] transition-colors"
        >
          Update Status
        </button>
      </div>

      {isOpen && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h5 className="text-lg font-semibold text-gray-800 mb-4">Update Vehicle Status</h5>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'available' | 'maintenance' | 'damaged')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B36FF] focus:border-transparent"
                required
              >
                <option value="available">Available</option>
                <option value="maintenance">Maintenance</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter notes about the status change..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B36FF] focus:border-transparent"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition Description
              </label>
              <textarea
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                placeholder="Describe the vehicle condition..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B36FF] focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setNotes('');
                  setCondition('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateStatusMutation.isPending}
                className="px-4 py-2 bg-[#3B36FF] text-white rounded-lg hover:bg-[#2A25FF] transition-colors disabled:opacity-50"
              >
                {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default VehicleStatusUpdate;