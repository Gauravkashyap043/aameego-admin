import React, { useState, useEffect, useRef } from 'react';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Layout from '../components/Layout';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiTrash2, FiDownload, FiEye } from 'react-icons/fi';
import Modal from '../components/Modal';
import ComingSoon from '../components/ComingSoon';

const TABS = [
  'Personal information',
  'Bank Details',
  'Vehicle Details',
  'Documents',
];

const AddUser: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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
    if (!address.trim()) {
      setError('Address is required');
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
        setDob(userData.document?.aadhaar?.ocrFront?.dob || '');
        setGender(userData.document?.aadhaar?.ocrFront?.gender || '');
        setFather(userData.document?.aadhaar?.ocrFront?.rawText?.split(',')[0] || '');
        setAddress(userData.document?.aadhaar?.ocrFront?.rawText || '');
        setCity(''); // Map city if available
        setPin(''); // Map pin if available
        setState(''); // Map state if available
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
  const handleSavePersonalInfo = async () => {
    if (!id) return;

    if (!validatePersonalInfo()) {
      return;
    }

    setSaving(true);
    try {
      const personalData = {
        name: fullName,
        // Add other personal fields as needed
      };

      await api.put(`/user/${id}`, personalData);

      // Update document with personal info
      const documentData = {
        aadhaar: {
          ocrFront: {
            name: fullName,
            dob: dob,
            gender: gender,
            aadharNumber: aadhaarNumber,
            rawText: `${father}, ${address}, ${city}, ${state} - ${pin}`
          }
        }
      };

      await api.put(`/document/user/${id}`, documentData);

      // Upload any files that were selected
      await uploadFiles();

      setHasChanges(prev => ({ ...prev, personal: false }));
      setSuccessMessage('Personal information saved successfully!');
      setTimeout(() => {
        setSuccessMessage('');
        setActiveTab(1); // Move to next tab
      }, 2000);
    } catch (error) {
      console.error('Error saving personal info:', error);
      setError('Failed to save personal information');
    } finally {
      setSaving(false);
    }
  };

  // Save bank details
  const handleSaveBankDetails = async () => {
    if (!id) return;

    if (!validateBankDetails()) {
      return;
    }

    setSaving(true);
    try {
      const bankData = {
        bank: {
          details: {
            bankName: bankName,
            holderName: bankFullName,
            accountNumber: accountNumber,
            ifsc: ifsc
          }
        }
      };

      await api.put(`/document/user/${id}`, bankData);

      // Upload any bank files that were selected
      await uploadFiles();

      setHasChanges(prev => ({ ...prev, bank: false }));
      setSuccessMessage('Bank details saved successfully!');
      setTimeout(() => {
        setSuccessMessage('');
        setActiveTab(2); // Move to next tab
      }, 2000);
    } catch (error) {
      console.error('Error saving bank details:', error);
      setError('Failed to save bank details');
    } finally {
      setSaving(false);
    }
  };

  // Save vehicle details
 

  // Save and verify all documents
  const handleSaveAndVerify = async () => {
    if (!id) return;

    if (!validateDocuments()) {
      return;
    }

    setSaving(true);
    try {
      // Prepare document data and verification status
      const documentData = {
        aadhaar: {
          ocrFront: {
            name: fullName,
            dob: dob,
            gender: gender,
            aadharNumber: aadhaarNumber,
            rawText: `${father}, ${address}, ${city}, ${state} - ${pin}`
          }
        },
        pan: {
          ocr: {
            panNumber: panNumber
          }
        },
        dl: {
          ocrFront: {
            dlNumber: licenseNumber
          }
        },
        bank: {
          details: {
            bankName: bankName,
            holderName: bankFullName,
            accountNumber: accountNumber,
            ifsc: ifsc
          }
        },
        isVerified: true
      };

      // Update document data and verification status in one call
      await api.put(`/document/user/${id}`, documentData);

      // Upload any files that were selected
      await uploadFiles();

      setHasChanges(prev => ({ ...prev, documents: false }));
      setError('');
      setSuccessMessage('User verified successfully!');
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/user-management'); // Redirect to user list
      }, 2000);
    } catch (error) {
      console.error('Error saving and verifying:', error);
      setError('Failed to save and verify documents');
    } finally {
      setSaving(false);
    }
  };

  // Handle file uploads
  const uploadFiles = async () => {
    const formData = new FormData();
    
    if (aadhaarFile) formData.append('aadhaarFront', aadhaarFile);
    if (panFile) formData.append('pan', panFile);
    if (licenseFrontFile) formData.append('dlFront', licenseFrontFile);
    if (licenseBackFile) formData.append('dlBack', licenseBackFile);
    if (passbookFile) formData.append('passbook', passbookFile);
    if (chequeFile) formData.append('cheque', chequeFile);
    
    if (formData.has('aadhaarFront') || formData.has('pan') || formData.has('dlFront') || 
        formData.has('dlBack') || formData.has('passbook') || formData.has('cheque')) {
      try {
        await api.post('/document/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } catch (error) {
        console.error('Error uploading files:', error);
        setError('Failed to upload some files');
      }
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!id) return;

    try {
      // Only use document endpoint for rejection
      await api.put(`/document/user/${id}`, { isVerified: false });
      setSuccessMessage('User rejected successfully!');
      setTimeout(() => {
        setSuccessMessage('');
        navigate('/user-management');
      }, 2000);
    } catch (error) {
      console.error('Error rejecting user:', error);
      setError('Failed to reject user');
    }
  };

  // File deletion handlers
  const handleDeleteAadhaar = () => {
    setAadhaarFile(null);
    setAadhaarPreview(null);
    setHasChanges(prev => ({ ...prev, documents: true }));
  };

  const handleDeletePan = () => {
    setPanFile(null);
    setPanPreview(null);
    setHasChanges(prev => ({ ...prev, documents: true }));
  };

  const handleDeleteLicenseFront = () => {
    setLicenseFrontFile(null);
    setLicenseFrontPreview(null);
    setHasChanges(prev => ({ ...prev, documents: true }));
  };

  const handleDeleteLicenseBack = () => {
    setLicenseBackFile(null);
    setLicenseBackPreview(null);
    setHasChanges(prev => ({ ...prev, documents: true }));
  };

  // Bank document deletion handlers
  const handleDeletePassbook = () => {
    setPassbookFile(null);
    setPassbookPreview(null);
    setHasChanges(prev => ({ ...prev, bank: true }));
  };

  const handleDeleteCheque = () => {
    setChequeFile(null);
    setChequePreview(null);
    setHasChanges(prev => ({ ...prev, bank: true }));
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
            ) : successMessage ? (
              <div className="text-center text-green-600 mb-4">{successMessage}</div>
            ) : null}
            {!loading && (
              <>
                {activeTab === 0 && (
                  <div>
                    <div className="text-xl font-semibold mb-4">Personal Details</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputField label="Full Name" value={fullName} onChange={e => { setFullName(e.target.value); setHasChanges(prev => ({ ...prev, personal: true })); }} placeholder="Enter full name" />
                      <InputField label="Phone Number" value={phone} onChange={e => { setPhone(e.target.value); setHasChanges(prev => ({ ...prev, personal: true })); }} placeholder="Enter phone number" />
                      <InputField label="Date Of Birth" value={dob} onChange={e => { setDob(e.target.value); setHasChanges(prev => ({ ...prev, personal: true })); }} type="date" />
                      <InputField label="Gender" value={gender} onChange={e => { setGender(e.target.value); setHasChanges(prev => ({ ...prev, personal: true })); }} type="select" options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]} />
                      <InputField label="Fathers Name" value={father} onChange={e => { setFather(e.target.value); setHasChanges(prev => ({ ...prev, personal: true })); }} placeholder="Enter father's name" />
                      <InputField label="City/District" value={city} onChange={e => { setCity(e.target.value); setHasChanges(prev => ({ ...prev, personal: true })); }} placeholder="Enter city/district" />
                      <InputField label="Address" value={address} onChange={e => { setAddress(e.target.value); setHasChanges(prev => ({ ...prev, personal: true })); }} type="textarea" placeholder="Enter address" className="md:col-span-3" />
                      <InputField label="PIN Code" value={pin} onChange={e => { setPin(e.target.value); setHasChanges(prev => ({ ...prev, personal: true })); }} placeholder="Enter PIN code" />
                      <InputField label="State" value={state} onChange={e => { setState(e.target.value); setHasChanges(prev => ({ ...prev, personal: true })); }} placeholder="Enter state" />
                    </div>
                    <div className="flex mt-8 space-x-4">
                      <Button variant="danger" onClick={handleReject} disabled={saving}>Reject</Button>
                      <Button variant="primary" onClick={handleSavePersonalInfo} disabled={saving}>
                        {saving ? 'Saving...' : 'Save & Next'}
                      </Button>
                    </div>
                  </div>
                )}
                {activeTab === 1 && (
                  <div>
                    <div className="text-xl font-semibold mb-4">Bank Details</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputField label="Bank Name" value={bankName} onChange={e => { setBankName(e.target.value); setHasChanges(prev => ({ ...prev, bank: true })); }} placeholder="Enter bank name" />
                      <InputField label="Full Name" value={bankFullName} onChange={e => { setBankFullName(e.target.value); setHasChanges(prev => ({ ...prev, bank: true })); }} placeholder="Enter account holder name" />
                      <InputField label="Account Number" value={accountNumber} onChange={e => { setAccountNumber(e.target.value); setHasChanges(prev => ({ ...prev, bank: true })); }} placeholder="Enter account number" />
                      <InputField label="Confirm Account Number" value={confirmAccountNumber} onChange={e => { setConfirmAccountNumber(e.target.value); setHasChanges(prev => ({ ...prev, bank: true })); }} placeholder="Re-enter account number" />
                      <InputField label="IFSC Code" value={ifsc} onChange={e => { setIfsc(e.target.value); setHasChanges(prev => ({ ...prev, bank: true })); }} placeholder="Enter IFSC code" />
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
                              <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeletePassbook}><FiTrash2 /></button>
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
                              <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeleteCheque}><FiTrash2 /></button>
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
                      <Button variant="danger" onClick={handleReject} disabled={saving}>Reject</Button>
                      <Button variant="primary" onClick={handleSaveBankDetails} disabled={saving}>
                        {saving ? 'Saving...' : 'Save & Next'}
                      </Button>
                    </div>
                  </div>
                )}
                {activeTab === 2 && (
                  <div>
                    <ComingSoon title='Vehicle Details' message="We're working hard to bring you this feature. Please check back later!" />
                  </div>
                )}
                {activeTab === 3 && (
                  <div>
                    {/* Aadhaar Card */}
                    <div className="mb-8">
                      <div className="text-base font-semibold mb-2">Aadhaar Card</div>
                      <InputField label="Aadhaar Number" value={aadhaarNumber} onChange={e => { setAadhaarNumber(e.target.value); setHasChanges(prev => ({ ...prev, documents: true })); }} placeholder="Enter Aadhaar Number" />
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
                              <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeleteAadhaar}><FiTrash2 /></button>
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
                              <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeleteAadhaar}><FiTrash2 /></button>
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
                      <InputField label="PAN Card" value={panNumber} onChange={e => { setPanNumber(e.target.value); setHasChanges(prev => ({ ...prev, documents: true })); }} placeholder="Enter PAN Number" />
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
                              <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeletePan}><FiTrash2 /></button>
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
                      <InputField label="Driver License" value={licenseNumber} onChange={e => { setLicenseNumber(e.target.value); setHasChanges(prev => ({ ...prev, documents: true })); }} placeholder="Enter License Number" />
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
                              <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeleteLicenseFront}><FiTrash2 /></button>
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
                              <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeleteLicenseBack}><FiTrash2 /></button>
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
                      <Button variant="danger" onClick={handleReject} disabled={saving}>Reject</Button>
                      <Button variant="primary" onClick={handleSaveAndVerify} disabled={saving}>
                        {saving ? 'Saving...' : 'Save & Verify'}
                      </Button>
                    </div>
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
    </Layout>
  );
};

export default AddUser;