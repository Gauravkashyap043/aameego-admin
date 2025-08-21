import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import SearchableSelect from '../components/SearchableSelect';
import { FiPackage, FiSave, FiX, FiUpload } from 'react-icons/fi';
import {
    useAssetTypes,
    useAssetVendors,
    useVehicleAsset,
    useCreateVehicleAsset,
    useUpdateVehicleAsset
} from '../hooks/useVehicleAssets';
import { useVehicleList } from '../hooks/useVehicles';
// import { useUsersByRole } from '../hooks/useUsers';

interface AssetFormData {
    vehicle: string;
    vehicleAssignment?: string;
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

    const [formData, setFormData] = useState<AssetFormData>({
        vehicle: '',
        vehicleAssignment: '',
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
    const { data: vehiclesData } = useVehicleList(1, 1000); // Get all vehicles
    const { data: assetTypesData } = useAssetTypes();
    const { data: assetVendorsData } = useAssetVendors();
    // const { data: usersData } = useUsersByRole({ role: 'rider', limit: 1000 }); // Get all riders
    const { data: assetData } = useVehicleAsset(id || '');
    const createAssetMutation = useCreateVehicleAsset();
    const updateAssetMutation = useUpdateVehicleAsset();
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
                vehicle: assetData.vehicle?._id || '',
                vehicleAssignment: assetData.vehicleAssignment?._id || '',
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
            alert('Please select an asset type');
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
                alert('Asset updated successfully!');
            } else {
                await createAssetMutation.mutateAsync(formDataToSend);
                alert('Asset created successfully!');
            }

            // Navigate back to vehicle master
            navigate('/vehicle-master');

        } catch (error) {
            console.error('Error saving asset:', error);
            alert('Error saving asset. Please try again.');
        } finally {
            setUploadProgress(0);
        }
    };

    const handleCancel = () => {
        navigate('/vehicle-master');
    };

    // Convert vehicles data to SearchableSelect format
    const vehicleOptions = vehiclesData?.items?.map((vehicle: any) => ({
        label: vehicle.vehicleNumber,
        value: vehicle._id
    })) || [];

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

                {/* Form */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <SearchableSelect
                                    label="Vehicle"
                                    value={formData.vehicle}
                                    onChange={(value) => handleInputChange('vehicle', value)}
                                    options={vehicleOptions}
                                    placeholder="Select Vehicle (Optional)"
                                />
                            </div>

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
            </div>
        </Layout>
    );
};

export default AddAsset;
