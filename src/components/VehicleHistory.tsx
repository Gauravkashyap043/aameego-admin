import React from 'react';
// import { format } from 'date-fns';

interface VehicleAssignment {
  _id: string;
  vehicle: any;
  rider?: any;
  assignedBy: any;
  assignmentDate: string;
  returnDate?: string;
  vehicleCondition?: {
    description: string;
    images?: string[];
    videos?: string[];
  };
  returnVehicleCondition?: {
    description?: string;
    images?: string[];
    videos?: string[];
  };
  isActive: boolean;
  vehicleAssignmentStatus: 'assigned' | 'returned' | 'maintenance' | 'damaged' | 'unassigned' | 'resolved';
  maintenanceDate?: string;
  damageDate?: string;
  resolvedAt?: string;
  notes?: string;
  isSystemAssignment?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface VehicleHistoryProps {
  assignments: VehicleAssignment[];
  isLoading: boolean;
  vehicleNumber?: string;
}

const VehicleHistory: React.FC<VehicleHistoryProps> = ({ assignments, isLoading, vehicleNumber }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B36FF]"></div>
        <span className="ml-2 text-gray-600">Loading assignment history...</span>
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 text-lg mb-2">No assignment history found</div>
        <div className="text-gray-400 text-sm">
          {vehicleNumber ? `No assignments recorded for vehicle ${vehicleNumber}` : 'No assignments recorded for this vehicle'}
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string, isSystemAssignment?: boolean) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    
    if (isSystemAssignment) {
      return (
        <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
          System: {status}
        </span>
      );
    }

    switch (status) {
      case 'assigned':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Assigned</span>;
      case 'returned':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Returned</span>;
      case 'maintenance':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Maintenance</span>;
      case 'damaged':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Damaged</span>;
      case 'unassigned':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unassigned</span>;
      case 'resolved':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Resolved</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        const options: Intl.DateTimeFormatOptions = {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
        return date.toLocaleDateString('en-US', options);
    } catch {
      return 'Invalid date';
    }
  };

  const getRiderInfo = (assignment: VehicleAssignment) => {
    if (assignment.isSystemAssignment) {
      return {
        name: 'System Assignment',
        profileCode: 'N/A',
        type: 'system'
      };
    }
    
    if (assignment.rider) {
      return {
        name: assignment.rider.name || 'N/A',
        profileCode: assignment.rider.profileCode || 'N/A',
        type: 'rider'
      };
    }
    
    return {
      name: 'N/A',
      profileCode: 'N/A',
      type: 'unknown'
    };
  };

  return (
    <div className="space-y-6">
      {/* Current Assignment Section */}
      {assignments.some(a => a.isActive) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-3">Current Assignment</h3>
          {assignments
            .filter(a => a.isActive)
            .map(assignment => (
              <div key={assignment._id} className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-800">Active Assignment</span>
                  </div>
                  {getStatusBadge(assignment.vehicleAssignmentStatus, assignment.isSystemAssignment)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Assigned To</div>
                    <div className="font-medium">
                      {getRiderInfo(assignment).name} ({getRiderInfo(assignment).profileCode})
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Assigned By</div>
                    <div className="font-medium">
                      {assignment.assignedBy?.name || 'N/A'} ({assignment.assignedBy?.profileCode || 'N/A'})
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Assignment Date</div>
                    <div className="font-medium">{formatDate(assignment.assignmentDate)}</div>
                  </div>
                  
                  {assignment.notes && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Notes</div>
                      <div className="font-medium">{assignment.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Assignment History Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Assignment History</h3>
        <div className="space-y-4">
          {assignments
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((assignment, index) => (
              <div key={assignment._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="font-medium text-gray-800">
                      Assignment #{assignments.length - index}
                    </span>
                  </div>
                  {getStatusBadge(assignment.vehicleAssignmentStatus, assignment.isSystemAssignment)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Assigned To</div>
                    <div className="font-medium">
                      {getRiderInfo(assignment).name} ({getRiderInfo(assignment).profileCode})
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Assigned By</div>
                    <div className="font-medium">
                      {assignment.assignedBy?.name || 'N/A'} ({assignment.assignedBy?.profileCode || 'N/A'})
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Assignment Date</div>
                    <div className="font-medium">{formatDate(assignment.assignmentDate)}</div>
                  </div>
                  
                  {assignment.returnDate && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Return Date</div>
                      <div className="font-medium">{formatDate(assignment.returnDate)}</div>
                    </div>
                  )}
                  
                  {assignment.maintenanceDate && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Maintenance Date</div>
                      <div className="font-medium">{formatDate(assignment.maintenanceDate)}</div>
                    </div>
                  )}
                  
                  {assignment.damageDate && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Damage Date</div>
                      <div className="font-medium">{formatDate(assignment.damageDate)}</div>
                    </div>
                  )}
                  
                  {assignment.resolvedAt && (
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Resolved Date</div>
                      <div className="font-medium">{formatDate(assignment.resolvedAt)}</div>
                    </div>
                  )}
                  
                  {assignment.notes && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <div className="text-sm text-gray-600 mb-1">Notes</div>
                      <div className="font-medium">{assignment.notes}</div>
                    </div>
                  )}
                  
                  {assignment.vehicleCondition && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <div className="text-sm text-gray-600 mb-1">Assignment Condition</div>
                      <div className="font-medium">{assignment.vehicleCondition.description}</div>
                    </div>
                  )}
                  
                  {assignment.returnVehicleCondition && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <div className="text-sm text-gray-600 mb-1">Return Condition</div>
                      <div className="font-medium">{assignment.returnVehicleCondition.description}</div>
                    </div>
                  )}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Created: {formatDate(assignment.createdAt)} | 
                    Updated: {formatDate(assignment.updatedAt)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default VehicleHistory;