import React, { useState, useRef, useEffect } from "react";
import InputField from "../InputField";
import Button from "../Button";
import { toast } from "react-toastify";
import Modal from "../Modal";
import { useUpdateDocument } from "../../hooks/useUpdateUser";
import { Download, Eye } from "lucide-react";

interface BankInformationProps {
  userId: string;
  userData: any;
  onTabChange: (tab: number) => void;
  hasChanges: {
    personal: boolean;
    bank: boolean;
    vehicle: boolean;
    documents: boolean;
    assets: boolean;
  };
  setHasChanges: React.Dispatch<
    React.SetStateAction<{
      personal: boolean;
      bank: boolean;
      vehicle: boolean;
      documents: boolean;
      assets: boolean;
    }>
  >;
  onDeactivate: () => void; // ✅ added prop for deactivate handler
}

type PreviewFile = {
  url: string;
  name: string;
  size?: string | number;
  isPdf?: boolean;
};

const BankInformation: React.FC<BankInformationProps> = ({
  userId,
  userData,
  onTabChange,
  hasChanges,
  setHasChanges,
  onDeactivate, // ✅ destructured here
}) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [bankName, setBankName] = useState("");
  const [bankFullName, setBankFullName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");

  // Uploaded documents
  const [passbookFile, setPassbookFile] = useState<File | null>(null);
  const [chequeFile, setChequeFile] = useState<File | null>(null);
  const [passbookPreview, setPassbookPreview] = useState<PreviewFile | null>(
    null
  );
  const [chequePreview, setChequePreview] = useState<PreviewFile | null>(null);

  // File input refs
  const passbookInputRef = useRef<HTMLInputElement>(null);
  const chequeInputRef = useRef<HTMLInputElement>(null);

  // Preview modal
  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    url?: string;
    type?: "pdf" | "image";
  } | null>(null);

  // Hook
  const updateDocument = useUpdateDocument();

  // Initialize form data from userData
  useEffect(() => {
    if (userData?.bank) {
      setBankName(userData.bank.bankName || "");
      setBankFullName(userData.bank.bankFullName || "");
      setAccountNumber(userData.bank.accountNumber || "");
      setConfirmAccountNumber(userData.bank.accountNumber || "");
      setIfsc(userData.bank.ifsc || "");

      if (userData.bank.passbookUrl) {
        setPassbookPreview({
          url: userData.bank.passbookUrl,
          name: "Passbook",
          size: "N/A",
          isPdf: userData.bank.passbookUrl.endsWith(".pdf"),
        });
      }
      if (userData.bank.chequeUrl) {
        setChequePreview({
          url: userData.bank.chequeUrl,
          name: "Cheque",
          size: "N/A",
          isPdf: userData.bank.chequeUrl.endsWith(".pdf"),
        });
      }
    }
  }, [userData]);

  // Validation
  const validateBankInfo = () => {
    if (!bankName.trim()) {
      setError("Bank Name is required");
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

  // File select handler
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "passbook" | "cheque"
  ) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Invalid file type. Must be image or PDF.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB.");
      return;
    }

    const preview = {
      url: URL.createObjectURL(file),
      name: file.name,
      size: `${Math.round(file.size / 1024)} kb`,
      isPdf: file.type === "application/pdf",
    };

    if (type === "passbook") {
      setPassbookFile(file);
      setPassbookPreview(preview);
    } else {
      setChequeFile(file);
      setChequePreview(preview);
    }

    setHasChanges((prev) => ({ ...prev, bank: true }));
  };

  // Save bank info
  const handleSaveBankDetails = async () => {
    if (!validateBankInfo()) return;
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append(
        "bank",
        JSON.stringify({
          bankName,
          bankFullName,
          accountNumber,
          ifsc,
        })
      );
      if (passbookFile) formData.append("passbook", passbookFile);
      if (chequeFile) formData.append("cheque", chequeFile);
      formData.append("type", "bank");

      const response = await updateDocument.mutateAsync({ userId, formData });

      // ✅ Update local state so values persist
      if (response?.bank) {
        setBankName(response.bank.bankName || "");
        setBankFullName(response.bank.bankFullName || "");
        setAccountNumber(response.bank.accountNumber || "");
        setConfirmAccountNumber(response.bank.accountNumber || "");
        setIfsc(response.bank.ifsc || "");

        if (response.bank.passbookUrl) {
          setPassbookPreview({
            url: response.bank.passbookUrl,
            name: "Passbook",
            size: "N/A",
            isPdf: response.bank.passbookUrl.endsWith(".pdf"),
          });
        }
        if (response.bank.chequeUrl) {
          setChequePreview({
            url: response.bank.chequeUrl,
            name: "Cheque",
            size: "N/A",
            isPdf: response.bank.chequeUrl.endsWith(".pdf"),
          });
        }
      }

      setSaving(false);
      setHasChanges((prev) => ({ ...prev, bank: false }));
      toast.success("Bank details updated successfully");
      setTimeout(() => onTabChange(2), 1000);
    } catch (err: any) {
      setSaving(false);
      toast.error(err.message || "Failed to save bank details");
    }
  };

  return (
    <div>
      <div className="text-xl font-semibold mb-4">Bank Details</div>

      {/* Bank input fields */}
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
          label="Account Holder Name"
          value={bankFullName}
          onChange={(e) => {
            setBankFullName(e.target.value);
            setHasChanges((prev) => ({ ...prev, bank: true }));
          }}
          placeholder="Enter full name"
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

      {/* Uploaded Documents section */}
      <div className="mt-8">
        <div className="font-semibold mb-2">Uploaded Documents</div>
        <div className="flex flex-wrap gap-4">
          {passbookPreview && (
            <div className="bg-white border rounded-xl p-4 w-52 flex flex-col items-center">
              <div className="flex justify-between w-full mb-2">
                <span className="font-medium text-red-500">Bank Passbook</span>
                <span className="text-gray-500 text-xs">
                  {passbookPreview.size || "N/A"}
                </span>
              </div>
              {passbookPreview.isPdf ? (
                <span className="text-red-500 text-4xl">PDF</span>
              ) : (
                <img
                  src={passbookPreview.url}
                  className="w-24 h-24 object-cover rounded border"
                />
              )}
              <span className="mt-2 text-sm">Passbook</span>
              <div className="flex gap-3 mt-2">
                <a
                  href={passbookPreview.url}
                  download
                  className="text-blue-500"
                >
                  <Download size={18} />
                </a>
                <button
                  onClick={() =>
                    setPreviewModal({
                      open: true,
                      url: passbookPreview.url,
                      type: passbookPreview.isPdf ? "pdf" : "image",
                    })
                  }
                  className="text-gray-600"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>
          )}

          {chequePreview && (
            <div className="bg-white border rounded-xl p-4 w-52 flex flex-col items-center">
              <div className="flex justify-between w-full mb-2">
                <span className="font-medium text-red-500">
                  Cancelled Cheque
                </span>
                <span className="text-gray-500 text-xs">
                  {chequePreview.size || "N/A"}
                </span>
              </div>
              {chequePreview.isPdf ? (
                <span className="text-red-500 text-4xl">PDF</span>
              ) : (
                <img
                  src={chequePreview.url}
                  className="w-24 h-24 object-cover rounded border"
                />
              )}
              <span className="mt-2 text-sm">Cheque</span>
              <div className="flex gap-3 mt-2">
                <a href={chequePreview.url} download className="text-blue-500">
                  <Download size={18} />
                </a>
                <button
                  onClick={() =>
                    setPreviewModal({
                      open: true,
                      url: chequePreview.url,
                      type: chequePreview.isPdf ? "pdf" : "image",
                    })
                  }
                  className="text-gray-600"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Inputs (dashed placeholders) */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => passbookInputRef.current?.click()}
          className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition"
        >
          <span className="text-gray-500">Upload Bank Passbook</span>
          <input
            type="file"
            ref={passbookInputRef}
            className="hidden"
            onChange={(e) => handleFileSelect(e, "passbook")}
          />
        </div>

        <div
          onClick={() => chequeInputRef.current?.click()}
          className="flex items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition"
        >
          <span className="text-gray-500">Upload Cancelled Cheque</span>
          <input
            type="file"
            ref={chequeInputRef}
            className="hidden"
            onChange={(e) => handleFileSelect(e, "cheque")}
          />
        </div>
      </div>

      {error && <div className="text-red-500 text-sm mt-4">{error}</div>}

      {/* Buttons */}
      <div className="flex justify-start gap-4 mt-8">
        <Button variant="danger" onClick={onDeactivate}>
          Deactivate
        </Button>
        <Button
          variant="primary"
          onClick={handleSaveBankDetails}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save & Next"}
        </Button>
      </div>

      {/* Preview Modal */}
      <Modal
        open={!!previewModal?.open}
        onClose={() => setPreviewModal(null)}
        title="Document Preview"
      >
        {previewModal?.type === "pdf" ? (
          <iframe src={previewModal.url} className="w-full h-96" />
        ) : (
          <img
            src={previewModal?.url}
            className="max-w-full max-h-96 rounded-lg object-contain"
          />
        )}
      </Modal>
    </div>
  );
};

export default BankInformation;
