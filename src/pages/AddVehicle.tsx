import React, { useState } from 'react';
import Layout from '../components/Layout';
import InputField from '../components/InputField';
import Button from '../components/Button';
import {
  useCities,
  useHubs,
  useVehicleTypes,
  useOEMs,
  useVehicleModels,
  useBatteryTypes,
  useVehicleOwnerships,
  useVehicleVendors,
} from '../hooks/vehicleMisc';
import { useRidersAndSupervisors } from '../hooks/useUsers';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAddVehicle } from '../hooks/useVehicles';
import api from '../services/api';

const vehicleTabs = [
  'Vehicle Details',
  'Vehicle Insurance & Documents',
  'QR Code'
];


const FileInput: React.FC<{
  label: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file?: File | null;
}> = ({ label, name, onChange, file }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <div className="flex items-center gap-3">
      <label className="cursor-pointer bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-lg text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors">
        {file ? 'Replace File' : 'Upload File'}
        <input
          type="file"
          name={name}
          onChange={onChange}
          className="hidden"
        />
      </label>
      {file && (
        <span className="text-xs text-gray-600 truncate max-w-[160px]">{file.name}</span>
      )}
    </div>
  </div>
);

const AddVehicle: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [form, setForm] = useState({
    city: '',
    hub: '',
    supervisor: '',
    vehicleType: '',
    oem: '',
    vehicleModel: '',
    vehicleModelVersion: '',
    batteryType: '',
    batteryCapacity: '',
    batteryNumber: '',
    chassisNumber: '',
    vehicleRCNumber: '',
    rcRegistrationDate: '',
    rcExpiryDate: '',
    fitnessCertificateNumber: '',
    manufacturingYear: '',
    fitnessCertificateExpDate: '',
    numberPlateStatus: '',
    vehicleNumber: '',
    invoiceNumber: '',
    invoiceAmount: '',
    invoiceDate: '',
    vehicleOwnership: '',
    vehicleVendor: '',
    deliveryDate: '',
  });
  const [insuranceForm, setInsuranceForm] = useState({
    insuranceNumber: '',
    validTill: '',
    provider: '',
    type: '',
    rcDocumentNumber: '',
    fitnessCertificateDocumentNumber: '',
    invoiceDocumentNumber: '',
    insuranceDocumentNumber: '',
  });
  const [insuranceFiles, setInsuranceFiles] = useState({
    rc: null as File | null,
    fitnessCertificate: null as File | null,
    invoice: null as File | null,
    insurance: null as File | null,
  });
  const [insuranceLoading, setInsuranceLoading] = useState(false);

  const { data: cities = [] } = useCities();
  const { data: hubs = [] } = useHubs();
  const { data: vehicleTypes = [] } = useVehicleTypes();
  const { data: oems = [] } = useOEMs();
  const { data: vehicleModels = [] } = useVehicleModels();
  const { data: batteryTypes = [] } = useBatteryTypes();
  const { data: vehicleOwnerships = [] } = useVehicleOwnerships();
  const { data: vehicleVendors = [] } = useVehicleVendors();
  const { data: ridersAndSupervisors = { supervisors: [] } } = useRidersAndSupervisors();
  const supervisors = ridersAndSupervisors.supervisors || [];

  const addVehicleMutation = useAddVehicle();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await addVehicleMutation.mutateAsync(form);
      const newVehicleId = response.data?._id || response.data?.id || response?.data?.vehicle?._id;
      setVehicleId(newVehicleId);
      toast.success('Vehicle added successfully!');
      setActiveTab(1); // Move to Insurance Details tab
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add vehicle');
    }
  };

  const handleInsuranceInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setInsuranceForm({ ...insuranceForm, [e.target.name]: e.target.value });
  };

  const handleInsuranceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setInsuranceFiles(prev => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleInsuranceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId) {
      toast.error('Vehicle ID is missing. Please add vehicle first.');
      return;
    }
    try {
      setInsuranceLoading(true);
      const formData = new FormData();
      formData.append('vehicle', vehicleId);
      formData.append('insuranceNumber', insuranceForm.insuranceNumber);
      formData.append('validTill', insuranceForm.validTill);
      formData.append('provider', insuranceForm.provider);
      formData.append('type', insuranceForm.type);
      if (insuranceForm.rcDocumentNumber) formData.append('rcDocumentNumber', insuranceForm.rcDocumentNumber);
      if (insuranceForm.fitnessCertificateDocumentNumber) formData.append('fitnessCertificateDocumentNumber', insuranceForm.fitnessCertificateDocumentNumber);
      if (insuranceForm.invoiceDocumentNumber) formData.append('invoiceDocumentNumber', insuranceForm.invoiceDocumentNumber);
      if (insuranceForm.insuranceDocumentNumber) formData.append('insuranceDocumentNumber', insuranceForm.insuranceDocumentNumber);
      if (insuranceFiles.rc) formData.append('rc', insuranceFiles.rc);
      if (insuranceFiles.fitnessCertificate) formData.append('fitnessCertificate', insuranceFiles.fitnessCertificate);
      if (insuranceFiles.invoice) formData.append('invoice', insuranceFiles.invoice);
      if (insuranceFiles.insurance) formData.append('insurance', insuranceFiles.insurance);
      await api.post('/insurance/with-documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Insurance details saved successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save insurance details');
    } finally {
      setInsuranceLoading(false);
    }
  };


  return (
    <Layout>
      <ToastContainer />
      <div className="min-h-screen bg-[#f6f7ff] p-8">
        {/* Breadcrumb and Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[#3B36FF]">Add New Vehicle</h2>
          <div className="text-sm mt-1">
            <span className="text-[#3B36FF] font-medium cursor-pointer">Vehicle List</span>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-500">Add New Vehicle</span>
          </div>
        </div>
        {/* Tabs */}
        <div className="border-b border-gray-300 mb-6 flex space-x-6">
          {vehicleTabs.map((tab, idx) => (
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
        {activeTab === 0 && (
          <div className="bg-white rounded-xl shadow p-8">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InputField label="City *" type="select" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} options={cities.map(city => ({ label: city.name, value: city._id }))} required />
                <InputField label="Aameego Hub" type="select" value={form.hub} onChange={e => setForm({ ...form, hub: e.target.value })} options={hubs.map(hub => ({ label: hub.name, value: hub._id }))} required />
                <InputField label="Supervisor" type="select" value={form.supervisor} onChange={e => setForm({ ...form, supervisor: e.target.value })} options={supervisors.map(sup => ({ label: sup.name || "N/A", value: sup._id }))} required />
                <InputField label="Vehicle Type" type="select" value={form.vehicleType} onChange={e => setForm({ ...form, vehicleType: e.target.value })} options={vehicleTypes.map(type => ({ label: type.name, value: type._id }))} required />
                <InputField label="OEM" type="select" value={form.oem} onChange={e => setForm({ ...form, oem: e.target.value })} options={oems.map(oem => ({ label: oem.name, value: oem._id }))} required />
                <InputField label="Vehicle Model" type="select" value={form.vehicleModel} onChange={e => setForm({ ...form, vehicleModel: e.target.value })} options={vehicleModels.map(model => ({ label: model.name, value: model._id }))} required />
                <InputField label="Vehicle Model Version" value={form.vehicleModelVersion} onChange={e => setForm({ ...form, vehicleModelVersion: e.target.value })} placeholder="Enter Version ID" required />
                <InputField label="Battery Type" type="select" value={form.batteryType} onChange={e => setForm({ ...form, batteryType: e.target.value })} options={batteryTypes.map(type => ({ label: type.name, value: type._id }))} required />
                <InputField label="Battery Capacity" value={form.batteryCapacity} onChange={e => setForm({ ...form, batteryCapacity: e.target.value })} placeholder="Eg-12 KWh" />
                <InputField label="Battery Number" value={form.batteryNumber} onChange={e => setForm({ ...form, batteryNumber: e.target.value })} placeholder="Enter" />
                <InputField label="Chassis Number" value={form.chassisNumber} onChange={e => setForm({ ...form, chassisNumber: e.target.value })} placeholder="Enter" />
                <InputField label="Vehicle RC Number" value={form.vehicleRCNumber} onChange={e => setForm({ ...form, vehicleRCNumber: e.target.value })} placeholder="Enter" />
                <InputField label="RC Registration Date" type="date" value={form.rcRegistrationDate} onChange={e => setForm({ ...form, rcRegistrationDate: e.target.value })} placeholder="DD-MM-YYYY" />
                <InputField label="RC Expiry Date" type="date" value={form.rcExpiryDate} onChange={e => setForm({ ...form, rcExpiryDate: e.target.value })} placeholder="DD-MM-YYYY" />
                <InputField label="Fitness Certificate Number" value={form.fitnessCertificateNumber} onChange={e => setForm({ ...form, fitnessCertificateNumber: e.target.value })} placeholder="Enter" />
                <InputField label="Manufacturing Year" value={form.manufacturingYear} onChange={e => setForm({ ...form, manufacturingYear: e.target.value })} placeholder="YYYY" />
                <InputField label="Fitness Certificate Exp Date" type="date" value={form.fitnessCertificateExpDate} onChange={e => setForm({ ...form, fitnessCertificateExpDate: e.target.value })} placeholder="DD-MM-YYYY" />
                <InputField label="Number Plate Status" type="select" value={form.numberPlateStatus} onChange={e => setForm({ ...form, numberPlateStatus: e.target.value })} options={[{ label: 'Pending', value: 'pending' }, { label: 'Available', value: 'available' }, { label: 'Rejected', value: 'rejected' }]} required />
                <InputField label="Vehicle Number" value={form.vehicleNumber} onChange={e => setForm({ ...form, vehicleNumber: e.target.value })} placeholder="Enter" />
                <InputField label="Invoice Number" value={form.invoiceNumber} onChange={e => setForm({ ...form, invoiceNumber: e.target.value })} placeholder="Enter" />
                <InputField label="Invoice Amount" value={form.invoiceAmount} onChange={e => setForm({ ...form, invoiceAmount: e.target.value })} placeholder="Enter" />
                <InputField label="Invoice Date" type="date" value={form.invoiceDate} onChange={e => setForm({ ...form, invoiceDate: e.target.value })} placeholder="DD-MM-YYYY" />
                <InputField label="Vehicle Ownership" type="select" value={form.vehicleOwnership} onChange={e => setForm({ ...form, vehicleOwnership: e.target.value })} options={vehicleOwnerships.map(own => ({ label: own.name, value: own._id }))} required />
                <InputField label="Vehicle Vendor" type="select" value={form.vehicleVendor} onChange={e => setForm({ ...form, vehicleVendor: e.target.value })} options={vehicleVendors.map(vendor => ({ label: vendor.name, value: vendor._id }))} required />
                <InputField label="Delivery Date" type="date" value={form.deliveryDate} onChange={e => setForm({ ...form, deliveryDate: e.target.value })} placeholder="DD-MM-YYYY" />
              </div>
              <div className="flex mt-8 space-x-4 justify-end">
                <Button variant="secondary" type="button">Cancel</Button>
                <Button variant="primary" type="submit" disabled={addVehicleMutation.isPending}>
                  {addVehicleMutation.isPending ? 'Saving...' : 'Save & Next'}
                </Button>
              </div>
            </form>
          </div>
        )}
        {activeTab === 1 && (
          <div className="bg-white rounded-xl shadow p-8">
            {/* Pass vehicleId to the insurance tab here as needed */}
            <div>Vehicle ID for insurance: {vehicleId}</div>
            {/* Insurance Details Section */}
            <form onSubmit={handleInsuranceSubmit} encType="multipart/form-data">
              <div className="mb-8">
                <div className="text-lg font-semibold mb-4">Insurance Details</div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                  <InputField label="Insurance Number" name="insuranceNumber" value={insuranceForm.insuranceNumber} onChange={handleInsuranceInputChange} required />
                  <InputField label="Insurance Valid Till" name="validTill" type="date" value={insuranceForm.validTill} onChange={handleInsuranceInputChange} required />
                  <InputField label="Insurance Provider" name="provider" value={insuranceForm.provider} onChange={handleInsuranceInputChange} required />
                  <InputField label="Insurance Type" name="type" value={insuranceForm.type} onChange={handleInsuranceInputChange} required />
                </div>
              </div>
              {/* Upload Documents Section */}
              <div className="mb-8">
                <div className="text-lg font-semibold mb-4">Upload Documents</div>
                {/* Vehicle RC */}
                <div className="bg-[#f6f7ff] border border-gray-200 rounded-xl p-6 mb-6">
                  <div className="text-base font-semibold mb-2">Vehicle RC</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
                    <InputField label="RC Document Number" name="rcDocumentNumber" value={insuranceForm.rcDocumentNumber} onChange={handleInsuranceInputChange} placeholder="Enter RC Number" />
                    <FileInput label="RC File" name="rc" onChange={handleInsuranceFileChange} file={insuranceFiles.rc} />
                  </div>
                </div>
                {/* Fitness Certificate */}
                <div className="bg-[#f6f7ff] border border-gray-200 rounded-xl p-6 mb-6">
                  <div className="text-base font-semibold mb-2">Fitness Certificate</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
                    <InputField label="Fitness Certificate Document Number" name="fitnessCertificateDocumentNumber" value={insuranceForm.fitnessCertificateDocumentNumber} onChange={handleInsuranceInputChange} placeholder="Enter Fitness Certificate Number" />
                    <FileInput label="Fitness Certificate File" name="fitnessCertificate" onChange={handleInsuranceFileChange} file={insuranceFiles.fitnessCertificate} />
                  </div>
                </div>
                {/* Invoice Details */}
                <div className="bg-[#f6f7ff] border border-gray-200 rounded-xl p-6 mb-6">
                  <div className="text-base font-semibold mb-2">Invoice Details</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
                    <InputField label="Invoice Document Number" name="invoiceDocumentNumber" value={insuranceForm.invoiceDocumentNumber} onChange={handleInsuranceInputChange} placeholder="Enter Invoice Number" />
                    <FileInput label="Invoice File" name="invoice" onChange={handleInsuranceFileChange} file={insuranceFiles.invoice} />
                  </div>
                </div>
                {/* Insurance Document */}
                <div className="bg-[#f6f7ff] border border-gray-200 rounded-xl p-6 mb-6">
                  <div className="text-base font-semibold mb-2">Insurance Document</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
                    <InputField label="Insurance Document Number" name="insuranceDocumentNumber" value={insuranceForm.insuranceDocumentNumber} onChange={handleInsuranceInputChange} placeholder="Enter Insurance Number" />
                    <FileInput label="Insurance File" name="insurance" onChange={handleInsuranceFileChange} file={insuranceFiles.insurance} />
                  </div>
                </div>
              </div>
              <div className="flex mt-8 space-x-4 justify-end">
                <Button variant="secondary" type="button">Cancel</Button>
                <Button variant="primary" type="submit" disabled={insuranceLoading}>
                  {insuranceLoading ? 'Saving...' : 'Save Insurance'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AddVehicle; 