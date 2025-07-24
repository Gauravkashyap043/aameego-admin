import React, { useState, useEffect, useRef } from 'react';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Layout from '../components/Layout';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import FileInput from '../components/FileInput';
import { FiTrash2, FiDownload, FiEye } from 'react-icons/fi';
import Modal from '../components/Modal';

const TABS = [
  'Personal information',
  'Bank Details',
  'Vehicle Details',
  'Documents',
];

const AddUser: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    }
  };

  // Document upload handler
  const handleDocumentUpload = async (type: string) => {
    const formData = new FormData();
    if (type === 'aadhaar' && aadhaarFile) formData.append('aadhaar', aadhaarFile);
    if (type === 'pan' && panFile) formData.append('pan', panFile);
    if (type === 'licenseFront' && licenseFrontFile) formData.append('licenseFront', licenseFrontFile);
    if (type === 'licenseBack' && licenseBackFile) formData.append('licenseBack', licenseBackFile);
    try {
      await api.post(`/user/${id}/upload-doc`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      alert('Document uploaded!');
    } catch (err) {
      alert('Failed to upload document');
    }
  };

  // Document preview renderer
  const renderFilePreview = (file: any, label: string) => {
    if (!file) return null;
    const isPdf = file.url?.toLowerCase().endsWith('.pdf');
    return (
      <div className="flex items-center gap-2 mt-2">
        {isPdf ? (
          <>
            <span title="PDF" className="text-red-500"><FiEye size={24} /></span>
            <a href={file.url} download target="_blank" rel="noopener noreferrer" className="text-blue-600 underline cursor-pointer flex items-center gap-1"><FiDownload />Download PDF</a>
          </>
        ) : (
          <>
            <img src={file.url} alt={label + ' Preview'} className="w-16 h-16 object-cover rounded border" />
            <a href={file.url} download target="_blank" rel="noopener noreferrer" className="text-blue-600 underline cursor-pointer flex items-center gap-1"><FiDownload />Download</a>
            <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-indigo-600 flex items-center gap-1"><FiEye />View</a>
          </>
        )}
        <button className="text-red-500 hover:text-red-700 ml-2" title="Delete"><FiTrash2 /></button>
        <span className="text-xs text-gray-500">{file.name}</span>
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#f6f7ff] flex flex-col">
        <div className="flex-1 p-8">
          {/* Breadcrumb and Title */}
          <div className="mb-6">
            <div className="text-sm mt-1">
              <span className="text-[#3B36FF] font-medium cursor-pointer">User List</span>
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
                onClick={() => setActiveTab(idx)}
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
              <div className="text-center text-red-500">{error}</div>
            ) : (
              <>
                {activeTab === 0 && (
                  <div>
                    <div className="text-xl font-semibold mb-4">Personal Details</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputField label="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter full name" />
                      <InputField label="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter phone number" />
                      <InputField label="Date Of Birth" value={dob} onChange={e => setDob(e.target.value)} type="date" />
                      <InputField label="Gender" value={gender} onChange={e => setGender(e.target.value)} type="select" options={[{ label: 'Male', value: 'male' }, { label: 'Female', value: 'female' }]} />
                      <InputField label="Fathers Name" value={father} onChange={e => setFather(e.target.value)} placeholder="Enter father's name" />
                      <InputField label="City/District" value={city} onChange={e => setCity(e.target.value)} placeholder="Enter city/district" />
                      <InputField label="Address" value={address} onChange={e => setAddress(e.target.value)} type="textarea" placeholder="Enter address" className="md:col-span-3" />
                      <InputField label="PIN Code" value={pin} onChange={e => setPin(e.target.value)} placeholder="Enter PIN code" />
                      <InputField label="State" value={state} onChange={e => setState(e.target.value)} placeholder="Enter state" />
                    </div>
                    <div className="flex mt-8 space-x-4">
                      <Button variant="danger">Reject</Button>
                      <Button variant="primary">Save & Next</Button>
                    </div>
                  </div>
                )}
                {activeTab === 1 && (
                  <div>
                    <div className="text-xl font-semibold mb-4">Bank Details</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputField label="Bank Name" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="Enter bank name" />
                      <InputField label="Full Name" value={bankFullName} onChange={e => setBankFullName(e.target.value)} placeholder="Enter account holder name" />
                      <InputField label="Account Number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="Enter account number" />
                      <InputField label="Confirm Account Number" value={confirmAccountNumber} onChange={e => setConfirmAccountNumber(e.target.value)} placeholder="Re-enter account number" />
                      <InputField label="IFSC Code" value={ifsc} onChange={e => setIfsc(e.target.value)} placeholder="Enter IFSC code" />
                    </div>
                    {/* Uploaded Documents Placeholder */}
                    <div className="mt-8">
                      <div className="text-lg font-medium mb-2">Uploaded Documents</div>
                      <div className="flex space-x-4">
                        <div className="bg-gray-100 rounded-lg p-4 w-60 h-28 flex flex-col items-center justify-center">Bank Passbook</div>
                        <div className="bg-gray-100 rounded-lg p-4 w-60 h-28 flex flex-col items-center justify-center">Cancelled Cheque</div>
                      </div>
                      <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
                        <span className="text-gray-400">Upload Documents</span>
                      </div>
                    </div>
                    <div className="flex mt-8 space-x-4">
                      <Button variant="danger">Reject</Button>
                      <Button variant="primary">Save & Next</Button>
                    </div>
                  </div>
                )}
                {activeTab === 2 && (
                  <div>
                    <div className="text-xl font-semibold mb-4">Vehicle Details</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <InputField label="Vehicle Number" value="" onChange={() => { }} placeholder="Enter vehicle number" />
                      <InputField label="Vehicle Type" value="" onChange={() => { }} placeholder="Enter vehicle type" />
                      <InputField label="Model" value="" onChange={() => { }} placeholder="Enter model" />
                      <InputField label="Color" value="" onChange={() => { }} placeholder="Enter color" />
                    </div>
                    <div className="flex mt-8 space-x-4">
                      <Button variant="danger">Reject</Button>
                      <Button variant="primary">Save & Next</Button>
                    </div>
                  </div>
                )}
                {activeTab === 3 && (
                  <div>
                    {/* Aadhaar Card */}
                    <div className="mb-8">
                      <div className="text-base font-semibold mb-2">Aadhaar Card</div>
                      <InputField label="Aadhaar Number" value={aadhaarNumber} onChange={e => setAadhaarNumber(e.target.value)} placeholder="Enter Aadhaar Number" />
                      <div className="text-sm font-medium mb-2 mt-4">Uploaded Documents</div>
                      <div className="flex flex-wrap gap-4 mb-2">
                        {/* Aadhaar Front */}
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
                            <button className="text-red-500 hover:text-red-700" title="Delete"><FiTrash2 /></button>
                            <button className="text-blue-500 hover:text-blue-700" title="Download" onClick={() => setPreviewModal({ open: true, url: aadhaarPreview?.url || fetchedUser?.document?.aadhaar?.frontUrl, type: aadhaarPreview?.isPdf ? 'pdf' : 'image' })}><FiDownload /></button>
                            <button className="text-gray-500 hover:text-gray-700" title="View" onClick={() => setPreviewModal({ open: true, url: aadhaarPreview?.url || fetchedUser?.document?.aadhaar?.frontUrl, type: aadhaarPreview?.isPdf ? 'pdf' : 'image' })}><FiEye /></button>
                          </div>
                        </div>
                        {/* Aadhaar Back */}
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
                            <button className="text-red-500 hover:text-red-700" title="Delete"><FiTrash2 /></button>
                            <button className="text-blue-500 hover:text-blue-700" title="Download" onClick={() => setPreviewModal({ open: true, url: aadhaarPreview?.url || fetchedUser?.document?.aadhaar?.backUrl, type: aadhaarPreview?.isPdf ? 'pdf' : 'image' })}><FiDownload /></button>
                            <button className="text-gray-500 hover:text-gray-700" title="View" onClick={() => setPreviewModal({ open: true, url: aadhaarPreview?.url || fetchedUser?.document?.aadhaar?.backUrl, type: aadhaarPreview?.isPdf ? 'pdf' : 'image' })}><FiEye /></button>
                          </div>
                        </div>
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
                      <InputField label="PAN Card" value={panNumber} onChange={e => setPanNumber(e.target.value)} placeholder="Enter PAN Number" />
                      <div className="text-sm font-medium mb-2 mt-4">Uploaded Documents</div>
                      <div className="flex flex-wrap gap-4 mb-2">
                        <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                          <div className="flex items-center gap-2">
                            <FiDownload className="text-red-500 text-2xl" />
                            <span className="font-medium text-sm">Front</span>
                            <span className="ml-auto text-xs text-gray-400">{panPreview?.size || (fetchedUser?.document?.pan?.frontUrl ? '' : '92 kb')}</span>
                          </div>
                          {(panPreview || fetchedUser?.document?.pan?.frontUrl) && (
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
                            <button className="text-red-500 hover:text-red-700" title="Delete"><FiTrash2 /></button>
                            <button className="text-blue-500 hover:text-blue-700" title="Download" onClick={() => setPreviewModal({ open: true, url: panPreview?.url || fetchedUser?.document?.pan?.frontUrl, type: panPreview?.isPdf ? 'pdf' : 'image' })}><FiDownload /></button>
                            <button className="text-gray-500 hover:text-gray-700" title="View" onClick={() => setPreviewModal({ open: true, url: panPreview?.url || fetchedUser?.document?.pan?.frontUrl, type: panPreview?.isPdf ? 'pdf' : 'image' })}><FiEye /></button>
                          </div>
                        </div>
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
                      <InputField label="Driver License" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder="Enter License Number" />
                      <div className="text-sm font-medium mb-2 mt-4">Uploaded Documents</div>
                      <div className="flex flex-wrap gap-4 mb-2">
                        {/* License Front */}
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
                            <button className="text-red-500 hover:text-red-700" title="Delete"><FiTrash2 /></button>
                            <button className="text-blue-500 hover:text-blue-700" title="Download" onClick={() => setPreviewModal({ open: true, url: licenseFrontPreview?.url || fetchedUser?.document?.dl?.frontUrl, type: licenseFrontPreview?.isPdf ? 'pdf' : 'image' })}><FiDownload /></button>
                            <button className="text-gray-500 hover:text-gray-700" title="View" onClick={() => setPreviewModal({ open: true, url: licenseFrontPreview?.url || fetchedUser?.document?.dl?.frontUrl, type: licenseFrontPreview?.isPdf ? 'pdf' : 'image' })}><FiEye /></button>
                          </div>
                        </div>
                        {/* License Back */}
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
                            <button className="text-red-500 hover:text-red-700" title="Delete"><FiTrash2 /></button>
                            <button className="text-blue-500 hover:text-blue-700" title="Download" onClick={() => setPreviewModal({ open: true, url: licenseBackPreview?.url || fetchedUser?.document?.dl?.backUrl, type: licenseBackPreview?.isPdf ? 'pdf' : 'image' })}><FiDownload /></button>
                            <button className="text-gray-500 hover:text-gray-700" title="View" onClick={() => setPreviewModal({ open: true, url: licenseBackPreview?.url || fetchedUser?.document?.dl?.backUrl, type: licenseBackPreview?.isPdf ? 'pdf' : 'image' })}><FiEye /></button>
                          </div>
                        </div>
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
                    <div className="flex mt-8 space-x-4">
                      <Button variant="danger">Reject</Button>
                      <Button variant="primary">Save & Verify</Button>
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