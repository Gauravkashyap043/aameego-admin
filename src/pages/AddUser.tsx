import React, { useState, useEffect, useRef } from 'react';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Layout from '../components/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiDownload, FiEye } from 'react-icons/fi';
import Modal from '../components/Modal';
import ComingSoon from '../components/ComingSoon';
import { useUpdateUserPersonalDetails, useUpdateDocument, useUpdateUserStatus } from '../hooks/useUpdateUser';
import { toast } from 'react-toastify';
import { formatDateForInput, formatDateForBackend } from '../utils/dateUtils';

const TABS = [
  'Personal information',
  'Bank Details',
  'Documents',
  'Vehicle Details',
];

const AddUser: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Add the new hooks
  const updateUserPersonalDetails = useUpdateUserPersonalDetails();
  const updateDocument = useUpdateDocument();
  const updateUserStatus = useUpdateUserStatus();

  // Add state for rejection/deactivation
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [deactivateReason, setDeactivateReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [father, setFather] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pin, setPin] = useState('');
  const [state, setState] = useState('');
  // Bank
  const [bankName, setBankName] = useState('');
  const [bankFullName, setBankFullName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  // Documents
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  // Add state for document files and previews
  const [aadhaarFile, setAadhaarFile] = useState<File | null>(null);
  const [aadhaarPreview, setAadhaarPreview] = useState<any>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [panPreview, setPanPreview] = useState<any>(null);
  const [licenseFrontFile, setLicenseFrontFile] = useState<File | null>(null);
  const [licenseFrontPreview, setLicenseFrontPreview] = useState<any>(null);
  const [licenseBackFile, setLicenseBackFile] = useState<File | null>(null);
  const [licenseBackPreview, setLicenseBackPreview] = useState<any>(null);

  // Add state for bank document files and previews
  const [passbookFile, setPassbookFile] = useState<File | null>(null);
  const [passbookPreview, setPassbookPreview] = useState<any>(null);
  const [chequeFile, setChequeFile] = useState<File | null>(null);
  const [chequePreview, setChequePreview] = useState<any>(null);

  // Add state to hold fetched user data
  const [fetchedUser, setFetchedUser] = useState<any>(null);

  // Add state for preview modal
  const [previewModal, setPreviewModal] = useState<{ open: boolean, url: string, type: string } | null>(null);

  // Add refs for file inputs
  const aadhaarFrontInputRef = useRef<HTMLInputElement>(null);
  const aadhaarBackInputRef = useRef<HTMLInputElement>(null);
  const panInputRef = useRef<HTMLInputElement>(null);
  const licenseFrontInputRef = useRef<HTMLInputElement>(null);
  const licenseBackInputRef = useRef<HTMLInputElement>(null);
  const passbookInputRef = useRef<HTMLInputElement>(null);
  const chequeInputRef = useRef<HTMLInputElement>(null);

  // Track changes for each tab
  const [hasChanges, setHasChanges] = useState({
    personal: false,
    bank: false,
    vehicle: false,
    documents: false
  });

  // Helper function to normalize file for FormData
  const normalizeFile = (file: File | null) => {
    if (!file) return null;
    return file;
  };

  // Handle status updates (reject/deactivate)
  const handleStatusUpdate = (status: 'rejected' | 'deactived', reason: string) => {
    if (!id) return;

    setIsRejecting(true);

    updateUserStatus.mutate(
      { userId: String(id), data: { status } },
      {
        onSuccess: () => {
          setIsRejecting(false);
          const actionText = status === 'rejected' ? 'Rejected' : 'Deactivated';
          toast.success(`User ${actionText} - User status has been updated to ${status}.${reason ? ` Reason: ${reason}` : ''}`);
          // Clear reasons
          setRejectionReason('');
          setDeactivateReason('');
          // Close modals
          setShowRejectModal(false);
          setShowDeactivateModal(false);
          // Navigate back to user list
          navigate('/user-management');
        },
        onError: (error) => {
          setIsRejecting(false);
          toast.error(`Failed to update user status: ${error.message}`);
        },
      }
    );
  };

  const handleConfirmReject = () => {
    handleStatusUpdate('rejected', rejectionReason);
  };

  const handleConfirmDeactivate = () => {
    handleStatusUpdate('deactived', deactivateReason);
  };

  // Validation functions
  const validatePersonalInfo = () => {
    if (!fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!dob) {
      setError('Date of birth is required');
      return false;
    }
    if (!gender) {
      setError('Gender is required');
      return false;
    }
    if (!father.trim()) {
      setError('Father\'s name is required');
      return false;
    }
    if (!city.trim()) {
      setError('City/District is required');
      return false;
    }
    if (!address.trim()) {
      setError('Address is required');
      return false;
    }
    if (!pin.trim()) {
      setError('PIN code is required');
      return false;
    }
    if (!state.trim()) {
      setError('State is required');
      return false;
    }
    setError('');
    return true;
  };

  const validateBankDetails = () => {
    if (!bankName.trim()) {
      setError('Bank name is required');
      return false;
    }
    if (!bankFullName.trim()) {
      setError('Account holder name is required');
      return false;
    }
    if (!accountNumber.trim()) {
      setError('Account number is required');
      return false;
    }
    if (!confirmAccountNumber.trim()) {
      setError('Confirm account number is required');
      return false;
    }
    if (accountNumber !== confirmAccountNumber) {
      setError('Account numbers do not match');
      return false;
    }
    if (!ifsc.trim()) {
      setError('IFSC code is required');
      return false;
    }
    setError('');
    return true;
  };

  const validateDocuments = () => {
    if (!aadhaarNumber.trim()) {
      setError('Aadhaar number is required');
      return false;
    }
    if (!panNumber.trim()) {
      setError('PAN number is required');
      return false;
    }
    if (!licenseNumber.trim()) {
      setError('License number is required');
      return false;
    }
    setError('');
    return true;
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/user/${id}`)
      .then(res => {
        const userData = res.data.data;
        // setUser(userData);
        setFullName(userData.name || '');
        setPhone(userData.authRef?.identifier || '');
        setDob(formatDateForInput(userData.document?.aadhaar?.ocrFront?.dob || ''));
        setGender(userData.document?.aadhaar?.ocrFront?.gender || '');
        setFather(userData.document?.aadhaar?.ocrFront?.rawText?.split(',')[0] || '');
        setAddress(userData.document?.aadhaar?.ocrFront?.rawText || '');
        setCity(userData?.addressRef?.cityDistrict || ''); // Map city if available
        setPin(userData?.addressRef?.pinCode || '');
        setState(userData?.addressRef?.state || ''); // Map state if available
        setBankName(userData.document?.bank?.details?.bankName || '');
        setBankFullName(userData.document?.bank?.details?.holderName || '');
        setAccountNumber(userData.document?.bank?.details?.accountNumber || '');
        setConfirmAccountNumber(userData.document?.bank?.details?.accountNumber || '');
        setIfsc(userData.document?.bank?.details?.ifsc || '');
        setAadhaarNumber(userData.document?.aadhaar?.ocrFront?.aadharNumber || '');
        setPanNumber(userData.document?.pan?.ocr?.panNumber || '');
        setLicenseNumber(userData.document?.dl?.ocrFront?.dlNumber || '');
        setAadhaarPreview(userData.document?.aadhaar?.file || null);
        setPanPreview(userData.document?.pan?.file || null);
        setLicenseFrontPreview(userData.document?.dl?.frontFile || null);
        setLicenseBackPreview(userData.document?.dl?.backFile || null);
        // Set bank document previews from URLs
        if (userData.document?.bank?.passbookUrl) {
          setPassbookPreview({ url: userData.document.bank.passbookUrl, name: 'Passbook', size: 'N/A' });
        }
        if (userData.document?.bank?.chequeUrl) {
          setChequePreview({ url: userData.document.bank.chequeUrl, name: 'Cheque', size: 'N/A' });
        }
        setFetchedUser(userData);
      })
      .catch(() => {
        setError('Failed to fetch user details');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // File change handlers
  const handleAadhaarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAadhaarFile(e.target.files[0]);
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setAadhaarPreview({ url: URL.createObjectURL(file), name: file.name, size: `${Math.round(file.size / 1024)} kb` });
      } else if (file.type === 'application/pdf') {
        setAadhaarPreview({ url: URL.createObjectURL(file), name: file.name, size: `${Math.round(file.size / 1024)} kb`, isPdf: true });
      }
      setHasChanges(prev => ({ ...prev, documents: true }));
    }
  };
  const handlePanFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPanFile(e.target.files[0]);
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setPanPreview({ url: URL.createObjectURL(file), name: file.name, size: `${Math.round(file.size / 1024)} kb` });
      } else if (file.type === 'application/pdf') {
        setPanPreview({ url: URL.createObjectURL(file), name: file.name, size: `${Math.round(file.size / 1024)} kb`, isPdf: true });
      }
      setHasChanges(prev => ({ ...prev, documents: true }));
    }
  };
  const handleLicenseFrontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLicenseFrontFile(e.target.files[0]);
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setLicenseFrontPreview({ url: URL.createObjectURL(file), name: file.name, size: `${Math.round(file.size / 1024)} kb` });
      } else if (file.type === 'application/pdf') {
        setLicenseFrontPreview({ url: URL.createObjectURL(file), name: file.name, size: `${Math.round(file.size / 1024)} kb`, isPdf: true });
      }
      setHasChanges(prev => ({ ...prev, documents: true }));
    }
  };
  const handleLicenseBackFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLicenseBackFile(e.target.files[0]);
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setLicenseBackPreview({ url: URL.createObjectURL(file), name: file.name, size: `${Math.round(file.size / 1024)} kb` });
      } else if (file.type === 'application/pdf') {
        setLicenseBackPreview({ url: URL.createObjectURL(file), name: file.name, size: `${Math.round(file.size / 1024)} kb`, isPdf: true });
      }
      setHasChanges(prev => ({ ...prev, documents: true }));
    }
  };

  // Bank document file change handlers
  const handlePassbookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPassbookFile(e.target.files[0]);
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setPassbookPreview({ url: URL.createObjectURL(file), name: file.name, size: `${Math.round(file.size / 1024)} kb` });
      } else if (file.type === 'application/pdf') {
        setPassbookPreview({ url: URL.createObjectURL(file), name: file.name, size: `${Math.round(file.size / 1024)} kb`, isPdf: true });
      }
      setHasChanges(prev => ({ ...prev, bank: true }));
    }
  };

  const handleChequeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setChequeFile(e.target.files[0]);
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setChequePreview({ url: URL.createObjectURL(file), name: file.name, size: `${Math.round(file.size / 1024)} kb` });
      } else if (file.type === 'application/pdf') {
        setChequePreview({ url: URL.createObjectURL(file), name: file.name, size: `${Math.round(file.size / 1024)} kb`, isPdf: true });
      }
      setHasChanges(prev => ({ ...prev, bank: true }));
    }
  };

  // Save personal information
  const handleSavePersonalInfo = () => {
    if (!id) return;

    if (!validatePersonalInfo()) {
      return;
    }

    setSaving(true);

    const personalData = {
      fullName: fullName,
      dob: formatDateForBackend(dob),
      gender: gender.toLowerCase(),
      fatherName: father,
      address: {
        address: address,
        cityDistrict: city,
        pinCode: pin,
      },
    };

    updateUserPersonalDetails.mutate(
      { userId: String(id), data: personalData },
      {
        onSuccess: () => {
          setSaving(false);
          toast.success('Personal information updated successfully!');
          setHasChanges(prev => ({ ...prev, personal: false }));
          setTimeout(() => {
            setActiveTab(1); // Move to next tab
          }, 2000);
        },
        onError: (error) => {
          setSaving(false);
          toast.error(`Failed to save personal information: ${error.message}`);
        },
      }
    );
  };

  // Save bank details
  const handleSaveBankDetails = () => {
    if (!id) return;

    if (!validateBankDetails()) {
      return;
    }

    setSaving(true);

    const formData = new FormData();

    const passbook = normalizeFile(passbookFile);
    if (passbook) {
      formData.append('passbook', passbook);
    }

    const cheque = normalizeFile(chequeFile);
    if (cheque) {
      formData.append('cheque', cheque);
    }

    formData.append(
      'bank',
      JSON.stringify({
        details: {
          bankName,
          holderName: bankFullName,
          accountNumber,
          ifsc,
        },
      })
    );

    formData.append('type', 'bank');

    updateDocument.mutate(
      { userId: String(id), formData },
      {
        onSuccess: () => {
          setSaving(false);
          toast.success('Bank details updated successfully!');
          setHasChanges(prev => ({ ...prev, bank: false }));
          setTimeout(() => {
            setActiveTab(2); // Move to next tab
          }, 2000);
        },
        onError: (error: Error) => {
          setSaving(false);
          toast.error(`Failed to save bank details: ${error.message}`);
        },
      }
    );
  };

  // Save vehicle details
 

  // Save and verify all documents
  const handleSaveAndVerify = () => {
    if (!id) return;

    if (!validateDocuments()) {
      return;
    }

    setSaving(true);

    const formData = new FormData();

    // Aadhaar
    const aadhaarFront = normalizeFile(aadhaarFile);
    if (aadhaarFront) {
      formData.append('aadhaarFront', aadhaarFront);
    }

    const aadhaarBack = normalizeFile(aadhaarFile); // Using same file for back for now
    if (aadhaarBack) {
      formData.append('aadhaarBack', aadhaarBack);
    }

    formData.append(
      'aadhaar',
      JSON.stringify({
        ocrFront: {
          aadharNumber: aadhaarNumber,
          name: fullName,
          dob: formatDateForBackend(dob),
          rawText: address,
          gender: gender.toLowerCase(),
        },
        ocrBack: {
          aadharNumber: aadhaarNumber,
        },
      })
    );

    // PAN
    const pan = normalizeFile(panFile);
    if (pan) {
      formData.append('pan', pan);
    }
    formData.append(
      'pan',
      JSON.stringify({
        ocr: {
          panNumber: panNumber,
        },
      })
    );

    // DL
    const dlFront = normalizeFile(licenseFrontFile);
    if (dlFront) {
      formData.append('dlFront', dlFront);
    }
    const dlBack = normalizeFile(licenseBackFile);
    if (dlBack) {
      formData.append('dlBack', dlBack);
    }
    formData.append(
      'dl',
      JSON.stringify({
        ocrFront: {
          dlNumber: licenseNumber,
          name: fullName || '',
          dob: formatDateForBackend(dob) || '',
          rawText: address,
        },
        ocrBack: {
          rawText: address,
        },
      })
    );

    formData.append('type', 'documents');

    updateDocument.mutate(
      { userId: String(id), formData },
      {
        onSuccess: () => {
          setSaving(false);
          toast.success('Documents updated successfully!');
          setHasChanges(prev => ({ ...prev, documents: false }));
          setTimeout(() => {
            navigate('/user-management'); // Redirect to user list
          }, 2000);
        },
        onError: (error: Error) => {
          setSaving(false);
          toast.error(`Failed to save documents: ${error.message}`);
        },
      }
    );
  };



  // Handle reject
  const handleReject = () => {
    setShowRejectModal(true);
  };

  // Handle deactivate
  const handleDeactivate = () => {
    setShowDeactivateModal(true);
  };

  // Check if current tab has unsaved changes
  const hasUnsavedChanges = () => {
    switch (activeTab) {
      case 0: return hasChanges.personal;
      case 1: return hasChanges.bank;
      case 2: return hasChanges.vehicle;
      case 3: return hasChanges.documents;
      default: return false;
    }
  };

  // Handle tab change with unsaved changes warning
  const handleTabChange = (newTab: number) => {
    if (hasUnsavedChanges()) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        setActiveTab(newTab);
      }
    } else {
      setActiveTab(newTab);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#f6f7ff] flex flex-col">
        <div className="flex-1 p-8">
          {/* Breadcrumb and Title */}
          <div className="mb-6">
            <div className="text-sm mt-1">
              <span className="text-[#3B36FF] font-medium cursor-pointer" onClick={() => navigate('/user-management')}>User List</span>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">{id ? 'Edit User' : 'New User'}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-300 mb-6 flex space-x-6">
            {TABS.map((tab, idx) => (
              <button
                key={tab}
                className={`pb-2 text-lg font-medium focus:outline-none ${activeTab === idx
                  ? 'border-b-2 border-[#3B36FF] text-[#3B36FF]'
                  : 'text-gray-400'
                  }`}
                onClick={() => handleTabChange(idx)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow p-8">
            {loading ? (
              <div className="text-center text-indigo-600">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500 mb-4">{error}</div>
            ) : null}
            {!loading && (
              <>
                {activeTab === 0 && (
                  <div>
                    <div className="text-xl font-semibold mb-4">Personal Details</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputField label="Full Name" value={fullName} onChange={e => { setFullName(e.target.value); setHasChanges(prev => ({ ...prev, personal: true })); }} placeholder="Enter full name" required />
                      <InputField label="Phone Number" value={phone} onChange={e => { setPhone(e.target.value); setHasChanges(prev => ({ ...prev, personal: true })); }} placeholder="Enter phone number" required />
                      <InputField label="Date Of Birth" value={dob} onChange={e => { setDob(e.target.value); setHasChanges(prev => ({ ...prev, personal: true })); }} type="date" required />
                      <InputField label="Gender" value={gender} onChange={e => { setGender(e.target.value); setHasChanges(prev => ({ ...prev, personal: true })); }} type="select" options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]} required />
                      <InputField label="Fathers Name" value={father} onChange={e => { setFather(e.target.value); setHasChanges(prev => ({ ...prev, personal: true })); }} placeholder="Enter father's name" required />
                      <InputField label="City/District" value={city} onChange={e => { setCity(e.target.value); setHasChanges(prev => ({ ...prev, personal: true })); }} placeholder="Enter city/district" required />
                      <InputField label="Address" value={address} onChange={e => { setAddress(e.target.value); setHasChanges(prev => ({ ...prev, personal: true })); }} type="textarea" placeholder="Enter address" className="md:col-span-3" required />
                      <InputField label="PIN Code" value={pin} onChange={e => { setPin(e.target.value); setHasChanges(prev => ({ ...prev, personal: true })); }} placeholder="Enter PIN code" required />
                      <InputField label="State" value={state} onChange={e => { setState(e.target.value); setHasChanges(prev => ({ ...prev, personal: true })); }} placeholder="Enter state" required />
                    </div>
                    <div className="flex mt-8 space-x-4">
                      {fetchedUser?.status === 'verified' ? (
                        <Button variant="danger" onClick={handleDeactivate} disabled={saving || isRejecting}>
                          {isRejecting ? 'Deactivating...' : 'Deactivate'}
                        </Button>
                      ) : (
                        <Button variant="danger" onClick={handleReject} disabled={saving || isRejecting}>
                          {isRejecting ? 'Rejecting...' : 'Reject'}
                        </Button>
                      )}
                      <Button variant="primary" onClick={handleSavePersonalInfo} disabled={saving || isRejecting}>
                        {saving ? 'Saving...' : 'Save & Next'}
                      </Button>
                    </div>
                  </div>
                )}
                {activeTab === 1 && (
                  <div>
                    <div className="text-xl font-semibold mb-4">Bank Details</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputField label="Bank Name" value={bankName} onChange={e => { setBankName(e.target.value); setHasChanges(prev => ({ ...prev, bank: true })); }} placeholder="Enter bank name" required />
                      <InputField label="Full Name" value={bankFullName} onChange={e => { setBankFullName(e.target.value); setHasChanges(prev => ({ ...prev, bank: true })); }} placeholder="Enter account holder name" required />
                      <InputField label="Account Number" value={accountNumber} onChange={e => { setAccountNumber(e.target.value); setHasChanges(prev => ({ ...prev, bank: true })); }} placeholder="Enter account number" required />
                      <InputField label="Confirm Account Number" value={confirmAccountNumber} onChange={e => { setConfirmAccountNumber(e.target.value); setHasChanges(prev => ({ ...prev, bank: true })); }} placeholder="Re-enter account number" required />
                      <InputField label="IFSC Code" value={ifsc} onChange={e => { setIfsc(e.target.value); setHasChanges(prev => ({ ...prev, bank: true })); }} placeholder="Enter IFSC code" required />
                    </div>
                    {/* Uploaded Documents */}
                    <div className="mt-8">
                      <div className="text-lg font-medium mb-2">Uploaded Documents</div>
                      <div className="flex flex-wrap gap-4 mb-4">
                        {/* Bank Passbook */}
                        {passbookPreview && (
                          <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                            <div className="flex items-center gap-2">
                              <FiDownload className="text-red-500 text-2xl" />
                              <span className="font-medium text-sm">Bank Passbook</span>
                              <span className="ml-auto text-xs text-gray-400">{passbookPreview?.size || 'N/A'}</span>
                            </div>
                            {passbookPreview && (
                              <div className="flex flex-col items-center mt-2">
                                {passbookPreview.isPdf ? (
                                  <FiDownload className="text-red-500 text-4xl mb-1" />
                                ) : (
                                  <img src={passbookPreview.url} alt="Passbook Preview" className="w-16 h-16 object-cover rounded border mb-1" />
                                )}
                                <span className="text-xs text-gray-500">{passbookPreview.name}</span>
                              </div>
                            )}
                            <div className="flex gap-2 mt-2">
                              {/* <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeletePassbook}><FiTrash2 /></button> */}
                              <button className="text-blue-500 hover:text-blue-700" title="Download" onClick={() => setPreviewModal({ open: true, url: passbookPreview?.url, type: passbookPreview?.isPdf ? 'pdf' : 'image' })}><FiDownload /></button>
                              <button className="text-gray-500 hover:text-gray-700" title="View" onClick={() => setPreviewModal({ open: true, url: passbookPreview?.url, type: passbookPreview?.isPdf ? 'pdf' : 'image' })}><FiEye /></button>
                            </div>
                          </div>
                        )}
                        {/* Cancelled Cheque */}
                        {chequePreview && (
                          <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                            <div className="flex items-center gap-2">
                              <FiDownload className="text-red-500 text-2xl" />
                              <span className="font-medium text-sm">Cancelled Cheque</span>
                              <span className="ml-auto text-xs text-gray-400">{chequePreview?.size || 'N/A'}</span>
                            </div>
                            {chequePreview && (
                              <div className="flex flex-col items-center mt-2">
                                {chequePreview.isPdf ? (
                                  <FiDownload className="text-red-500 text-4xl mb-1" />
                                ) : (
                                  <img src={chequePreview.url} alt="Cheque Preview" className="w-16 h-16 object-cover rounded border mb-1" />
                                )}
                                <span className="text-xs text-gray-500">{chequePreview.name}</span>
                              </div>
                            )}
                            <div className="flex gap-2 mt-2">
                              {/* <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeleteCheque}><FiTrash2 /></button> */}
                              <button className="text-blue-500 hover:text-blue-700" title="Download" onClick={() => setPreviewModal({ open: true, url: chequePreview?.url, type: chequePreview?.isPdf ? 'pdf' : 'image' })}><FiDownload /></button>
                              <button className="text-gray-500 hover:text-gray-700" title="View" onClick={() => setPreviewModal({ open: true, url: chequePreview?.url, type: chequePreview?.isPdf ? 'pdf' : 'image' })}><FiEye /></button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 cursor-pointer"
                        onClick={() => passbookInputRef.current?.click()}>
                        <FiDownload className="mb-1" /> Upload Bank Passbook
                        <input type="file" ref={passbookInputRef} className="hidden" onChange={handlePassbookFileChange} />
                      </div>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 cursor-pointer"
                        onClick={() => chequeInputRef.current?.click()}>
                        <FiDownload className="mb-1" /> Upload Cancelled Cheque
                        <input type="file" ref={chequeInputRef} className="hidden" onChange={handleChequeFileChange} />
                      </div>
                    </div>
                    <div className="flex mt-8 space-x-4">
                      {fetchedUser?.status === 'verified' ? (
                        <Button variant="danger" onClick={handleDeactivate} disabled={saving || isRejecting}>
                          {isRejecting ? 'Deactivating...' : 'Deactivate'}
                        </Button>
                      ) : (
                        <Button variant="danger" onClick={handleReject} disabled={saving || isRejecting}>
                          {isRejecting ? 'Rejecting...' : 'Reject'}
                        </Button>
                      )}
                      <Button variant="primary" onClick={handleSaveBankDetails} disabled={saving || isRejecting}>
                        {saving ? 'Saving...' : 'Save & Next'}
                      </Button>
                    </div>
                  </div>
                )}
                {activeTab === 2 && (
                  <div>
                    {/* Aadhaar Card */}
                    <div className="mb-8">
                      <div className="text-base font-semibold mb-2">Aadhaar Card</div>
                      <InputField label="Aadhaar Number" value={aadhaarNumber} onChange={e => { setAadhaarNumber(e.target.value); setHasChanges(prev => ({ ...prev, documents: true })); }} placeholder="Enter Aadhaar Number" required />
                      <div className="text-sm font-medium mb-2 mt-4">Uploaded Documents</div>
                      <div className="flex flex-wrap gap-4 mb-2">
                        {/* Aadhaar Front */}
                        {(aadhaarPreview || fetchedUser?.document?.aadhaar?.frontUrl) && (
                          <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                            <div className="flex items-center gap-2">
                              <FiDownload className="text-red-500 text-2xl" />
                              <span className="font-medium text-sm">Front</span>
                              <span className="ml-auto text-xs text-gray-400">{aadhaarPreview?.size || (fetchedUser?.document?.aadhaar?.frontUrl ? '' : '92 kb')}</span>
                            </div>
                            {(aadhaarPreview || fetchedUser?.document?.aadhaar?.frontUrl) && (
                              <div className="flex flex-col items-center mt-2">
                                {aadhaarPreview ? (
                                  aadhaarPreview.isPdf ? (
                                    <FiDownload className="text-red-500 text-4xl mb-1" />
                                  ) : (
                                    <img src={aadhaarPreview.url} alt="Aadhaar Preview" className="w-16 h-16 object-cover rounded border mb-1" />
                                  )
                                ) : (
                                  <img src={fetchedUser.document.aadhaar.frontUrl} alt="Aadhaar Front" className="w-16 h-16 object-cover rounded border mb-1" />
                                )}
                                <span className="text-xs text-gray-500">{aadhaarPreview?.name || ''}</span>
                              </div>
                            )}
                            <div className="flex gap-2 mt-2">
                              {/* <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeleteAadhaar}><FiTrash2 /></button> */}
                              <button className="text-blue-500 hover:text-blue-700" title="Download" onClick={() => setPreviewModal({ open: true, url: aadhaarPreview?.url || fetchedUser?.document?.aadhaar?.frontUrl, type: aadhaarPreview?.isPdf ? 'pdf' : 'image' })}><FiDownload /></button>
                              <button className="text-gray-500 hover:text-gray-700" title="View" onClick={() => setPreviewModal({ open: true, url: aadhaarPreview?.url || fetchedUser?.document?.aadhaar?.frontUrl, type: aadhaarPreview?.isPdf ? 'pdf' : 'image' })}><FiEye /></button>
                            </div>
                          </div>
                        )}
                        {/* Aadhaar Back */}
                        {(aadhaarPreview || fetchedUser?.document?.aadhaar?.backUrl) && (
                          <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                            <div className="flex items-center gap-2">
                              <FiDownload className="text-red-500 text-2xl" />
                              <span className="font-medium text-sm">Back</span>
                              <span className="ml-auto text-xs text-gray-400">{aadhaarPreview?.size || (fetchedUser?.document?.aadhaar?.backUrl ? '' : '92 kb')}</span>
                            </div>
                            {(aadhaarPreview || fetchedUser?.document?.aadhaar?.backUrl) && (
                              <div className="flex flex-col items-center mt-2">
                                {aadhaarPreview ? (
                                  aadhaarPreview.isPdf ? (
                                    <FiDownload className="text-red-500 text-4xl mb-1" />
                                  ) : (
                                    <img src={aadhaarPreview.url} alt="Aadhaar Preview" className="w-16 h-16 object-cover rounded border mb-1" />
                                  )
                                ) : (
                                  <img src={fetchedUser.document.aadhaar.backUrl} alt="Aadhaar Back" className="w-16 h-16 object-cover rounded border mb-1" />
                                )}
                                <span className="text-xs text-gray-500">{aadhaarPreview?.name || ''}</span>
                              </div>
                            )}
                            <div className="flex gap-2 mt-2">
                              {/* <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeleteAadhaar}><FiTrash2 /></button> */}
                              <button className="text-blue-500 hover:text-blue-700" title="Download" onClick={() => setPreviewModal({ open: true, url: aadhaarPreview?.url || fetchedUser?.document?.aadhaar?.backUrl, type: aadhaarPreview?.isPdf ? 'pdf' : 'image' })}><FiDownload /></button>
                              <button className="text-gray-500 hover:text-gray-700" title="View" onClick={() => setPreviewModal({ open: true, url: aadhaarPreview?.url || fetchedUser?.document?.aadhaar?.backUrl, type: aadhaarPreview?.isPdf ? 'pdf' : 'image' })}><FiEye /></button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer"
                        onClick={() => aadhaarFrontInputRef.current?.click()}>
                        <FiDownload className="mb-1" /> Upload Aadhaar Front
                        <input type="file" ref={aadhaarFrontInputRef} className="hidden" onChange={handleAadhaarFileChange} />
                      </div>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer"
                        onClick={() => aadhaarBackInputRef.current?.click()}>
                        <FiDownload className="mb-1" /> Upload Aadhaar Back
                        <input type="file" ref={aadhaarBackInputRef} className="hidden" onChange={handleAadhaarFileChange} />
                      </div>
                    </div>
                    {/* Pan Card */}
                    <div className="mb-8">
                      <div className="text-base font-semibold mb-2">Pan Card</div>
                      <InputField label="PAN Card" value={panNumber} onChange={e => { setPanNumber(e.target.value); setHasChanges(prev => ({ ...prev, documents: true })); }} placeholder="Enter PAN Number" required />
                      <div className="text-sm font-medium mb-2 mt-4">Uploaded Documents</div>
                      <div className="flex flex-wrap gap-4 mb-2">
                        {(panPreview || fetchedUser?.document?.pan?.url) && (
                          <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                            <div className="flex items-center gap-2">
                              <FiDownload className="text-red-500 text-2xl" />
                              <span className="font-medium text-sm">Front</span>
                              <span className="ml-auto text-xs text-gray-400">{panPreview?.size || (fetchedUser?.document?.pan?.url ? '' : '92 kb')}</span>
                            </div>
                            {(panPreview || fetchedUser?.document?.pan?.url) && (
                              <div className="flex flex-col items-center mt-2">
                                {panPreview ? (
                                  panPreview.isPdf ? (
                                    <FiDownload className="text-red-500 text-4xl mb-1" />
                                  ) : (
                                    <img src={panPreview.url} alt="PAN Preview" className="w-16 h-16 object-cover rounded border mb-1" />
                                  )
                                ) : (
                                  <img src={fetchedUser.document.pan.url} alt="PAN Front" className="w-16 h-16 object-cover rounded border mb-1" />
                                )}
                                <span className="text-xs text-gray-500">{panPreview?.name || ''}</span>
                              </div>
                            )}
                            <div className="flex gap-2 mt-2">
                              {/* <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeletePan}><FiTrash2 /></button> */}
                              <button className="text-blue-500 hover:text-blue-700" title="Download" onClick={() => setPreviewModal({ open: true, url: panPreview?.url || fetchedUser?.document?.pan?.url, type: panPreview?.isPdf ? 'pdf' : 'image' })}><FiDownload /></button>
                              <button className="text-gray-500 hover:text-blue-700" title="View" onClick={() => setPreviewModal({ open: true, url: panPreview?.url || fetchedUser?.document?.pan?.url, type: panPreview?.isPdf ? 'pdf' : 'image' })}><FiEye /></button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer"
                        onClick={() => panInputRef.current?.click()}>
                        <FiDownload className="mb-1" /> Upload PAN
                        <input type="file" ref={panInputRef} className="hidden" onChange={handlePanFileChange} />
                      </div>
                    </div>
                    {/* Driver License */}
                    <div className="mb-8">
                      <div className="text-base font-semibold mb-2">Driver License</div>
                      <InputField label="Driver License" value={licenseNumber} onChange={e => { setLicenseNumber(e.target.value); setHasChanges(prev => ({ ...prev, documents: true })); }} placeholder="Enter License Number" required />
                      <div className="text-sm font-medium mb-2 mt-4">Uploaded Documents</div>
                      <div className="flex flex-wrap gap-4 mb-2">
                        {/* License Front */}
                        {(licenseFrontPreview || fetchedUser?.document?.dl?.frontUrl) && (
                          <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                            <div className="flex items-center gap-2">
                              <FiDownload className="text-red-500 text-2xl" />
                              <span className="font-medium text-sm">Front</span>
                              <span className="ml-auto text-xs text-gray-400">{licenseFrontPreview?.size || (fetchedUser?.document?.dl?.frontUrl ? '' : '92 kb')}</span>
                            </div>
                            {(licenseFrontPreview || fetchedUser?.document?.dl?.frontUrl) && (
                              <div className="flex flex-col items-center mt-2">
                                {licenseFrontPreview ? (
                                  licenseFrontPreview.isPdf ? (
                                    <FiDownload className="text-red-500 text-4xl mb-1" />
                                  ) : (
                                    <img src={licenseFrontPreview.url} alt="License Front Preview" className="w-16 h-16 object-cover rounded border mb-1" />
                                  )
                                ) : (
                                  <img src={fetchedUser.document.dl.frontUrl} alt="License Front" className="w-16 h-16 object-cover rounded border mb-1" />
                                )}
                                <span className="text-xs text-gray-500">{licenseFrontPreview?.name || ''}</span>
                              </div>
                            )}
                            <div className="flex gap-2 mt-2">
                              {/* <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeleteLicenseFront}><FiTrash2 /></button> */}
                              <button className="text-blue-500 hover:text-blue-700" title="Download" onClick={() => setPreviewModal({ open: true, url: licenseFrontPreview?.url || fetchedUser?.document?.dl?.frontUrl, type: licenseFrontPreview?.isPdf ? 'pdf' : 'image' })}><FiDownload /></button>
                              <button className="text-gray-500 hover:text-gray-700" title="View" onClick={() => setPreviewModal({ open: true, url: licenseFrontPreview?.url || fetchedUser?.document?.dl?.frontUrl, type: licenseFrontPreview?.isPdf ? 'pdf' : 'image' })}><FiEye /></button>
                            </div>
                          </div>
                        )}
                        {/* License Back */}
                        {(licenseBackPreview || fetchedUser?.document?.dl?.backUrl) && (
                          <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                            <div className="flex items-center gap-2">
                              <FiDownload className="text-red-500 text-2xl" />
                              <span className="font-medium text-sm">Back</span>
                              <span className="ml-auto text-xs text-gray-400">{licenseBackPreview?.size || (fetchedUser?.document?.dl?.backUrl ? '' : '92 kb')}</span>
                            </div>
                            {(licenseBackPreview || fetchedUser?.document?.dl?.backUrl) && (
                              <div className="flex flex-col items-center mt-2">
                                {licenseBackPreview ? (
                                  licenseBackPreview.isPdf ? (
                                    <FiDownload className="text-red-500 text-4xl mb-1" />
                                  ) : (
                                    <img src={licenseBackPreview.url} alt="License Back Preview" className="w-16 h-16 object-cover rounded border mb-1" />
                                  )
                                ) : (
                                  <img src={fetchedUser.document.dl.backUrl} alt="License Back" className="w-16 h-16 object-cover rounded border mb-1" />
                                )}
                                <span className="text-xs text-gray-500">{licenseBackPreview?.name || ''}</span>
                              </div>
                            )}
                            <div className="flex gap-2 mt-2">
                              {/* <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeleteLicenseBack}><FiTrash2 /></button> */}
                              <button className="text-blue-500 hover:text-blue-700" title="Download" onClick={() => setPreviewModal({ open: true, url: licenseBackPreview?.url || fetchedUser?.document?.dl?.backUrl, type: licenseBackPreview?.isPdf ? 'pdf' : 'image' })}><FiDownload /></button>
                              <button className="text-gray-500 hover:text-gray-700" title="View" onClick={() => setPreviewModal({ open: true, url: licenseBackPreview?.url || fetchedUser?.document?.dl?.backUrl, type: licenseBackPreview?.isPdf ? 'pdf' : 'image' })}><FiEye /></button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer"
                        onClick={() => licenseFrontInputRef.current?.click()}>
                        <FiDownload className="mb-1" /> Upload License Front
                        <input type="file" ref={licenseFrontInputRef} className="hidden" onChange={handleLicenseFrontFileChange} />
                      </div>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer"
                        onClick={() => licenseBackInputRef.current?.click()}>
                        <FiDownload className="mb-1" /> Upload License Back
                        <input type="file" ref={licenseBackInputRef} className="hidden" onChange={handleLicenseBackFileChange} />
                      </div>
                    </div>
                    {/* Bank Documents */}
                    <div className="flex mt-8 space-x-4">
                      {fetchedUser?.status === 'verified' ? (
                        <Button variant="danger" onClick={handleDeactivate} disabled={saving || isRejecting}>
                          {isRejecting ? 'Deactivating...' : 'Deactivate'}
                        </Button>
                      ) : (
                        <Button variant="danger" onClick={handleReject} disabled={saving || isRejecting}>
                          {isRejecting ? 'Rejecting...' : 'Reject'}
                        </Button>
                      )}
                      <Button variant="primary" onClick={handleSaveAndVerify} disabled={saving || isRejecting}>
                        {saving ? 'Saving...' : 'Save & Verify'}
                      </Button>
                    </div>
                  </div>
                )}
                 {activeTab === 3 && (
                  <div>
                    <ComingSoon title='Vehicle Details' message="We're working hard to bring you this feature. Please check back later!" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Modal open={!!previewModal?.open} onClose={() => setPreviewModal(null)}>
        {previewModal?.type === 'pdf' ? (
          <iframe src={previewModal.url} title="PDF Preview" className="w-[80vw] h-[80vh]" />
        ) : (
          <img src={previewModal?.url} alt="Document Preview" className="max-w-[80vw] max-h-[80vh] rounded-lg" />
        )}
      </Modal>

      {/* Rejection Confirmation Modal */}
      <Modal open={showRejectModal} onClose={() => setShowRejectModal(false)}>
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Confirm Rejection</h3>
          <p className="mb-4 text-gray-700">
            Are you sure you want to reject this user?
          </p>
          
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Rejection Reason (Optional)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full rounded-lg border border-gray-300 p-3 text-sm"
              rows={4}
            />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowRejectModal(false)}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmReject}
              disabled={isRejecting}
            >
              {isRejecting ? 'Rejecting...' : 'Confirm Reject'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Deactivate Confirmation Modal */}
      <Modal open={showDeactivateModal} onClose={() => setShowDeactivateModal(false)}>
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Confirm Deactivation</h3>
          <p className="mb-4 text-gray-700">
            Are you sure you want to deactivate this user?
          </p>
          
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Deactivation Reason (Optional)
            </label>
            <textarea
              value={deactivateReason}
              onChange={(e) => setDeactivateReason(e.target.value)}
              placeholder="Enter reason for deactivation..."
              className="w-full rounded-lg border border-gray-300 p-3 text-sm"
              rows={4}
            />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeactivateModal(false)}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmDeactivate}
              disabled={isRejecting}
            >
              {isRejecting ? 'Deactivating...' : 'Confirm Deactivate'}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default AddUser;