import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { useAssignAsset } from '../../hooks/useAssetAssignment';
// import { useUsersByRole } from '../../hooks/useUsers';
import { useVehicleList } from '../../hooks/useVehicles';
import { useAssetList } from '../../hooks/useAssets';
import { toast } from 'react-toastify';
import { FiPackage, FiTruck, FiCalendar, FiFileText, FiInfo, FiX, FiCheck } from 'react-icons/fi';
import SearchableSelect from '../SearchableSelect';

interface AssetAssignmentModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    userId?: string; // Add userId prop
}

const AssetAssignmentModal: React.FC<AssetAssignmentModalProps> = ({
    open,
    onClose,
    onSuccess,
    userId,
}) => {
    const [formData, setFormData] = useState({
        assetId: '',
        userId: userId || '',
        vehicleId: '',
        vehicleAssignmentId: '',
        assignmentType: 'user_only' as 'user_only' | 'vehicle_specific' | 'temporary',
        assignmentReason: '',
        assignmentPurpose: '',
        expectedReturnDate: '',
        condition: {
            description: '',
            images: [] as string[],
            videos: [] as string[],
        },
        notes: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Hooks
    const assignAssetMutation = useAssignAsset();
    const { data: vehiclesData } = useVehicleList(1, 100);
    const { data: assetsData } = useAssetList(1, 100, { status: 'available' });

    // Get available assets
    const availableAssets = assetsData?.items || [];

    // Get vehicles
    const vehicles = vehiclesData?.items || [];

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate form
        const newErrors: Record<string, string> = {};

        if (!formData.assetId) newErrors.assetId = 'Asset is required';
        if (!formData.userId) newErrors.userId = 'User ID is required';
        if (!formData.assignmentReason) newErrors.assignmentReason = 'Assignment reason is required';
        if (!formData.assignmentPurpose) newErrors.assignmentPurpose = 'Assignment purpose is required';
        if (!formData.expectedReturnDate) newErrors.expectedReturnDate = 'Expected return date is required';
        if (!formData.condition.description) newErrors.conditionDescription = 'Asset condition description is required';

        if (formData.assignmentType === 'vehicle_specific' && !formData.vehicleId) {
            newErrors.vehicleId = 'Vehicle is required for vehicle-specific assignments';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            await assignAssetMutation.mutateAsync({
                assetId: formData.assetId,
                userId: formData.userId,
                vehicleId: formData.vehicleId || undefined,
                vehicleAssignmentId: formData.vehicleAssignmentId || undefined,
                assignmentType: formData.assignmentType,
                assignmentReason: formData.assignmentReason,
                assignmentPurpose: formData.assignmentPurpose,
                expectedReturnDate: new Date(formData.expectedReturnDate),
                condition: formData.condition,
                notes: formData.notes,
            });

            toast.success('Asset assigned successfully!');
            onSuccess?.();
            handleClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to assign asset');
        }
    };

    // Handle modal close
    const handleClose = () => {
        setFormData({
            assetId: '',
            userId: userId || '',
            vehicleId: '',
            vehicleAssignmentId: '',
            assignmentType: 'user_only',
            assignmentReason: '',
            assignmentPurpose: '',
            expectedReturnDate: '',
            condition: {
                description: '',
                images: [],
                videos: [],
            },
            notes: '',
        });
        setErrors({});
        onClose();
    };

    // Update assignment purpose when vehicle changes
    useEffect(() => {
        if (formData.vehicleId && formData.assignmentType === 'vehicle_specific') {
            const selectedVehicle = vehicles.find(v => v._id === formData.vehicleId);
            if (selectedVehicle) {
                setFormData(prev => ({
                    ...prev,
                    assignmentPurpose: `Asset for vehicle ${selectedVehicle.vehicleNumber}`,
                }));
            }
        }
    }, [formData.vehicleId, formData.assignmentType, vehicles]);

    // Update userId when prop changes
    useEffect(() => {
        if (userId) {
            setFormData(prev => ({
                ...prev,
                userId: userId,
            }));
        }
    }, [userId]);

    return (
        <Modal open={open} onClose={handleClose} title="Assign Asset to User">
            <div className="max-w-4xl mx-auto h-[80vh] flex flex-col">
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-8 pr-2">
                    {/* Header Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <FiPackage className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Asset Assignment</h3>
                                <p className="text-sm text-gray-600">Assign assets to users with detailed tracking</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-blue-100 rounded-lg">
                            <FiInfo className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Assignment Guidelines:</p>
                                <ul className="space-y-1 text-xs">
                                    <li>• Select the appropriate assignment type based on usage</li>
                                    <li>• Provide detailed condition description for tracking</li>
                                    <li>• Set realistic return dates for better management</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Asset Selection */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FiPackage className="w-4 h-4 text-purple-600" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900">Asset Details</h4>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Asset *
                            </label>
                            <SearchableSelect
                                label='Select Asset *'
                                value={formData.assetId}
                                onChange={(value) => setFormData(prev => ({ ...prev, assetId: value }))}
                                options={availableAssets.map(asset => ({
                                    label: `${asset.assetName} (${asset.serialNumber || 'No SN'}) - ${asset.assetType?.name || 'Unknown Type'}`,
                                    value: asset._id,
                                }))}
                                placeholder="Search and select an asset..."
                                error={errors.assetId}
                            />
                            {availableAssets.length === 0 && (
                                <p className="text-sm text-gray-500 mt-2">No available assets found</p>
                            )}
                        </div>
                    </div>

                    {/* Assignment Type and Vehicle Selection */}
                    <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                <FiTruck className="w-4 h-4 text-orange-600" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900">Assignment Configuration</h4>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Assignment Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assignment Type *
                                </label>
                                <select
                                    value={formData.assignmentType}
                                    onChange={(e) => setFormData(prev => ({
                                        ...prev,
                                        assignmentType: e.target.value as 'user_only' | 'vehicle_specific' | 'temporary',
                                        vehicleId: e.target.value === 'user_only' ? '' : prev.vehicleId,
                                    }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                                >
                                    <option value="user_only">User Only (Not vehicle specific)</option>
                                    <option value="vehicle_specific">Vehicle Specific</option>
                                    <option value="temporary">Temporary</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Choose how this asset will be used
                                </p>
                            </div>

                            {/* Vehicle Selection (conditional) */}
                            {(formData.assignmentType === 'vehicle_specific' || formData.assignmentType === 'temporary') && (
                                <div>
                                    <SearchableSelect
                                        label='Select Vehicle *'
                                        value={formData.vehicleId}
                                        onChange={(value) => setFormData(prev => ({ ...prev, vehicleId: value }))}
                                        options={vehicles.map(vehicle => ({
                                            label: `${vehicle.vehicleNumber} - ${vehicle.vehicleModel?.name || 'Unknown Model'} (${vehicle.city?.name || 'Unknown City'})`,
                                            value: vehicle._id,
                                        }))}
                                        placeholder="Search and select a vehicle..."
                                        error={errors.vehicleId}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assignment Details */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <FiFileText className="w-4 h-4 text-indigo-600" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900">Assignment Details</h4>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Assignment Reason */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assignment Reason *
                                </label>
                                <textarea
                                    value={formData.assignmentReason}
                                    onChange={(e) => setFormData(prev => ({ ...prev, assignmentReason: e.target.value }))}
                                    placeholder="e.g., Safety equipment for new rider, Maintenance toolkit for vehicle inspection..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                                    rows={3}
                                />
                                {errors.assignmentReason && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <FiX className="w-3 h-3" />
                                        {errors.assignmentReason}
                                    </p>
                                )}
                            </div>

                            {/* Assignment Purpose */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assignment Purpose *
                                </label>
                                <textarea
                                    value={formData.assignmentPurpose}
                                    onChange={(e) => setFormData(prev => ({ ...prev, assignmentPurpose: e.target.value }))}
                                    placeholder="e.g., Helmet for vehicle DL6EV2598, Company uniform for rider..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                                    rows={3}
                                />
                                {errors.assignmentPurpose && (
                                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                        <FiX className="w-3 h-3" />
                                        {errors.assignmentPurpose}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Return Date and Condition */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Expected Return Date */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <FiCalendar className="w-3 h-3 text-yellow-600" />
                                </div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Expected Return Date *
                                </label>
                            </div>
                            <input
                                type="date"
                                value={formData.expectedReturnDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, expectedReturnDate: e.target.value }))}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                            />
                            {errors.expectedReturnDate && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <FiX className="w-3 h-3" />
                                    {errors.expectedReturnDate}
                                </p>
                            )}
                        </div>

                        {/* Asset Condition */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                                    <FiFileText className="w-3 h-3 text-red-600" />
                                </div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Asset Condition at Assignment *
                                </label>
                            </div>
                            <textarea
                                value={formData.condition.description}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    condition: { ...prev.condition, description: e.target.value }
                                }))}
                                placeholder="Describe the current condition of the asset..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                                rows={3}
                            />
                            {errors.conditionDescription && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                    <FiX className="w-3 h-3" />
                                    {errors.conditionDescription}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Any additional notes or instructions..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
                            rows={2}
                        />
                    </div>

                </form>
                
                {/* Fixed Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 bg-white mt-6">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={assignAssetMutation.isPending}
                        className="px-6 py-3"
                    >
                        <FiX className="w-4 h-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={assignAssetMutation.isPending}
                        className="px-6 py-3"
                        onClick={handleSubmit}
                    >
                        {assignAssetMutation.isPending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Assigning...
                            </>
                        ) : (
                            <>
                                <FiCheck className="w-4 h-4 mr-2" />
                                Assign Asset
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AssetAssignmentModal;
