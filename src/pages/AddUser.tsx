import React, { useState, useEffect } from 'react';
import InputField from '../components/InputField';
import Button from '../components/Button';
import Layout from '../components/Layout';
import { useParams } from 'react-router-dom';
import api from '../services/api';

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
      })
      .catch(() => {
        setError('Failed to fetch user details');
      })
      .finally(() => setLoading(false));
  }, [id]);

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
                    <div className="mb-8">
                      <div className="text-base font-semibold mb-2">Aadhaar Card</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
                        <InputField label="Aadhaar Number" value={aadhaarNumber} onChange={e => setAadhaarNumber(e.target.value)} placeholder="Enter Aadhaar Number" />
                      </div>
                      <div className="text-sm font-medium mb-2">Uploaded Documents</div>
                      <div className="flex flex-wrap gap-4 mb-2">
                        <div className="bg-white border rounded-lg p-4 w-60 flex flex-col gap-2 relative">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">📄</span>
                            <span className="font-medium text-sm">Bank Passbook</span>
                            <span className="ml-auto text-xs text-gray-400">92 kb</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button className="text-red-500 hover:text-red-700" title="Delete"><span>🗑️</span></button>
                            <button className="text-blue-500 hover:text-blue-700" title="Download"><span>⬇️</span></button>
                            <button className="text-gray-500 hover:text-gray-700" title="View"><span>👁️</span></button>
                          </div>
                        </div>
                        <div className="bg-white border rounded-lg p-4 w-60 flex flex-col gap-2 relative">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">📄</span>
                            <span className="font-medium text-sm">Cancelled Cheque</span>
                            <span className="ml-auto text-xs text-gray-400">92 kb</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button className="text-red-500 hover:text-red-700" title="Delete"><span>🗑️</span></button>
                            <button className="text-blue-500 hover:text-blue-700" title="Download"><span>⬇️</span></button>
                            <button className="text-gray-500 hover:text-gray-700" title="View"><span>👁️</span></button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center">
                        <span className="text-gray-400">Upload Documents</span>
                      </div>
                    </div>
                    <div className="mb-8">
                      <div className="text-base font-semibold mb-2">Pan Card</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
                        <InputField label="PAN Card" value={panNumber} onChange={e => setPanNumber(e.target.value)} placeholder="Enter PAN Number" />
                      </div>
                      <div className="text-sm font-medium mb-2">Uploaded Documents</div>
                      <div className="flex flex-wrap gap-4 mb-2">
                        <div className="bg-white border rounded-lg p-4 w-60 flex flex-col gap-2 relative">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">📄</span>
                            <span className="font-medium text-sm">PAN Card</span>
                            <span className="ml-auto text-xs text-gray-400">92 kb</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button className="text-red-500 hover:text-red-700" title="Delete"><span>🗑️</span></button>
                            <button className="text-blue-500 hover:text-blue-700" title="Download"><span>⬇️</span></button>
                            <button className="text-gray-500 hover:text-gray-700" title="View"><span>👁️</span></button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center">
                        <span className="text-gray-400">Upload Documents</span>
                      </div>
                    </div>
                    <div className="mb-8">
                      <div className="text-base font-semibold mb-2">Driver License</div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
                        <InputField label="Driver License" value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder="Enter License Number" />
                      </div>
                      <div className="text-sm font-medium mb-2">Uploaded Documents</div>
                      <div className="flex flex-wrap gap-4 mb-2">
                        <div className="bg-white border rounded-lg p-4 w-60 flex flex-col gap-2 relative">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">📄</span>
                            <span className="font-medium text-sm">Front</span>
                            <span className="ml-auto text-xs text-gray-400">92 kb</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button className="text-red-500 hover:text-red-700" title="Delete"><span>🗑️</span></button>
                            <button className="text-blue-500 hover:text-blue-700" title="Download"><span>⬇️</span></button>
                            <button className="text-gray-500 hover:text-gray-700" title="View"><span>👁️</span></button>
                          </div>
                        </div>
                        <div className="bg-white border rounded-lg p-4 w-60 flex flex-col gap-2 relative">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">📄</span>
                            <span className="font-medium text-sm">Back</span>
                            <span className="ml-auto text-xs text-gray-400">92 kb</span>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button className="text-red-500 hover:text-red-700" title="Delete"><span>🗑️</span></button>
                            <button className="text-blue-500 hover:text-blue-700" title="Download"><span>⬇️</span></button>
                            <button className="text-gray-500 hover:text-gray-700" title="View"><span>👁️</span></button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center">
                        <span className="text-gray-400">Upload Documents</span>
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
    </Layout>
  );
};

export default AddUser;