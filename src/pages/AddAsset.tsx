import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
// import SearchableSelect from '../components/SearchableSelect';
import { FiPackage, FiSave, FiX, FiUpload, FiClock, FiUser, FiCalendar, FiCheck } from 'react-icons/fi';
import {
    useAssetTypes,
    useAssetVendors,
    useAsset,
    useCreateAsset,
    useUpdateAsset
} from '../hooks/useAssets';
import { useAssetAssignmentHistory } from '../hooks/useAssetAssignment';
import { toast } from 'react-toastify';
// Removed vehicle import as vehicle field is no longer part of assets
// import { useUsersByRole } from '../hooks/useUsers';

interface AssetFormData {
    assetType: string;
    assetVendor?: string;
    assetName: string;
    ownership: 'owned' | 'rented';
    image?: string;
    serialNumber?: string;
    status: 'available' | 'assigned' | 'damaged' | 'lost' | 'maintenance';
    condition: 'new' | 'good' | 'fair' | 'poor';
    assignedTo?: string;
    notes?: string;
}

const AddAsset: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // For editing existing asset
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState(0); // 0: Details, 1: History

    const [formData, setFormData] = useState<AssetFormData>({
        assetType: '',
        assetVendor: '',
        assetName: '',
        ownership: 'owned',
        image: '',
        serialNumber: '',
        status: 'available',
        condition: 'good',
        assignedTo: '',
        notes: '',
    });



    // Real data from API hooks
    const { data: assetTypesData } = useAssetTypes();
    const { data: assetVendorsData } = useAssetVendors();
    // const { data: usersData } = useUsersByRole({ role: 'rider', limit: 1000 }); // Get all riders
    const { data: assetData } = useAsset(id || '');
    const { data: assetHistory } = useAssetAssignmentHistory(id || '');
    const createAssetMutation = useCreateAsset();
    const updateAssetMutation = useUpdateAsset();
    const isLoading = createAssetMutation.isPending || updateAssetMutation.isPending;
    const [uploadProgress, setUploadProgress] = useState<number>(0);

    useEffect(() => {
        // If editing, load asset data
        if (id) {
            setIsEditing(true);
        }
    }, [id]);

    // Load asset data when editing
    useEffect(() => {
        if (assetData && isEditing) {
            setFormData({
                assetType: assetData.assetType?._id || '',
                assetVendor: assetData.assetVendor?._id || '',
                assetName: assetData.assetName || '',
                ownership: assetData.ownership || 'owned',
                image: assetData.image || '',
                serialNumber: assetData.serialNumber || '',
                status: assetData.status || 'available',
                condition: assetData.condition || 'good',
                assignedTo: assetData.assignedTo?._id || '',
                notes: assetData.notes || '',
            });

            // Set image preview if editing
            if (assetData.image) {
                setImagePreview(assetData.image);
            }
        }
    }, [assetData, isEditing]);



    const handleInputChange = (field: keyof AssetFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            setSelectedImageFile(file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImageFile(null);
        setImagePreview('');
        setFormData(prev => ({
            ...prev,
            image: ''
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.assetType) {
            toast.error('Please select an asset type');
            return;
        }

        try {
            // Create FormData for file upload
            const formDataToSend = new FormData();

            // Add all form fields
            Object.keys(formData).forEach(key => {
                const value = formData[key as keyof AssetFormData];
                if (value !== undefined && value !== '') {
                    formDataToSend.append(key, value as string);
                }
            });

            // Add image file if selected
            if (selectedImageFile) {
                formDataToSend.append('image', selectedImageFile);
            }

            if (isEditing && id) {
                await updateAssetMutation.mutateAsync({ id, data: formDataToSend });
                toast.success('Asset updated successfully!');
            } else {
                await createAssetMutation.mutateAsync(formDataToSend);
                toast.success('Asset created successfully!');
            }

            // Navigate back to vehicle master
            navigate('/vehicle-master');

        } catch (error) {
            console.log('Error saving asset:', error);
            toast.error('Error saving asset. Please try again.');
        } finally {
            setUploadProgress(0);
        }
    };

    const handleCancel = () => {
        navigate('/vehicle-master');
    };

    // Removed vehicle options as vehicle field is no longer part of assets

    if (isLoading && isEditing) {
        return (
            <Layout>
                <div className="min-h-screen bg-[#f6f7ff] p-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-lg">Loading asset data...</div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-[#f6f7ff] p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <FiPackage className="text-2xl text-[#3B36FF]" />
                        <h1 className="text-2xl font-semibold text-[#3B36FF]">
                            {isEditing ? 'Edit Asset' : 'Add New Asset'}
                        </h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={handleCancel} className='flex justify-center items-center'>
                            <FiX className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSubmit} disabled={isLoading} className='flex justify-center items-center'>
                            <FiSave className="w-4 h-4 mr-2" />
                            {isLoading ? (uploadProgress > 0 ? `Uploading ${uploadProgress}%` : 'Saving...') : (isEditing ? 'Update Asset' : 'Save Asset')}
                        </Button>
                    </div>
                </div>

                {/* Tabs - Only show when editing */}
                {isEditing && (
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => setActiveTab(0)}
                            className={`px-4 py-2 rounded-t-lg text-sm font-medium focus:outline-none ${
                                activeTab === 0
                                    ? 'bg-white text-[#3B36FF] shadow border-b-2 border-[#3B36FF]'
                                    : 'bg-transparent text-gray-500'
                            }`}
                        >
                            Asset Details
                        </button>
                        <button
                            onClick={() => setActiveTab(1)}
                            className={`px-4 py-2 rounded-t-lg text-sm font-medium focus:outline-none ${
                                activeTab === 1
                                    ? 'bg-white text-[#3B36FF] shadow border-b-2 border-[#3B36FF]'
                                    : 'bg-transparent text-gray-500'
                            }`}
                        >
                            Assignment History
                        </button>
                    </div>
                )}

                {/* Content based on active tab */}
                {activeTab === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Asset Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.assetType}
                                    onChange={(e) => handleInputChange('assetType', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B36FF] focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Asset Type</option>
                                    {assetTypesData?.map((type: any) => (
                                        <option key={type._id} value={type._id}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Asset Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.assetName}
                                    onChange={(e) => handleInputChange('assetName', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B36FF] focus:border-transparent"
                                    placeholder="Enter asset name (optional)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Asset Vendor
                                </label>
                                <select
                                    value={formData.assetVendor}
                                    onChange={(e) => handleInputChange('assetVendor', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B36FF] focus:border-transparent"
                                >
                                    <option value="">Select Vendor (Optional)</option>
                                    {assetVendorsData?.map((vendor: any) => (
                                        <option key={vendor._id} value={vendor._id}>
                                            {vendor.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ownership
                                </label>
                                <select
                                    value={formData.ownership}
                                    onChange={(e) => handleInputChange('ownership', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B36FF] focus:border-transparent"
                                >
                                    <option value="owned">Owned</option>
                                    <option value="rented">Rented</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Serial Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.serialNumber}
                                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B36FF] focus:border-transparent"
                                    placeholder="Enter serial number (optional)"
                                />
                            </div>
                        </div>

                        {/* Status and Condition */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B36FF] focus:border-transparent"
                                >
                                    <option value="available">Available</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="damaged">Damaged</option>
                                    <option value="lost">Lost</option>
                                    <option value="maintenance">Maintenance</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Condition
                                </label>
                                <select
                                    value={formData.condition}
                                    onChange={(e) => handleInputChange('condition', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B36FF] focus:border-transparent"
                                >
                                    <option value="new">New</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="poor">Poor</option>
                                </select>
                            </div>
                        </div>

                        {/* Assignment */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Assigned To
                                </label>
                                <select
                                    value={formData.assignedTo}
                                    onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B36FF] focus:border-transparent"
                                >
                                    <option value="">Not Assigned</option>
                                    {usersData?.users?.map((user: any) => (
                                        <option key={user._id} value={user._id}>
                                            {user.name} ({user.authRef?.identifier || 'No Phone'})
                                        </option>
                                    ))}
                                </select>
                            </div> */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Asset Image
                                </label>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-4">
                                        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors">
                                            <FiUpload className="w-4 h-4" />
                                            <span>Upload Image</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </label>
                                        {selectedImageFile && (
                                            <span className="text-sm text-gray-600">
                                                {selectedImageFile.name} ({(selectedImageFile.size / 1024 / 1024).toFixed(2)} MB)
                                            </span>
                                        )}
                                    </div>

                                    {(imagePreview || formData.image) && (
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={imagePreview || formData.image}
                                                alt="Asset preview"
                                                className="w-20 h-20 object-cover rounded-md border shadow-sm"
                                            />
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm text-gray-600">
                                                    {selectedImageFile ? selectedImageFile.name : 'Current image'}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                >
                                                    Remove Image
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-xs text-gray-500">
                                        Supported formats: JPG, PNG. Max size: 5MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Image Upload */}


                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#3B36FF] focus:border-transparent"
                                placeholder="Enter any additional notes about the asset..."
                            />
                        </div>
                    </form>
                </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        {/* Asset History */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <FiClock className="text-2xl text-[#3B36FF]" />
                                <h2 className="text-xl font-semibold text-gray-900">Asset Assignment History</h2>
                            </div>

                            {assetHistory && assetHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {assetHistory.map((assignment: any, index: number) => (
                                        <div key={assignment._id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                        assignment.assignmentStatus === 'active' ? 'bg-blue-100' :
                                                        assignment.assignmentStatus === 'returned' ? 'bg-gray-100' :
                                                        assignment.assignmentStatus === 'pending' ? 'bg-yellow-100' :
                                                        assignment.assignmentStatus === 'approved' ? 'bg-green-100' :
                                                        assignment.assignmentStatus === 'rejected' ? 'bg-red-100' : 'bg-gray-100'
                                                    }`}>
                                                        {assignment.assignmentStatus === 'active' ? (
                                                            <FiUser className="w-4 h-4 text-blue-600" />
                                                        ) : assignment.assignmentStatus === 'returned' ? (
                                                            <FiCalendar className="w-4 h-4 text-gray-600" />
                                                        ) : assignment.assignmentStatus === 'pending' ? (
                                                            <FiClock className="w-4 h-4 text-yellow-600" />
                                                        ) : assignment.assignmentStatus === 'approved' ? (
                                                            <FiCheck className="w-4 h-4 text-green-600" />
                                                        ) : assignment.assignmentStatus === 'rejected' ? (
                                                            <FiX className="w-4 h-4 text-red-600" />
                                                        ) : (
                                                            <FiPackage className="w-4 h-4 text-gray-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 capitalize">
                                                            Asset {assignment.assignmentStatus === 'active' ? 'Assigned' :
                                                                   assignment.assignmentStatus === 'returned' ? 'Returned' :
                                                                   assignment.assignmentStatus === 'pending' ? 'Assignment Pending' :
                                                                   assignment.assignmentStatus === 'approved' ? 'Assignment Approved' :
                                                                   assignment.assignmentStatus === 'rejected' ? 'Assignment Rejected' : assignment.assignmentStatus}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">
                                                            {assignment.assignmentDate ? new Date(assignment.assignmentDate).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            }) : 'Unknown date'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Assignment Details */}
                                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                {assignment.assignedTo && (
                                                    <div className="flex items-center gap-2">
                                                        <FiUser className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">
                                                            <span className="font-medium">Assigned To:</span> {assignment.assignedTo.name || assignment.assignedTo.profileCode || 'Unknown User'}
                                                        </span>
                                                    </div>
                                                )}

                                                {assignment.assignedBy && (
                                                    <div className="flex items-center gap-2">
                                                        <FiUser className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">
                                                            <span className="font-medium">Assigned By:</span> {assignment.assignedBy.name || assignment.assignedBy.profileCode || 'Unknown User'}
                                                        </span>
                                                    </div>
                                                )}



                                                {assignment.actualReturnDate && (
                                                    <div className="flex items-center gap-2">
                                                        <FiCalendar className="w-4 h-4 text-gray-400" />
                                                        <span className="text-gray-600">
                                                            <span className="font-medium">Actual Return:</span> {new Date(assignment.actualReturnDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                )}

                                                {assignment.assignmentType && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-600">
                                                            <span className="font-medium">Type:</span> {assignment.assignmentType.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}

                                                {assignment.assignmentReason && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-gray-600">
                                                            <span className="font-medium">Reason:</span> {assignment.assignmentReason}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Assignment Purpose */}
                                            {assignment.assignmentPurpose && (
                                                <div className="mt-3">
                                                    <span className="text-sm text-gray-600">
                                                        <span className="font-medium">Purpose:</span> {assignment.assignmentPurpose}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Asset Condition */}
                                            {assignment.assetConditionAtAssignment && (
                                                <div className="mt-3 p-3 bg-blue-50 rounded-md">
                                                    <h5 className="text-sm font-medium text-blue-700 mb-1">Asset Condition at Assignment:</h5>
                                                    <p className="text-sm text-blue-600">{assignment.assetConditionAtAssignment.description}</p>
                                                </div>
                                            )}

                                            {/* Return Condition */}
                                            {assignment.assetConditionAtReturn && (
                                                <div className="mt-3 p-3 bg-green-50 rounded-md">
                                                    <h5 className="text-sm font-medium text-green-700 mb-1">Asset Condition at Return:</h5>
                                                    <p className="text-sm text-green-600">{assignment.assetConditionAtReturn.description}</p>
                                                </div>
                                            )}

                                            {/* Notes */}
                                            {assignment.notes && (
                                                <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                                                    <h5 className="text-sm font-medium text-yellow-700 mb-1">Notes:</h5>
                                                    <p className="text-sm text-yellow-600">{assignment.notes}</p>
                                                </div>
                                            )}

                                            {/* Status Badge */}
                                            <div className="mt-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    assignment.assignmentStatus === 'active' ? 'bg-blue-100 text-blue-800' :
                                                    assignment.assignmentStatus === 'returned' ? 'bg-gray-100 text-gray-800' :
                                                    assignment.assignmentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    assignment.assignmentStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                                    assignment.assignmentStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {assignment.assignmentStatus.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FiClock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No History Available</h3>
                                    <p className="text-gray-500">This asset doesn't have any assignment history yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default AddAsset;
