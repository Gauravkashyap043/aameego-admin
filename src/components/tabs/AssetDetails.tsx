import React, { useState } from 'react';
import { useUserAssetAssignments, useReturnAsset } from '../../hooks/useAssetAssignment';
import AssetAssignmentModal from '../modals/AssetAssignmentModal';
import Button from '../Button';
import { toast } from 'react-toastify';
import { FiPackage, FiUser, FiTruck, FiCalendar, FiFileText, FiPlus, FiArrowRight, FiCheck, FiX, FiClock } from 'react-icons/fi';

interface AssetDetailsProps {
  userId: string;
}

const AssetDetails: React.FC<AssetDetailsProps> = ({ userId }) => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);

  // Fetch asset assignments for this user (include all assignments)
  const { data: assetAssignments, isLoading, refetch } = useUserAssetAssignments(userId, true);
  const returnAssetMutation = useReturnAsset();

  // Separate active and inactive assignments
  const activeAssignments = assetAssignments?.filter((assignment: any) => assignment.isActive) || [];
  const inactiveAssignments = assetAssignments?.filter((assignment: any) => !assignment.isActive) || [];

  const handleAssignSuccess = () => {
    refetch();
    setShowAssignModal(false);
  };

  const handleReturnAsset = async (assignmentId: string, returnData: any) => {
    try {
      await returnAssetMutation.mutateAsync({
        assignmentId,
        returnData: {
          actualReturnDate: new Date(),
          condition: {
            description: returnData.condition || 'Asset returned in good condition',
            images: [],
            videos: [],
          },
          notes: returnData.notes || '',
        },
      });
      
      toast.success('Asset returned successfully!');
      refetch();
      setShowReturnModal(false);
      setSelectedAssignment(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to return asset');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', dot: 'bg-yellow-500' },
      approved: { color: 'bg-blue-100 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
      rejected: { color: 'bg-red-100 text-red-800 border-red-200', dot: 'bg-red-500' },
      active: { color: 'bg-green-100 text-green-800 border-green-200', dot: 'bg-green-500' },
      returned: { color: 'bg-gray-100 text-gray-800 border-gray-200', dot: 'bg-gray-500' },
      overdue: { color: 'bg-orange-100 text-orange-800 border-orange-200', dot: 'bg-orange-500' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <span className={`mr-1.5 w-2 h-2 rounded-full ${config.dot}`}></span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getAssignmentTypeBadge = (type: string) => {
    const typeConfig = {
      user_only: { color: 'bg-purple-100 text-purple-800', label: 'User Only' },
      vehicle_specific: { color: 'bg-indigo-100 text-indigo-800', label: 'Vehicle Specific' },
      temporary: { color: 'bg-pink-100 text-pink-800', label: 'Temporary' },
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.user_only;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const isOverdue = (expectedReturnDate: string) => {
    return new Date(expectedReturnDate) < new Date();
  };

  const renderAssignmentCard = (assignment: any, isActive: boolean = true) => (
    <div
      key={assignment._id}
      className={`bg-white rounded-lg border p-6 hover:shadow-md transition-shadow ${
        isOverdue(assignment.expectedReturnDate) && assignment.assignmentStatus === 'active'
          ? 'border-orange-300 bg-orange-50'
          : 'border-gray-200'
      }`}
    >
      <div className="flex items-start justify-between">
        {/* Asset Information */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FiPackage className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                {assignment.asset?.assetName || 'Unknown Asset'}
              </h4>
              <p className="text-sm text-gray-500">
                Serial: {assignment.asset?.serialNumber || 'N/A'} • Type: {assignment.asset?.assetType?.name || 'Unknown'}
              </p>
            </div>
          </div>

          {/* Assignment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <FiUser className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                <span className="font-medium">Assigned To:</span> {assignment.assignedTo?.name || 'N/A'}
              </span>
            </div>

            {assignment.vehicle && (
              <div className="flex items-center gap-2">
                <FiTruck className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  <span className="font-medium">Vehicle:</span> {assignment.vehicle?.vehicleNumber || 'N/A'}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                <span className="font-medium">Expected Return:</span> {new Date(assignment.expectedReturnDate).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <FiFileText className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                <span className="font-medium">Reason:</span> {assignment.assignmentReason}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                <span className="font-medium">Purpose:</span> {assignment.assignmentPurpose}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                <span className="font-medium">Assigned By:</span> {assignment.assignedBy?.name || 'N/A'}
              </span>
            </div>
          </div>

          {/* Status and Type Badges */}
          <div className="flex items-center gap-3 mb-4">
            {getStatusBadge(assignment.assignmentStatus)}
            {getAssignmentTypeBadge(assignment.assignmentType)}
            {isOverdue(assignment.expectedReturnDate) && assignment.assignmentStatus === 'active' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                <span className="mr-1.5 w-2 h-2 rounded-full bg-red-500"></span>
                Overdue
              </span>
            )}
          </div>

          {/* Assignment Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
            <div>
              <span className="font-medium">Assigned:</span> {new Date(assignment.assignmentDate).toLocaleDateString()}
            </div>
            {assignment.actualReturnDate && (
              <div>
                <span className="font-medium">Returned:</span> {new Date(assignment.actualReturnDate).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Asset Condition */}
          {assignment.assetConditionAtAssignment && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Asset Condition at Assignment:</h5>
              <p className="text-sm text-gray-600">{assignment.assetConditionAtAssignment.description}</p>
            </div>
          )}

          {/* Return Condition */}
          {assignment.assetConditionAtReturn && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h5 className="text-sm font-medium text-blue-700 mb-2">Asset Condition at Return:</h5>
              <p className="text-sm text-blue-600">{assignment.assetConditionAtReturn.description}</p>
            </div>
          )}

          {/* Notes */}
          {assignment.notes && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <h5 className="text-sm font-medium text-yellow-700 mb-2">Notes:</h5>
              <p className="text-sm text-yellow-600">{assignment.notes}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 ml-4">
          {isActive && assignment.assignmentStatus === 'active' && (
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedAssignment(assignment);
                setShowReturnModal(true);
              }}
              className="flex items-center gap-2 text-sm px-3 py-2"
            >
              <FiArrowRight className="w-4 h-4" />
              Return Asset
            </Button>
          )}
          
          {isActive && assignment.assignmentStatus === 'pending' && (
            <div className="flex gap-2">
              <Button
                variant="success"
                className="flex items-center gap-2 text-sm px-3 py-2"
              >
                <FiCheck className="w-4 h-4" />
                Approve
              </Button>
              <Button
                variant="danger"
                className="flex items-center gap-2 text-sm px-3 py-2"
              >
                <FiX className="w-4 h-4" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-indigo-600 text-lg font-semibold">Loading asset assignments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Asset Assignments</h3>
          <p className="text-gray-600">Manage assets assigned to this user</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Assign Asset
        </Button>
      </div>

      {/* Asset Assignments List */}
      {activeAssignments.length === 0 && inactiveAssignments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <FiPackage className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Asset Assignments</h4>
          <p className="text-gray-500 mb-4">This user doesn't have any assets assigned yet.</p>
          <Button
            variant="primary"
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 mx-auto"
          >
            <FiPlus className="w-4 h-4" />
            Assign First Asset
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Assignments Section */}
          {activeAssignments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h4 className="text-lg font-semibold text-gray-900">Active Asset Assignments</h4>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  {activeAssignments.length}
                </span>
              </div>
              <div className="space-y-4">
                {activeAssignments.map((assignment: any) => renderAssignmentCard(assignment, true))}
              </div>
            </div>
          )}

          {/* Inactive Assignments Section (History) */}
          {inactiveAssignments.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FiClock className="w-4 h-4 text-gray-500" />
                <h4 className="text-lg font-semibold text-gray-900">Assignment History</h4>
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                  {inactiveAssignments.length}
                </span>
              </div>
              <div className="space-y-4">
                {inactiveAssignments.map((assignment: any) => renderAssignmentCard(assignment, false))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Asset Assignment Modal */}
      <AssetAssignmentModal
        open={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSuccess={handleAssignSuccess}
        userId={userId}
      />

      {/* Return Asset Modal */}
      {showReturnModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Return Asset</h3>
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setSelectedAssignment(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Are you sure you want to return "{selectedAssignment.asset?.assetName}"?
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Condition
                </label>
                <textarea
                  placeholder="Describe the condition of the asset upon return..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  id="returnCondition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  placeholder="Any additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={2}
                  id="returnNotes"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowReturnModal(false);
                  setSelectedAssignment(null);
                }}
                disabled={returnAssetMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const condition = (document.getElementById('returnCondition') as HTMLTextAreaElement)?.value;
                  const notes = (document.getElementById('returnNotes') as HTMLTextAreaElement)?.value;
                  handleReturnAsset(selectedAssignment._id, { condition, notes });
                }}
                disabled={returnAssetMutation.isPending}
              >
                {returnAssetMutation.isPending ? 'Returning...' : 'Return Asset'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetails;


