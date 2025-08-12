import React, { useState, useEffect, useRef } from "react";
import InputField from "../components/InputField";
import Button from "../components/Button";
import Layout from "../components/Layout";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { FiDownload, FiEye, FiSearch, FiX } from "react-icons/fi";
import Modal from "../components/Modal";
import {
  useUpdateUserPersonalDetails,
  useUpdateDocument,
  useUpdateUserStatus,
} from "../hooks/useUpdateUser";
import { toast } from "react-toastify";
import { formatDateForInput, formatDateForBackend } from "../utils/dateUtils";
import { RejectUserModal } from "../components/modals/RejectModal";
import { useCreateOrUpdateDocRemark } from "../hooks/useDocRemark";
import type { Remark } from "../types";
import { useFetchVehicleAssignment } from "../hooks/useFetchVehicleAssignment";
import { useFetchAvailableVehicles } from "../hooks/useFetchAvailableVehicles";
import { useFetchUser } from "../hooks/useFetchUser";
import { useUpdateVehicleStatus } from "../hooks/useVehicleStatus";
import VehicleStatusModal from "../components/VehicleStatusModal";

const TABS = [
  "Personal information",
  "Bank Details",
  "Documents",
  "Vehicle Details",
];

const AddUser: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { id } = useParams<{ id: string }>();
  const [authId, setAuthId] = useState('');
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Add the new hooks
  const updateUserPersonalDetails = useUpdateUserPersonalDetails();
  const updateDocument = useUpdateDocument();
  const updateUserStatus = useUpdateUserStatus();
  const createOrUpdateDocRemark = useCreateOrUpdateDocRemark();
  const { data: vehicleAssignmentsRaw, isLoading: loadingAssignments, error: vehicleAssignmentsError, refetch: refetchAssignments } = useFetchVehicleAssignment(authId);
  const vehicleAssignments: any[] = Array.isArray(vehicleAssignmentsRaw) ? vehicleAssignmentsRaw : [];
  const { data: availableVehicles = [], isLoading: loadingAvailableVehicles } = useFetchAvailableVehicles();
  const { data: userData, isLoading: loadingUser } = useFetchUser(id);
  const updateVehicleStatus = useUpdateVehicleStatus();

  const [tabs, setTabs] = useState(TABS);
  // Add state for rejection/deactivation
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  // const [rejectionReason, setRejectionReason] = useState("");
  const [deactivateReason, setDeactivateReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [father, setFather] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pin, setPin] = useState("");
  const [state, setState] = useState("");
  const [role, setRole] = useState("");
  // Bank
  const [bankName, setBankName] = useState("");
  const [bankFullName, setBankFullName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  // Documents
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");

  // Add state for document files and previews
  const [aadhaarFrontFile, setAadhaarFrontFile] = useState<File | null>(null);
  const [aadhaarFrontPreview, setAadhaarFrontPreview] = useState<any>(null);
  const [aadhaarBackFile, setAadhaarBackFile] = useState<File | null>(null);
  const [aadhaarBackPreview, setAadhaarBackPreview] = useState<any>(null);
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

  const [assignedUser, setAssignedUser] = useState([]);

  // Add state for preview modal
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    url: string;
    type: string;
  } | null>(null);

  const [remarks, setRemarks] = useState<Remark[]>([]);

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
    documents: false,
  });

  // Helper function to normalize file for FormData
  const normalizeFile = (file: File | null) => {
    if (!file) return null;
    return file;
  };

  // Handle status updates (reject/deactivate)
  const handleStatusUpdate = (
    status: "rejected" | "deactived" | "verified",
    reason: string = ""
  ) => {
    if (!id) return;

    setIsRejecting(true);

    updateUserStatus.mutate(
      { userId: String(id), data: { status } },
      {
        onSuccess: () => {
          setIsRejecting(false);
          let actionText = "";
          switch (status) {
            case "rejected":
              actionText = "Rejected";
              break;
            case "deactived":
              actionText = "Deactivated";
              break;
            case "verified":
              actionText = "Verified";
              break;
          }
          toast.success(
            `User ${actionText} - User status has been updated to ${status}.${reason ? ` Reason: ${reason}` : ""
            }`
          );
          // Clear reasons
          // setRejectionReason("");
          setDeactivateReason("");
          // Close modals
          setShowRejectModal(false);
          setShowDeactivateModal(false);
          // Navigate back to user list
          navigate("/user-management");
        },
        onError: (error) => {
          setIsRejecting(false);
          toast.error(`Failed to update user status: ${error.message}`);
        },
      }
    );
  };

  const handleConfirmDeactivate = () => {
    handleStatusUpdate("deactived", deactivateReason);
  };

  const handleVerifyUser = () => {
    handleStatusUpdate("verified");
  };

  // Validation functions
  const validatePersonalInfo = () => {
    if (!fullName.trim()) {
      setError("Full name is required");
      return false;
    }
    if (!phone.trim()) {
      setError("Phone number is required");
      return false;
    }
    if (!dob) {
      setError("Date of birth is required");
      return false;
    }
    if (!gender) {
      setError("Gender is required");
      return false;
    }
    if (!father.trim()) {
      setError("Father's name is required");
      return false;
    }
    if (!city.trim()) {
      setError("City/District is required");
      return false;
    }
    if (!address.trim()) {
      setError("Address is required");
      return false;
    }
    if (!pin.trim()) {
      setError("PIN code is required");
      return false;
    }
    if (!state.trim()) {
      setError("State is required");
      return false;
    }
    setError("");
    return true;
  };

  const validateBankDetails = () => {
    if (!bankName.trim()) {
      setError("Bank name is required");
      return false;
    }
    if (!bankFullName.trim()) {
      setError("Account holder name is required");
      return false;
    }
    if (!accountNumber.trim()) {
      setError("Account number is required");
      return false;
    }
    if (!confirmAccountNumber.trim()) {
      setError("Confirm account number is required");
      return false;
    }
    if (accountNumber !== confirmAccountNumber) {
      setError("Account numbers do not match");
      return false;
    }
    if (!ifsc.trim()) {
      setError("IFSC code is required");
      return false;
    }
    setError("");
    return true;
  };

  const validateDocuments = () => {
    if (!aadhaarNumber.trim()) {
      setError("Aadhaar number is required");
      return false;
    }
    if (!panNumber.trim()) {
      setError("PAN number is required");
      return false;
    }
    setError("");
    return true;
  };

  useEffect(() => {
    if (userData) {
      setRole(userData?.role?.roleName);
      setFullName(userData.name || "");
      setAuthId(userData.authRef?._id || "");
      setPhone(userData.authRef?.identifier || "");
      setDob(
        formatDateForInput(userData.document?.aadhaar?.ocrFront?.dob || "")
      );
      setAssignedUser(userData.assignedUser);
      setGender(userData.document?.aadhaar?.ocrFront?.gender || "");
      setFather(userData.fatherName || "");
      setAddress(userData?.addressRef?.address || "");
      setCity(userData?.addressRef?.cityDistrict || "");
      setPin(userData?.addressRef?.pinCode || "");
      setState(userData?.addressRef?.state || "");
      setBankName(userData.document?.bank?.details?.bankName || "");
      setBankFullName(userData.document?.bank?.details?.holderName || "");
      setAccountNumber(userData.document?.bank?.details?.accountNumber || "");
      setConfirmAccountNumber(
        userData.document?.bank?.details?.accountNumber || ""
      );
      setIfsc(userData.document?.bank?.details?.ifsc || "");
      setAadhaarNumber(
        userData.document?.aadhaar?.ocrFront?.aadharNumber || ""
      );
      setPanNumber(userData.document?.pan?.ocr?.panNumber || "");
      setLicenseNumber(userData.document?.dl?.ocrFront?.dlNumber || "");
      setAadhaarFrontPreview(userData.document?.aadhaar?.frontFile || null);
      setAadhaarBackPreview(userData.document?.aadhaar?.backFile || null);
      setPanPreview(userData.document?.pan?.file || null);
      setLicenseFrontPreview(userData.document?.dl?.frontFile || null);
      setLicenseBackPreview(userData.document?.dl?.backFile || null);
      if (userData.document?.bank?.passbookUrl) {
        setPassbookPreview({
          url: userData.document.bank.passbookUrl,
          name: "Passbook",
          size: "N/A",
        });
      }
      if (userData.document?.bank?.chequeUrl) {
        setChequePreview({
          url: userData.document.bank.chequeUrl,
          name: "Cheque",
          size: "N/A",
        });
      }
      if (userData?.document?.documentRemarksRef) {
        setRemarks(userData?.document?.documentRemarksRef.remarks);
      }
    }
  }, [userData]);

  useEffect(() => {
    let tabName = null;
    if (role.toLowerCase() === "supervisor") {
      tabName = "Riders";
    }
    if (role.toLowerCase() === "rider") {
      tabName = "Supervisor";
    }

    if (tabName) {
      setTabs((prevTabs) => {
        // Remove the opposite tab if present
        const tabsToRemove = tabName === "Riders" ? "Supervisor" : "Riders";
        const filteredTabs = prevTabs.filter((tab) => tab !== tabsToRemove);
        // Ensure tabName is present only once
        if (!filteredTabs.includes(tabName)) {
          return [...filteredTabs, tabName];
        }
        return filteredTabs;
      });
    }
  }, [role]);

  // File change handlers
  const handleAadhaarFrontFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setAadhaarFrontFile(e.target.files[0]);
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setAadhaarFrontPreview({
          url: URL.createObjectURL(file),
          name: file.name,
          size: `${Math.round(file.size / 1024)} kb`,
        });
      } else if (file.type === "application/pdf") {
        setAadhaarFrontPreview({
          url: URL.createObjectURL(file),
          name: file.name,
          size: `${Math.round(file.size / 1024)} kb`,
          isPdf: true,
        });
      }
      setHasChanges((prev) => ({ ...prev, documents: true }));
    }
  };

  const handleAadhaarBackFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setAadhaarBackFile(e.target.files[0]);
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setAadhaarBackPreview({
          url: URL.createObjectURL(file),
          name: file.name,
          size: `${Math.round(file.size / 1024)} kb`,
        });
      } else if (file.type === "application/pdf") {
        setAadhaarBackPreview({
          url: URL.createObjectURL(file),
          name: file.name,
          size: `${Math.round(file.size / 1024)} kb`,
          isPdf: true,
        });
      }
      setHasChanges((prev) => ({ ...prev, documents: true }));
    }
  };

  const handlePanFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPanFile(e.target.files[0]);
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setPanPreview({
          url: URL.createObjectURL(file),
          name: file.name,
          size: `${Math.round(file.size / 1024)} kb`,
        });
      } else if (file.type === "application/pdf") {
        setPanPreview({
          url: URL.createObjectURL(file),
          name: file.name,
          size: `${Math.round(file.size / 1024)} kb`,
          isPdf: true,
        });
      }
      setHasChanges((prev) => ({ ...prev, documents: true }));
    }
  };
  const handleLicenseFrontFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setLicenseFrontFile(e.target.files[0]);
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setLicenseFrontPreview({
          url: URL.createObjectURL(file),
          name: file.name,
          size: `${Math.round(file.size / 1024)} kb`,
        });
      } else if (file.type === "application/pdf") {
        setLicenseFrontPreview({
          url: URL.createObjectURL(file),
          name: file.name,
          size: `${Math.round(file.size / 1024)} kb`,
          isPdf: true,
        });
      }
      setHasChanges((prev) => ({ ...prev, documents: true }));
    }
  };
  const handleLicenseBackFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setLicenseBackFile(e.target.files[0]);
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setLicenseBackPreview({
          url: URL.createObjectURL(file),
          name: file.name,
          size: `${Math.round(file.size / 1024)} kb`,
        });
      } else if (file.type === "application/pdf") {
        setLicenseBackPreview({
          url: URL.createObjectURL(file),
          name: file.name,
          size: `${Math.round(file.size / 1024)} kb`,
          isPdf: true,
        });
      }
      setHasChanges((prev) => ({ ...prev, documents: true }));
    }
  };

  // Bank document file change handlers
  const handlePassbookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPassbookFile(e.target.files[0]);
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setPassbookPreview({
          url: URL.createObjectURL(file),
          name: file.name,
          size: `${Math.round(file.size / 1024)} kb`,
        });
      } else if (file.type === "application/pdf") {
        setPassbookPreview({
          url: URL.createObjectURL(file),
          name: file.name,
          size: `${Math.round(file.size / 1024)} kb`,
          isPdf: true,
        });
      }
      setHasChanges((prev) => ({ ...prev, bank: true }));
    }
  };

  const handleChequeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setChequeFile(e.target.files[0]);
      const file = e.target.files[0];
      if (file.type.startsWith("image/")) {
        setChequePreview({
          url: URL.createObjectURL(file),
          name: file.name,
          size: `${Math.round(file.size / 1024)} kb`,
        });
      } else if (file.type === "application/pdf") {
        setChequePreview({
          url: URL.createObjectURL(file),
          name: file.name,
          size: `${Math.round(file.size / 1024)} kb`,
          isPdf: true,
        });
      }
      setHasChanges((prev) => ({ ...prev, bank: true }));
    }
  };

  // Save personal information
  const handleSavePersonalInfo = () => {
    if (!id) return;

    if (!validatePersonalInfo()) {
      return;
    }

    setSaving(true);

    const personalData: any = {
      fullName: fullName,
      dob: formatDateForBackend(dob),
      gender: gender.toLowerCase(),
      fatherName: father,
      address: {
        address: address,
        cityDistrict: city,
        pinCode: pin,
        state,
      },
    };

    updateUserPersonalDetails.mutate(
      { userId: String(id), data: personalData },
      {
        onSuccess: () => {
          setSaving(false);
          toast.success("Personal information updated successfully!");
          setHasChanges((prev) => ({ ...prev, personal: false }));
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
      formData.append("passbook", passbook);
    }

    const cheque = normalizeFile(chequeFile);
    if (cheque) {
      formData.append("cheque", cheque);
    }

    formData.append(
      "bank",
      JSON.stringify({
        details: {
          bankName,
          holderName: bankFullName,
          accountNumber,
          ifsc,
        },
      })
    );

    formData.append("type", "bank");

    updateDocument.mutate(
      { userId: String(id), formData },
      {
        onSuccess: () => {
          setSaving(false);
          toast.success("Bank details updated successfully!");
          setHasChanges((prev) => ({ ...prev, bank: false }));
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
    const aadhaarFront = normalizeFile(aadhaarFrontFile);
    if (aadhaarFront) {
      formData.append("aadhaarFront", aadhaarFront);
    }

    const aadhaarBack = normalizeFile(aadhaarBackFile); // Using same file for back for now
    if (aadhaarBack) {
      formData.append("aadhaarBack", aadhaarBack);
    }

    formData.append(
      "aadhaar",
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
      formData.append("pan", pan);
    }
    formData.append(
      "pan",
      JSON.stringify({
        ocr: {
          panNumber: panNumber,
        },
      })
    );

    // DL
    const dlFront = normalizeFile(licenseFrontFile);
    if (dlFront) {
      formData.append("dlFront", dlFront);
    }
    const dlBack = normalizeFile(licenseBackFile);
    if (dlBack) {
      formData.append("dlBack", dlBack);
    }
    formData.append(
      "dl",
      JSON.stringify({
        ocrFront: {
          dlNumber: licenseNumber,
          name: fullName || "",
          dob: formatDateForBackend(dob) || "",
          rawText: address,
        },
        ocrBack: {
          rawText: address,
        },
      })
    );

    formData.append("type", "documents");

    updateDocument.mutate(
      { userId: String(id), formData },
      {
        onSuccess: () => {
          setSaving(false);
          toast.success("Documents updated successfully!");
          setHasChanges((prev) => ({ ...prev, documents: false }));
          setTimeout(() => {
            navigate("/user-management"); // Redirect to user list
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

  // Download file function
  const handleDownloadFile = async (url: string, fileName: string) => {
    try {
      // If it's a blob URL (newly uploaded file), download directly
      if (url.startsWith("blob:")) {
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // For regular URLs (server files), fetch and create blob
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch file");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback: open in new tab if download fails
      window.open(url, "_blank");
    }
  };

  // Check if current tab has unsaved changes
  const hasUnsavedChanges = () => {
    switch (activeTab) {
      case 0:
        return hasChanges.personal;
      case 1:
        return hasChanges.bank;
      case 2:
        return hasChanges.vehicle;
      case 3:
        return hasChanges.documents;
      default:
        return false;
    }
  };

  // Handle tab change with unsaved changes warning
  const handleTabChange = (newTab: number) => {
    if (hasUnsavedChanges()) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        setActiveTab(newTab);
      }
    } else {
      setActiveTab(newTab);
    }
  };
  const onAddOrUpdteRemark = async (remarks: Remark[]) => {
    if (!id) return;
    createOrUpdateDocRemark.mutate(
      { userId: id || "", remarks: remarks },
      {
        onSuccess(data) {
          console.log("---datat---", data);
          setRemarks(data?.remarks || []);
          setShowRejectModal(false);
          toast.success("User rejected with remarks");
        },
        onError(error) {
          toast.error(`Failed to Reject the user: ${error.message}`);
        },
      }
    );
  };

  // Reusable Action Buttons Component
  const ActionButtons = ({
    onSave,
    saveText = "Save & Next",
  }: {
    onSave: () => void;
    saveText?: string;
  }) => (
    <div className="flex mt-8 space-x-4">
      {userData?.status === "verified" ? (
        <Button
          variant="danger"
          onClick={handleDeactivate}
          disabled={saving || isRejecting}
        >
          {isRejecting ? "Deactivating..." : "Deactivate"}
        </Button>
      ) : userData?.status === "pending" ? (
        <Button
          variant="danger"
          onClick={handleReject}
          disabled={saving || isRejecting}
        >
          {isRejecting ? "Rejecting..." : "Reject"}
        </Button>
      ) : userData?.status === "rejected" ? (
        <Button
          variant="secondary"
          onClick={handleReject}
          disabled={saving || isRejecting}
        >
          {isRejecting ? "Updating Remarks..." : "See Remarks"}
        </Button>
      ) : null}
      <Button
        variant="primary"
        onClick={onSave}
        disabled={saving || isRejecting}
      >
        {saving ? "Saving..." : saveText}
      </Button>
    </div>
  );

  // ...existing code...
  const handleProfileClick = (userId: string) => {
    navigate(`/add-user/${userId}`);
    handleTabChange(0);
  };

  // const handleUnassign = () => {
  //   // Unassign logic here (API call, update state, etc.)
  // };
  // ...existing code...

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState("");
  const [vehicleFilterType, setVehicleFilterType] = useState("");
  const [vehicleFilterCity, setVehicleFilterCity] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  // Helper function to filter vehicles based on search and filters
  const getFilteredVehicles = () => {
    if (!availableVehicles || availableVehicles.length === 0) return [];

    return availableVehicles.filter((vehicle: any) => {
      const matchesSearch = vehicle.vehicleNumber?.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
        vehicle.vehicleModel?.name?.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
        vehicle.vehicleType?.name?.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
        vehicle.hub?.name?.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
        vehicle.city?.name?.toLowerCase().includes(vehicleSearchTerm.toLowerCase());

      const matchesType = !vehicleFilterType || vehicle.vehicleType?.name === vehicleFilterType;
      const matchesCity = !vehicleFilterCity || vehicle.city?.name === vehicleFilterCity;

      return matchesSearch && matchesType && matchesCity;
    });
  };

  // Get unique vehicle types and cities for filters
  const getUniqueVehicleTypes = (): string[] => {
    const types = availableVehicles.map((v: any) => v.vehicleType?.name).filter(Boolean);
    return [...new Set(types)] as string[];
  };

  const getUniqueCities = (): string[] => {
    const cities = availableVehicles.map((v: any) => v.city?.name).filter(Boolean);
    return [...new Set(cities)] as string[];
  };

  const handleAssignVehicle = async () => {
    if (!selectedVehicle || !authId) return;
    setAssignLoading(true);
    try {
      await api.post("/vehicle-assignment/assign/admin", {
        vehicleNumber: selectedVehicle,
        riderId: authId, // This should be the user's auth ID (which is correct)
        vehicleCondition: { description: "Assigned by admin" },
      });
      toast.success("Vehicle assigned successfully!");
      setShowAssignModal(false);
      setSelectedVehicle("");
      // Reset filters
      setVehicleSearchTerm("");
      setVehicleFilterType("");
      setVehicleFilterCity("");
      // Refetch assignments
      setTimeout(() => window.location.reload(), 500);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to assign vehicle");
    } finally {
      setAssignLoading(false);
    }
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setSelectedVehicle("");
    setVehicleSearchTerm("");
    setVehicleFilterType("");
    setVehicleFilterCity("");
  };

  const handleVehicleStatusUpdate = (data: any) => {
    if (!selectedAssignment) return;

    updateVehicleStatus.mutate({
      assignmentId: selectedAssignment._id,
      data
    }, {
      onSuccess: () => {
        // Refetch vehicle assignments after successful update
        setTimeout(() => {
          refetchAssignments();
        }, 500);
      }
    });

    setShowStatusModal(false);
    setSelectedAssignment(null);
  };

  const handleOpenStatusModal = (assignment: any) => {
    setSelectedAssignment(assignment);
    setShowStatusModal(true);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#f6f7ff] flex flex-col">
        <div className="flex-1 p-8">
          {/* Breadcrumb and Title */}
          <div className="mb-6 flex justify-between">
            <div className="text-sm mt-1">
              <span
                className="text-[#3B36FF] font-medium cursor-pointer"
                onClick={() => navigate("/user-management")}
              >
                User List
              </span>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">
                {id ? "Edit User" : "New User"}
              </span>
            </div>
            {(userData?.status === "pending" ||
              userData?.status === "rejected") && (
                <Button
                  variant="success"
                  onClick={handleVerifyUser}
                  disabled={saving || isRejecting}
                >
                  {isRejecting ? "Verifying..." : "Verify User"}
                </Button>
              )}
            {userData?.status === "deactived" && (
              <Button
                variant="success"
                onClick={handleVerifyUser}
                disabled={saving || isRejecting}
              >
                {isRejecting ? "Activating..." : "Activate User"}
              </Button>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-300 mb-6 flex space-x-6">
            {tabs.map((tab, idx) => (
              <button
                key={tab}
                className={`cursor-pointer pb-2 text-lg font-medium focus:outline-none ${activeTab === idx
                  ? "border-b-2 border-[#3B36FF] text-[#3B36FF]"
                  : "text-gray-400"
                  }`}
                onClick={() => handleTabChange(idx)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-xl shadow p-8 relative">
            {loadingUser && (
              <div className="absolute inset-0 bg-[rgba(255,255,255,0.6)] flex items-center justify-center z-10">
                <div className="text-indigo-600 text-lg font-semibold">
                  Loading...
                </div>
              </div>
            )}

            {!userData && !loadingUser && (
              <div className="text-center text-red-500 mb-4">Failed to fetch user details</div>
            )}
            {error && (
              <div className="text-center text-red-500 mb-4">{error}</div>
            )}
            {/* {!loading && ( */}
            <>
              {activeTab === 0 && (
                <div>
                  <div className="text-xl font-semibold mb-4">
                    Personal Details
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField
                      label="Full Name"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        setHasChanges((prev) => ({
                          ...prev,
                          personal: true,
                        }));
                      }}
                      placeholder="Enter full name"
                      required
                    />
                    <InputField
                      label="Phone Number"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setHasChanges((prev) => ({
                          ...prev,
                          personal: true,
                        }));
                      }}
                      placeholder="Enter phone number"
                      required
                      disabled
                    />
                    <InputField
                      label="Date Of Birth"
                      value={dob}
                      onChange={(e) => {
                        setDob(e.target.value);
                        setHasChanges((prev) => ({
                          ...prev,
                          personal: true,
                        }));
                      }}
                      type="date"
                      required
                    />
                    <InputField
                      label="Gender"
                      value={gender}
                      onChange={(e) => {
                        setGender(e.target.value);
                        setHasChanges((prev) => ({
                          ...prev,
                          personal: true,
                        }));
                      }}
                      type="select"
                      options={[
                        { label: "Male", value: "male" },
                        { label: "Female", value: "female" },
                      ]}
                      required
                    />
                    <InputField
                      label="Fathers Name"
                      value={father}
                      onChange={(e) => {
                        setFather(e.target.value);
                        setHasChanges((prev) => ({
                          ...prev,
                          personal: true,
                        }));
                      }}
                      placeholder="Enter father's name"
                      required
                    />
                    <InputField
                      label="City/District"
                      value={city}
                      onChange={(e) => {
                        setCity(e.target.value);
                        setHasChanges((prev) => ({
                          ...prev,
                          personal: true,
                        }));
                      }}
                      placeholder="Enter city/district"
                      required
                    />
                    <InputField
                      label="Address"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        setHasChanges((prev) => ({
                          ...prev,
                          personal: true,
                        }));
                      }}
                      type="textarea"
                      placeholder="Enter address"
                      className="md:col-span-3"
                      required
                    />
                    <InputField
                      label="PIN Code"
                      value={pin}
                      onChange={(e) => {
                        setPin(e.target.value);
                        setHasChanges((prev) => ({
                          ...prev,
                          personal: true,
                        }));
                      }}
                      placeholder="Enter PIN code"
                      required
                    />
                    <InputField
                      label="State"
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        setHasChanges((prev) => ({
                          ...prev,
                          personal: true,
                        }));
                      }}
                      placeholder="Enter state"
                      required
                    />
                  </div>
                  <ActionButtons onSave={handleSavePersonalInfo} />
                </div>
              )}
              {activeTab === 1 && (
                <div>
                  <div className="text-xl font-semibold mb-4">Bank Details</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField
                      label="Bank Name"
                      value={bankName}
                      onChange={(e) => {
                        setBankName(e.target.value);
                        setHasChanges((prev) => ({ ...prev, bank: true }));
                      }}
                      placeholder="Enter bank name"
                      required
                    />
                    <InputField
                      label="Full Name"
                      value={bankFullName}
                      onChange={(e) => {
                        setBankFullName(e.target.value);
                        setHasChanges((prev) => ({ ...prev, bank: true }));
                      }}
                      placeholder="Enter account holder name"
                      required
                    />
                    <InputField
                      label="Account Number"
                      value={accountNumber}
                      onChange={(e) => {
                        setAccountNumber(e.target.value);
                        setHasChanges((prev) => ({ ...prev, bank: true }));
                      }}
                      placeholder="Enter account number"
                      required
                    />
                    <InputField
                      label="Confirm Account Number"
                      value={confirmAccountNumber}
                      onChange={(e) => {
                        setConfirmAccountNumber(e.target.value);
                        setHasChanges((prev) => ({ ...prev, bank: true }));
                      }}
                      placeholder="Re-enter account number"
                      required
                    />
                    <InputField
                      label="IFSC Code"
                      value={ifsc}
                      onChange={(e) => {
                        setIfsc(e.target.value);
                        setHasChanges((prev) => ({ ...prev, bank: true }));
                      }}
                      placeholder="Enter IFSC code"
                      required
                    />
                  </div>
                  {/* Uploaded Documents */}
                  <div className="mt-8">
                    <div className="text-lg font-medium mb-2">
                      Uploaded Documents
                    </div>
                    <div className="flex flex-wrap gap-4 mb-4">
                      {/* Bank Passbook */}
                      {passbookPreview && (
                        <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                          <div className="flex items-center gap-2">
                            <FiDownload className="text-red-500 text-2xl" />
                            <span className="font-medium text-sm">
                              Bank Passbook
                            </span>
                            <span className="ml-auto text-xs text-gray-400">
                              {passbookPreview?.size || "N/A"}
                            </span>
                          </div>
                          {passbookPreview && (
                            <div className="flex flex-col items-center mt-2">
                              {passbookPreview.isPdf ? (
                                <FiDownload className="text-red-500 text-4xl mb-1" />
                              ) : (
                                <img
                                  src={passbookPreview.url}
                                  alt="Passbook Preview"
                                  className="w-16 h-16 object-cover rounded border mb-1"
                                />
                              )}
                              <span className="text-xs text-gray-500">
                                {passbookPreview.name}
                              </span>
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            {/* <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeletePassbook}><FiTrash2 /></button> */}
                            <button
                              className="text-blue-500 hover:text-blue-700"
                              title="Download"
                              onClick={() =>
                                handleDownloadFile(
                                  passbookPreview?.url || "",
                                  passbookPreview?.name || "passbook.pdf"
                                )
                              }
                            >
                              <FiDownload />
                            </button>
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              title="View"
                              onClick={() =>
                                setPreviewModal({
                                  open: true,
                                  url: passbookPreview?.url,
                                  type: passbookPreview?.isPdf
                                    ? "pdf"
                                    : "image",
                                })
                              }
                            >
                              <FiEye />
                            </button>
                          </div>
                        </div>
                      )}
                      {/* Cancelled Cheque */}
                      {chequePreview && (
                        <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                          <div className="flex items-center gap-2">
                            <FiDownload className="text-red-500 text-2xl" />
                            <span className="font-medium text-sm">
                              Cancelled Cheque
                            </span>
                            <span className="ml-auto text-xs text-gray-400">
                              {chequePreview?.size || "N/A"}
                            </span>
                          </div>
                          {chequePreview && (
                            <div className="flex flex-col items-center mt-2">
                              {chequePreview.isPdf ? (
                                <FiDownload className="text-red-500 text-4xl mb-1" />
                              ) : (
                                <img
                                  src={chequePreview.url}
                                  alt="Cheque Preview"
                                  className="w-16 h-16 object-cover rounded border mb-1"
                                />
                              )}
                              <span className="text-xs text-gray-500">
                                {chequePreview.name}
                              </span>
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            {/* <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeleteCheque}><FiTrash2 /></button> */}
                            <button
                              className="text-blue-500 hover:text-blue-700"
                              title="Download"
                              onClick={() =>
                                handleDownloadFile(
                                  chequePreview?.url || "",
                                  chequePreview?.name || "cheque.pdf"
                                )
                              }
                            >
                              <FiDownload />
                            </button>
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              title="View"
                              onClick={() =>
                                setPreviewModal({
                                  open: true,
                                  url: chequePreview?.url,
                                  type: chequePreview?.isPdf ? "pdf" : "image",
                                })
                              }
                            >
                              <FiEye />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div
                      className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 cursor-pointer"
                      onClick={() => passbookInputRef.current?.click()}
                    >
                      <FiDownload className="mb-1" /> Upload Bank Passbook
                      <input
                        type="file"
                        ref={passbookInputRef}
                        className="hidden"
                        onChange={handlePassbookFileChange}
                      />
                    </div>
                    <div
                      className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400 cursor-pointer"
                      onClick={() => chequeInputRef.current?.click()}
                    >
                      <FiDownload className="mb-1" /> Upload Cancelled Cheque
                      <input
                        type="file"
                        ref={chequeInputRef}
                        className="hidden"
                        onChange={handleChequeFileChange}
                      />
                    </div>
                  </div>
                  <ActionButtons onSave={handleSaveBankDetails} />
                </div>
              )}
              {activeTab === 2 && (
                <div>
                  {/* Aadhaar Card */}
                  <div className="mb-8">
                    <div className="text-base font-semibold mb-2">
                      Aadhaar Card
                    </div>
                    <InputField
                      label="Aadhaar Number"
                      value={aadhaarNumber}
                      onChange={(e) => {
                        setAadhaarNumber(e.target.value);
                        setHasChanges((prev) => ({
                          ...prev,
                          documents: true,
                        }));
                      }}
                      placeholder="Enter Aadhaar Number"
                      required
                    />
                    <div className="text-sm font-medium mb-2 mt-4">
                      Uploaded Documents
                    </div>
                    <div className="flex flex-wrap gap-4 mb-2">
                      {/* Aadhaar Front */}
                      {(aadhaarFrontPreview ||
                        userData?.document?.aadhaar?.frontUrl) && (
                          <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                            <div className="flex items-center gap-2">
                              <FiDownload className="text-red-500 text-2xl" />
                              <span className="font-medium text-sm">Front</span>
                              <span className="ml-auto text-xs text-gray-400">
                                {aadhaarFrontPreview?.size ||
                                  (userData?.document?.aadhaar?.frontUrl
                                    ? ""
                                    : "92 kb")}
                              </span>
                            </div>
                            {(aadhaarFrontPreview ||
                              userData?.document?.aadhaar?.frontUrl) && (
                                <div className="flex flex-col items-center mt-2">
                                  {aadhaarFrontPreview ? (
                                    aadhaarFrontPreview.isPdf ? (
                                      <FiDownload className="text-red-500 text-4xl mb-1" />
                                    ) : (
                                      <img
                                        src={aadhaarFrontPreview.url}
                                        alt="Aadhaar Preview"
                                        className="w-16 h-16 object-cover rounded border mb-1"
                                      />
                                    )
                                  ) : (
                                    <img
                                      src={userData.document.aadhaar.frontUrl}
                                      alt="Aadhaar Front"
                                      className="w-16 h-16 object-cover rounded border mb-1"
                                    />
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {aadhaarFrontPreview?.name || ""}
                                  </span>
                                </div>
                              )}
                            <div className="flex gap-2 mt-2">
                              {/* <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeleteAadhaar}><FiTrash2 /></button> */}
                              <button
                                className="text-blue-500 hover:text-blue-700"
                                title="Download"
                                onClick={() =>
                                  handleDownloadFile(
                                    aadhaarFrontPreview?.url ||
                                    userData?.document?.aadhaar?.frontUrl,
                                    aadhaarFrontPreview?.name ||
                                    "aadhaar_front.pdf"
                                  )
                                }
                              >
                                <FiDownload />
                              </button>
                              <button
                                className="text-gray-500 hover:text-gray-700"
                                title="View"
                                onClick={() =>
                                  setPreviewModal({
                                    open: true,
                                    url:
                                      aadhaarFrontPreview?.url ||
                                      userData?.document?.aadhaar?.frontUrl,
                                    type: aadhaarFrontPreview?.isPdf
                                      ? "pdf"
                                      : "image",
                                  })
                                }
                              >
                                <FiEye />
                              </button>
                            </div>
                          </div>
                        )}
                      {/* Aadhaar Back */}
                      {(aadhaarBackPreview ||
                        userData?.document?.aadhaar?.backUrl) && (
                          <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                            <div className="flex items-center gap-2">
                              <FiDownload className="text-red-500 text-2xl" />
                              <span className="font-medium text-sm">Back</span>
                              <span className="ml-auto text-xs text-gray-400">
                                {aadhaarBackPreview?.size ||
                                  (userData?.document?.aadhaar?.backUrl
                                    ? ""
                                    : "92 kb")}
                              </span>
                            </div>
                            {(aadhaarBackPreview ||
                              userData?.document?.aadhaar?.backUrl) && (
                                <div className="flex flex-col items-center mt-2">
                                  {aadhaarBackPreview ? (
                                    aadhaarBackPreview.isPdf ? (
                                      <FiDownload className="text-red-500 text-4xl mb-1" />
                                    ) : (
                                      <img
                                        src={aadhaarBackPreview.url}
                                        alt="Aadhaar Preview"
                                        className="w-16 h-16 object-cover rounded border mb-1"
                                      />
                                    )
                                  ) : (
                                    <img
                                      src={userData.document.aadhaar.backUrl}
                                      alt="Aadhaar Back"
                                      className="w-16 h-16 object-cover rounded border mb-1"
                                    />
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {aadhaarBackPreview?.name || ""}
                                  </span>
                                </div>
                              )}
                            <div className="flex gap-2 mt-2">
                              {/* <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeleteAadhaar}><FiTrash2 /></button> */}
                              <button
                                className="text-blue-500 hover:text-blue-700"
                                title="Download"
                                onClick={() =>
                                  handleDownloadFile(
                                    aadhaarBackPreview?.url ||
                                    userData?.document?.aadhaar?.backUrl,
                                    aadhaarBackPreview?.name || "aadhaar_back.pdf"
                                  )
                                }
                              >
                                <FiDownload />
                              </button>
                              <button
                                className="text-gray-500 hover:text-gray-700"
                                title="View"
                                onClick={() =>
                                  setPreviewModal({
                                    open: true,
                                    url:
                                      aadhaarBackPreview?.url ||
                                      userData?.document?.aadhaar?.backUrl,
                                    type: aadhaarBackPreview?.isPdf
                                      ? "pdf"
                                      : "image",
                                  })
                                }
                              >
                                <FiEye />
                              </button>
                            </div>
                          </div>
                        )}
                    </div>
                    <div
                      className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer"
                      onClick={() => aadhaarFrontInputRef.current?.click()}
                    >
                      <FiDownload className="mb-1" /> Upload Aadhaar Front
                      <input
                        type="file"
                        ref={aadhaarFrontInputRef}
                        className="hidden"
                        onChange={handleAadhaarFrontFileChange}
                      />
                    </div>
                    <div
                      className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer"
                      onClick={() => aadhaarBackInputRef.current?.click()}
                    >
                      <FiDownload className="mb-1" /> Upload Aadhaar Back
                      <input
                        type="file"
                        ref={aadhaarBackInputRef}
                        className="hidden"
                        onChange={handleAadhaarBackFileChange}
                      />
                    </div>
                  </div>
                  {/* Pan Card */}
                  <div className="mb-8">
                    <div className="text-base font-semibold mb-2">Pan Card</div>
                    <InputField
                      label="PAN Card"
                      value={panNumber}
                      onChange={(e) => {
                        setPanNumber(e.target.value);
                        setHasChanges((prev) => ({
                          ...prev,
                          documents: true,
                        }));
                      }}
                      placeholder="Enter PAN Number"
                      required
                    />
                    <div className="text-sm font-medium mb-2 mt-4">
                      Uploaded Documents
                    </div>
                    <div className="flex flex-wrap gap-4 mb-2">
                      {(panPreview || userData?.document?.pan?.url) && (
                        <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                          <div className="flex items-center gap-2">
                            <FiDownload className="text-red-500 text-2xl" />
                            <span className="font-medium text-sm">Front</span>
                            <span className="ml-auto text-xs text-gray-400">
                              {panPreview?.size ||
                                (userData?.document?.pan?.url
                                  ? ""
                                  : "92 kb")}
                            </span>
                          </div>
                          {(panPreview || userData?.document?.pan?.url) && (
                            <div className="flex flex-col items-center mt-2">
                              {panPreview ? (
                                panPreview.isPdf ? (
                                  <FiDownload className="text-red-500 text-4xl mb-1" />
                                ) : (
                                  <img
                                    src={panPreview.url}
                                    alt="PAN Preview"
                                    className="w-16 h-16 object-cover rounded border mb-1"
                                  />
                                )
                              ) : (
                                <img
                                  src={userData.document.pan.url}
                                  alt="PAN Front"
                                  className="w-16 h-16 object-cover rounded border mb-1"
                                />
                              )}
                              <span className="text-xs text-gray-500">
                                {panPreview?.name || ""}
                              </span>
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            {/* <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeletePan}><FiTrash2 /></button> */}
                            <button
                              className="text-blue-500 hover:text-blue-700"
                              title="Download"
                              onClick={() =>
                                handleDownloadFile(
                                  panPreview?.url ||
                                  userData?.document?.pan?.url,
                                  panPreview?.name || "pan_front.pdf"
                                )
                              }
                            >
                              <FiDownload />
                            </button>
                            <button
                              className="text-gray-500 hover:text-blue-700"
                              title="View"
                              onClick={() =>
                                setPreviewModal({
                                  open: true,
                                  url:
                                    panPreview?.url ||
                                    userData?.document?.pan?.url,
                                  type: panPreview?.isPdf ? "pdf" : "image",
                                })
                              }
                            >
                              <FiEye />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <div
                      className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer"
                      onClick={() => panInputRef.current?.click()}
                    >
                      <FiDownload className="mb-1" /> Upload PAN
                      <input
                        type="file"
                        ref={panInputRef}
                        className="hidden"
                        onChange={handlePanFileChange}
                      />
                    </div>
                  </div>
                  {/* Driver License */}
                  <div className="mb-8">
                    <div className="text-base font-semibold mb-2">
                      Driver License
                    </div>
                    <InputField
                      label="Driver License"
                      value={licenseNumber}
                      onChange={(e) => {
                        setLicenseNumber(e.target.value);
                        setHasChanges((prev) => ({
                          ...prev,
                          documents: true,
                        }));
                      }}
                      placeholder="Enter License Number"
                      required
                    />
                    <div className="text-sm font-medium mb-2 mt-4">
                      Uploaded Documents
                    </div>
                    <div className="flex flex-wrap gap-4 mb-2">
                      {/* License Front */}
                      {(licenseFrontPreview ||
                        userData?.document?.dl?.frontUrl) && (
                          <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                            <div className="flex items-center gap-2">
                              <FiDownload className="text-red-500 text-2xl" />
                              <span className="font-medium text-sm">Front</span>
                              <span className="ml-auto text-xs text-gray-400">
                                {licenseFrontPreview?.size ||
                                  (userData?.document?.dl?.frontUrl
                                    ? ""
                                    : "92 kb")}
                              </span>
                            </div>
                            {(licenseFrontPreview ||
                              userData?.document?.dl?.frontUrl) && (
                                <div className="flex flex-col items-center mt-2">
                                  {licenseFrontPreview ? (
                                    licenseFrontPreview.isPdf ? (
                                      <FiDownload className="text-red-500 text-4xl mb-1" />
                                    ) : (
                                      <img
                                        src={licenseFrontPreview.url}
                                        alt="License Front Preview"
                                        className="w-16 h-16 object-cover rounded border mb-1"
                                      />
                                    )
                                  ) : (
                                    <img
                                      src={userData.document.dl.frontUrl}
                                      alt="License Front"
                                      className="w-16 h-16 object-cover rounded border mb-1"
                                    />
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {licenseFrontPreview?.name || ""}
                                  </span>
                                </div>
                              )}
                            <div className="flex gap-2 mt-2">
                              {/* <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeleteLicenseFront}><FiTrash2 /></button> */}
                              <button
                                className="text-blue-500 hover:text-blue-700"
                                title="Download"
                                onClick={() =>
                                  handleDownloadFile(
                                    licenseFrontPreview?.url ||
                                    userData?.document?.dl?.frontUrl,
                                    licenseFrontPreview?.name ||
                                    "license_front.pdf"
                                  )
                                }
                              >
                                <FiDownload />
                              </button>
                              <button
                                className="text-gray-500 hover:text-gray-700"
                                title="View"
                                onClick={() =>
                                  setPreviewModal({
                                    open: true,
                                    url:
                                      licenseFrontPreview?.url ||
                                      userData?.document?.dl?.frontUrl,
                                    type: licenseFrontPreview?.isPdf
                                      ? "pdf"
                                      : "image",
                                  })
                                }
                              >
                                <FiEye />
                              </button>
                            </div>
                          </div>
                        )}
                      {/* License Back */}
                      {(licenseBackPreview ||
                        userData?.document?.dl?.backUrl) && (
                          <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                            <div className="flex items-center gap-2">
                              <FiDownload className="text-red-500 text-2xl" />
                              <span className="font-medium text-sm">Back</span>
                              <span className="ml-auto text-xs text-gray-400">
                                {licenseBackPreview?.size ||
                                  (userData?.document?.dl?.backUrl
                                    ? ""
                                    : "92 kb")}
                              </span>
                            </div>
                            {(licenseBackPreview ||
                              userData?.document?.dl?.backUrl) && (
                                <div className="flex flex-col items-center mt-2">
                                  {licenseBackPreview ? (
                                    licenseBackPreview.isPdf ? (
                                      <FiDownload className="text-red-500 text-4xl mb-1" />
                                    ) : (
                                      <img
                                        src={licenseBackPreview.url}
                                        alt="License Back Preview"
                                        className="w-16 h-16 object-cover rounded border mb-1"
                                      />
                                    )
                                  ) : (
                                    <img
                                      src={userData.document.dl.backUrl}
                                      alt="License Back"
                                      className="w-16 h-16 object-cover rounded border mb-1"
                                    />
                                  )}
                                  <span className="text-xs text-gray-500">
                                    {licenseBackPreview?.name || ""}
                                  </span>
                                </div>
                              )}
                            <div className="flex gap-2 mt-2">
                              {/* <button className="text-red-500 hover:text-red-700" title="Delete" onClick={handleDeleteLicenseBack}><FiTrash2 /></button> */}
                              <button
                                className="text-blue-500 hover:text-blue-700"
                                title="Download"
                                onClick={() =>
                                  handleDownloadFile(
                                    licenseBackPreview?.url ||
                                    userData?.document?.dl?.backUrl,
                                    licenseBackPreview?.name || "license_back.pdf"
                                  )
                                }
                              >
                                <FiDownload />
                              </button>
                              <button
                                className="text-gray-500 hover:text-gray-700"
                                title="View"
                                onClick={() =>
                                  setPreviewModal({
                                    open: true,
                                    url:
                                      licenseBackPreview?.url ||
                                      userData?.document?.dl?.backUrl,
                                    type: licenseBackPreview?.isPdf
                                      ? "pdf"
                                      : "image",
                                  })
                                }
                              >
                                <FiEye />
                              </button>
                            </div>
                          </div>
                        )}
                    </div>
                    <div
                      className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer"
                      onClick={() => licenseFrontInputRef.current?.click()}
                    >
                      <FiDownload className="mb-1" /> Upload License Front
                      <input
                        type="file"
                        ref={licenseFrontInputRef}
                        className="hidden"
                        onChange={handleLicenseFrontFileChange}
                      />
                    </div>
                    <div
                      className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400 cursor-pointer"
                      onClick={() => licenseBackInputRef.current?.click()}
                    >
                      <FiDownload className="mb-1" /> Upload License Back
                      <input
                        type="file"
                        ref={licenseBackInputRef}
                        className="hidden"
                        onChange={handleLicenseBackFileChange}
                      />
                    </div>
                  </div>
                  <ActionButtons
                    onSave={handleSaveAndVerify}
                    saveText="Save Documents"
                  />
                </div>
              )}
              {activeTab === 3 && (
                <div>
                  {loadingAssignments ? (
                    <div className="text-center text-gray-500 py-12">Loading vehicle assignments...</div>
                  ) : vehicleAssignmentsError ? (
                    <div className="text-center text-red-500 py-12">Failed to load vehicle assignments.</div>
                  ) : (
                    <div>
                      {/* Current Vehicle Assignment */}
                      {vehicleAssignments.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold mb-4 text-gray-800">Current Vehicle Assignment</h3>

                          {vehicleAssignments
                            .filter((assignment: any) => assignment.status === 'assigned')
                            .map((assignment: any, idx: number) => {
                              const vehicle = assignment.vehicle;
                              if (!vehicle) return null;
                              // Helper to determine file type for modal
                              const getFileType = (url: string) => {
                                if (!url) return 'image';
                                const ext = url.split('.').pop()?.toLowerCase();
                                if (ext === 'pdf') return 'pdf';
                                return 'image';
                              };
                              return (
                                <div key={assignment._id || idx} className="mb-8 p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg border border-green-100">
                                  <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                      <span className="text-xl font-bold text-gray-900">Currently Assigned Vehicle</span>
                                      <span className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${assignment.status === 'assigned' ? 'bg-green-100 text-green-800' :
                                        assignment.status === 'returned' ? 'bg-blue-100 text-blue-800' :
                                          assignment.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                            assignment.status === 'damaged' ? 'bg-red-100 text-red-800' :
                                              'bg-gray-100 text-gray-800'
                                        }`}>
                                        {assignment.status?.charAt(0).toUpperCase() + assignment.status?.slice(1)}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleOpenStatusModal(assignment)}
                                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                      disabled={updateVehicleStatus.isPending}
                                    >
                                      Update Status
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                      <div className="mb-2"><b>Model:</b> {vehicle?.vehicleModel?.name || 'N/A'}</div>
                                      <div className="mb-2"><b>Type:</b> {vehicle?.vehicleType?.name || 'N/A'}</div>
                                      <div className="mb-2"><b>Number:</b> {vehicle?.vehicleNumber || 'N/A'}</div>
                                      <div className="mb-2"><b>Hub:</b> {vehicle?.hub?.name || 'N/A'}</div>
                                      <div className="mb-2"><b>City:</b> {vehicle?.city?.name || 'N/A'}</div>
                                      <div className="mb-2"><b>Assigned On:</b> {assignment.assignmentDate ? new Date(assignment.assignmentDate).toLocaleDateString() : 'N/A'}</div>
                                      {assignment.returnDate && (
                                        <div className="mb-2"><b>Returned On:</b> {new Date(assignment.returnDate).toLocaleDateString()}</div>
                                      )}
                                      {assignment.maintenanceDate && (
                                        <div className="mb-2"><b>Maintenance Date:</b> {new Date(assignment.maintenanceDate).toLocaleDateString()}</div>
                                      )}
                                      {assignment.damageDate && (
                                        <div className="mb-2"><b>Damage Date:</b> {new Date(assignment.damageDate).toLocaleDateString()}</div>
                                      )}
                                    </div>
                                    <div>
                                      <div className="mb-2"><b>RC Registration Date:</b> {vehicle?.rcRegistrationDate ? new Date(vehicle.rcRegistrationDate).toLocaleDateString() : 'N/A'}</div>
                                      <div className="mb-2"><b>RC Expiry Date:</b> {vehicle?.rcExpiryDate ? new Date(vehicle.rcExpiryDate).toLocaleDateString() : 'N/A'}</div>
                                      <div className="mb-2"><b>Fitness Certificate No.:</b> {vehicle?.fitnessCertificateNumber || 'N/A'}</div>
                                      <div className="mb-2"><b>Fitness Expiry:</b> {vehicle?.fitnessCertificateExpDate ? new Date(vehicle.fitnessCertificateExpDate).toLocaleDateString() : 'N/A'}</div>
                                    </div>
                                  </div>
                                  {/* Vehicle Documents */}
                                  <div className="mt-6">
                                    <div className="font-semibold mb-2">Vehicle Documents</div>
                                    {vehicle?.insurance?.documents ? (
                                      <div className="flex flex-wrap gap-4">
                                        {/* RC Document */}
                                        {vehicle.insurance.documents.rc && (
                                          <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-sm">RC</span>
                                              <span className="ml-auto text-xs text-gray-400">{vehicle.insurance.documents.rc.name}</span>
                                            </div>
                                            <div className="flex flex-col items-center mt-2">
                                              <span className="text-xs text-gray-500">{vehicle.insurance.documents.rc.url ? 'Available' : 'Not available'}</span>
                                              {vehicle.insurance.documents.rc.size && (
                                                <span className="text-xs text-gray-400">{(vehicle.insurance.documents.rc.size / 1024).toFixed(1)} KB</span>
                                              )}
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                              {vehicle.insurance.documents.rc.url && (
                                                <>
                                                  <button
                                                    className="text-blue-500 hover:text-blue-700"
                                                    title="Download RC"
                                                    onClick={() => handleDownloadFile(vehicle.insurance.documents.rc.url, vehicle.insurance.documents.rc.name || 'rc.pdf')}
                                                  >
                                                    <FiDownload />
                                                  </button>
                                                  <button
                                                    className="text-gray-500 hover:text-gray-700"
                                                    title="View RC"
                                                    onClick={() => setPreviewModal({
                                                      open: true,
                                                      url: vehicle.insurance.documents.rc.url,
                                                      type: getFileType(vehicle.insurance.documents.rc.url),
                                                    })}
                                                  >
                                                    <FiEye />
                                                  </button>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                        {/* Fitness Certificate Document */}
                                        {vehicle.insurance.documents.fitnessCertificate && (
                                          <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-sm">Fitness Certificate</span>
                                              <span className="ml-auto text-xs text-gray-400">{vehicle.insurance.documents.fitnessCertificate.name}</span>
                                            </div>
                                            <div className="flex flex-col items-center mt-2">
                                              <span className="text-xs text-gray-500">{vehicle.insurance.documents.fitnessCertificate.url ? 'Available' : 'Not available'}</span>
                                              {vehicle.insurance.documents.fitnessCertificate.size && (
                                                <span className="text-xs text-gray-400">{(vehicle.insurance.documents.fitnessCertificate.size / 1024).toFixed(1)} KB</span>
                                              )}
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                              {vehicle.insurance.documents.fitnessCertificate.url && (
                                                <>
                                                  <button
                                                    className="text-blue-500 hover:text-blue-700"
                                                    title="Download Fitness Certificate"
                                                    onClick={() => handleDownloadFile(vehicle.insurance.documents.fitnessCertificate.url, vehicle.insurance.documents.fitnessCertificate.name || 'fitness_certificate.pdf')}
                                                  >
                                                    <FiDownload />
                                                  </button>
                                                  <button
                                                    className="text-gray-500 hover:text-gray-700"
                                                    title="View Fitness Certificate"
                                                    onClick={() => setPreviewModal({
                                                      open: true,
                                                      url: vehicle.insurance.documents.fitnessCertificate.url,
                                                      type: getFileType(vehicle.insurance.documents.fitnessCertificate.url),
                                                    })}
                                                  >
                                                    <FiEye />
                                                  </button>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                        {/* Insurance Document */}
                                        {vehicle.insurance.documents.insurance && (
                                          <div className="bg-white border rounded-xl p-4 w-60 flex flex-col gap-2 relative">
                                            <div className="flex items-center gap-2">
                                              <span className="font-medium text-sm">Insurance</span>
                                              <span className="ml-auto text-xs text-gray-400">{vehicle.insurance.documents.insurance.name}</span>
                                            </div>
                                            <div className="flex flex-col items-center mt-2">
                                              <span className="text-xs text-gray-500">{vehicle.insurance.documents.insurance.url ? 'Available' : 'Not available'}</span>
                                              {vehicle.insurance.documents.insurance.size && (
                                                <span className="text-xs text-gray-400">{(vehicle.insurance.documents.insurance.size / 1024).toFixed(1)} KB</span>
                                              )}
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                              {vehicle.insurance.documents.insurance.url && (
                                                <>
                                                  <button
                                                    className="text-blue-500 hover:text-blue-700"
                                                    title="Download Insurance"
                                                    onClick={() => handleDownloadFile(vehicle.insurance.documents.insurance.url, vehicle.insurance.documents.insurance.name || 'insurance.pdf')}
                                                  >
                                                    <FiDownload />
                                                  </button>
                                                  <button
                                                    className="text-blue-500 hover:text-blue-700"
                                                    title="View Insurance"
                                                    onClick={() => setPreviewModal({
                                                      open: true,
                                                      url: vehicle.insurance.documents.insurance.url,
                                                      type: getFileType(vehicle.insurance.documents.insurance.url),
                                                    })}
                                                  >
                                                    <FiEye />
                                                  </button>
                                                </>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="text-gray-400">No documents available</div>
                                    )}
                                  </div>

                                  {/* Notes Section */}
                                  {assignment.notes && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                      <div className="font-semibold text-sm text-gray-700 mb-1">Notes:</div>
                                      <div className="text-sm text-gray-600">{assignment.notes}</div>
                                    </div>
                                  )}

                                  {/* Vehicle Condition */}
                                  {assignment.returnVehicleCondition?.description && (
                                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                      <div className="font-semibold text-sm text-gray-700 mb-1">Vehicle Condition:</div>
                                      <div className="text-sm text-gray-600">{assignment.returnVehicleCondition.description}</div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                      {vehicleAssignments.filter((assignment: any) => assignment.status === 'assigned').length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <div className="text-gray-500 mb-4">
                            <div className="text-lg font-medium mb-2">No vehicle currently assigned</div>
                            <div className="text-sm">This user is not currently assigned to any vehicle.</div>
                          </div>
                          <Button variant="primary" onClick={() => setShowAssignModal(true)}>
                            Assign New Vehicle
                          </Button>
                        </div>
                      )}
                      {/* Vehicle History */}
                      {vehicleAssignments.length > 0 && (
                        <div className="mb-8">
                          <h3 className="text-lg font-semibold mb-4 text-gray-800">Vehicle Assignment History</h3>
                          <div className="space-y-4">
                            {vehicleAssignments
                              .filter((assignment: any) => assignment.status !== 'assigned')
                              .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
                              .map((assignment: any, idx: number) => {
                                const vehicle = assignment.vehicle;
                                if (!vehicle) return null;

                                return (
                                  <div key={assignment._id || idx} className="p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-3">
                                        <span className="font-semibold text-gray-900">{vehicle.vehicleNumber}</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${assignment.status === 'returned' ? 'bg-blue-100 text-blue-800' :
                                          assignment.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                            assignment.status === 'damaged' ? 'bg-red-100 text-red-800' :
                                              assignment.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                                                'bg-gray-100 text-gray-800'
                                          }`}>
                                          {assignment.status?.charAt(0).toUpperCase() + assignment.status?.slice(1)}
                                        </span>
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {assignment.updatedAt ? new Date(assignment.updatedAt).toLocaleDateString() :
                                          assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : 'N/A'}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                      <div><b>Model:</b> {vehicle.vehicleModel?.name || 'N/A'}</div>
                                      <div><b>Type:</b> {vehicle.vehicleType?.name || 'N/A'}</div>
                                      <div><b>Assigned:</b> {assignment.assignmentDate ? new Date(assignment.assignmentDate).toLocaleDateString() : 'N/A'}</div>
                                      <div><b>Hub:</b> {vehicle.hub?.name || 'N/A'}</div>
                                    </div>
                                    {assignment.notes && (
                                      <div className="mt-2 text-sm text-gray-600">
                                        <b>Notes:</b> {assignment.notes}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}

                      {/* Assign New Vehicle Section */}

                      <Modal open={showAssignModal} onClose={handleCloseAssignModal}>
                        <div className="p-6 w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Assign Vehicle</h3>
                            <button
                              onClick={handleCloseAssignModal}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <FiX size={20} />
                            </button>
                          </div>

                          {/* Search and Filters */}
                          <div className="mb-4 space-y-3">
                            {/* Search Bar */}
                            <div className="relative">
                              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search by vehicle number, model, type, hub, or city..."
                                value={vehicleSearchTerm}
                                onChange={(e) => setVehicleSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-2 gap-3">
                              <select
                                value={vehicleFilterType}
                                onChange={(e) => setVehicleFilterType(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">All Vehicle Types</option>
                                {getUniqueVehicleTypes().map((type: string) => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>

                              <select
                                value={vehicleFilterCity}
                                onChange={(e) => setVehicleFilterCity(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="">All Cities</option>
                                {getUniqueCities().map((city: string) => (
                                  <option key={city} value={city}>{city}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Vehicle List */}
                          <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                            {loadingAvailableVehicles ? (
                              <div className="p-4 text-center text-gray-500">Loading vehicles...</div>
                            ) : (
                              <div className="max-h-96 overflow-y-auto">
                                {getFilteredVehicles().length === 0 ? (
                                  <div className="p-4 text-center text-gray-500">
                                    {vehicleSearchTerm || vehicleFilterType || vehicleFilterCity
                                      ? "No vehicles match your search criteria"
                                      : "No vehicles available"}
                                  </div>
                                ) : (
                                  <div className="divide-y divide-gray-200">
                                    {getFilteredVehicles().map((vehicle: any) => (
                                      <div
                                        key={vehicle._id || vehicle.vehicleNumber}
                                        className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors ${selectedVehicle === vehicle.vehicleNumber ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                                          }`}
                                        onClick={() => setSelectedVehicle(vehicle.vehicleNumber)}
                                      >
                                        <div className="flex justify-between items-start">
                                          <div className="flex-1">
                                            <div className="font-semibold text-gray-900">
                                              {vehicle.vehicleNumber}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                              {vehicle.vehicleModel?.name} • {vehicle.vehicleType?.name}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {vehicle.hub?.name} • {vehicle.city?.name}
                                            </div>
                                          </div>
                                          {selectedVehicle === vehicle.vehicleNumber && (
                                            <div className="text-blue-500">
                                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                              </svg>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Results Count */}
                          <div className="mt-2 text-xs text-gray-500">
                            Showing {getFilteredVehicles().length} of {availableVehicles.length} vehicles
                          </div>

                          {/* Action Buttons */}
                          <div className="flex space-x-3 mt-4 pt-4 border-t">
                            <Button
                              variant="secondary"
                              onClick={handleCloseAssignModal}
                              disabled={assignLoading}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              onClick={handleAssignVehicle}
                              disabled={!selectedVehicle || assignLoading}
                              className="flex-1"
                            >
                              {assignLoading ? "Assigning..." : "Assign Vehicle"}
                            </Button>
                          </div>
                        </div>
                      </Modal>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 4 && (
                <div className="space-y-4">
                  {role &&
                    assignedUser.map((item: any) => {
                      const userData: any =
                        role === "SUPERVISOR"
                          ? item["rider"]
                          : item["supervisor"];

                      return (
                        // ...existing code...
                        <div
                          key={item._id}
                          className="p-4 rounded-xl shadow-lg bg-white flex flex-col md:flex-row items-center justify-between gap-4 transition hover:shadow-xl"
                        >
                          <div
                            className="flex items-center gap-4 w-full md:w-auto cursor-pointer"
                            onClick={() => handleProfileClick(userData._id)}
                          >
                            <img
                              src={userData.profilePicture}
                              alt="Supervisor"
                              className="w-14 h-14 rounded-full object-cover border-2 border-blue-100 shadow"
                            />
                            <div>
                              <button
                                className="text-base cursor-pointer font-semibold text-blue-600 hover:underline focus:outline-none transition"
                                title="View Profile"
                              >
                                {userData.name}
                              </button>
                              <div className="text-xs text-gray-500 mt-1">
                                <span className="font-medium">Code:</span>{" "}
                                {userData.profileCode}
                              </div>
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Status:</span>{" "}
                                {userData.status}
                              </div>
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Language:</span>{" "}
                                {userData.language}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                <span className="font-medium">
                                  Assigned At:
                                </span>{" "}
                                {new Date(item.assignedAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row gap-2 mt-4 md:mt-0">
                            <button
                              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg border border-red-200 hover:bg-red-100 transition font-medium"
                              // onClick={() => handleUnassign(userData._id)}
                              title="Unassign"
                            >
                              Unassign
                            </button>
                          </div>
                        </div>
                        // ...existing code...
                      );
                    })}
                </div>
              )}
            </>
            {/* )} */}
          </div>
        </div>
      </div>
      <Modal open={!!previewModal?.open} onClose={() => setPreviewModal(null)}>
        {previewModal?.type === "pdf" ? (
          <iframe
            src={previewModal.url}
            title="PDF Preview"
            className="w-[80vw] h-[80vh]"
          />
        ) : (
          <img
            src={previewModal?.url}
            alt="Document Preview"
            className="max-w-[80vw] max-h-[80vh] rounded-lg"
          />
        )}
      </Modal>



      <RejectUserModal
        isRejecting={createOrUpdateDocRemark.isPending}
        onAddOrUpdteRemark={onAddOrUpdteRemark}
        setShowRejectModal={setShowRejectModal}
        showRejectModal={showRejectModal}
        remarks={remarks}
      />

      {/* Deactivate Confirmation Modal */}
      <Modal
        open={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
      >
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
              {isRejecting ? "Deactivating..." : "Confirm Deactivate"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Vehicle Status Modal */}
      <VehicleStatusModal
        open={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedAssignment(null);
        }}
        onSubmit={handleVehicleStatusUpdate}
        loading={updateVehicleStatus.isPending}
        assignment={selectedAssignment}
      />
    </Layout>
  );
};

export default AddUser;
