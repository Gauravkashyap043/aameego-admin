import { useEffect, useState } from "react";
import Modal from "../Modal";
import Button from "../Button";
import type { Remark } from "../../types";

const remarkOptions = {
  personal: [
    { field: "fullName", label: "Full name is missing or incorrect" },
    { field: "dob", label: "Date of Birth is missing or incorrect" },
    { field: "gender", label: "Gender is missing or incorrect" },
    { field: "fatherName", label: "Father name is missing or incorrect" },
    { field: "address", label: "Address is incomplete" },
    { field: "city", label: "City/District is invalid" },
    { field: "pincode", label: "Pincode is invalid" },
    { field: "state", label: "State is invalid" },
  ],
  bank: [
    { field: "bankName", label: "Bank name is missing or incorrect" },
    { field: "fullName", label: "Account holder name mismatch" },
    { field: "accountNumber", label: "Account number is incorrect" },
    { field: "ifsc", label: "IFSC code is invalid" },
    { field: "documentImage", label: "Passbook/Cheque image is unclear" },
  ],
  document: [
    { field: "aadharNumber", label: "Aadhar number is invalid" },
    { field: "aadharFront", label: "Aadhar front image is unclear" },
    { field: "aadharBack", label: "Aadhar back image is unclear" },
    { field: "panNumber", label: "PAN number is invalid" },
    { field: "panImage", label: "PAN card image is unclear" },
    { field: "dlNumber", label: "License number is invalid" },
    { field: "dlFront", label: "License front image is unclear" },
    { field: "dlBack", label: "License back image is unclear" },
  ],
};

export function RejectUserModal({
  showRejectModal,
  setShowRejectModal,
  isRejecting,
  onAddOrUpdteRemark,
  remarks,
}: {
  showRejectModal: boolean;
  setShowRejectModal: (val: boolean) => void;
  isRejecting: boolean;
  onAddOrUpdteRemark: (remarks: Remark[]) => void;
  remarks: Remark[];
}) {
  const [selectedRemarks, setSelectedRemarks] = useState<{
    [key: string]: Set<string>;
  }>({
    personal: new Set(),
    bank: new Set(),
    document: new Set(),
  });

  const hasRemark = remarks && remarks.length > 0;

  // ✅ Populate selected remarks on mount or remarks change
  useEffect(() => {
    const initialSelected: {
      [key: string]: Set<string>;
    } = {
      personal: new Set(),
      bank: new Set(),
      document: new Set(),
    };

    for (const remark of remarks || []) {
      if (remark.section in initialSelected) {
        initialSelected[remark.section].add(remark.field);
      }
    }

    setSelectedRemarks(initialSelected);
  }, [remarks]);

  const toggleField = (section: string, field: string) => {
    setSelectedRemarks((prev) => {
      const updated = new Set(prev[section]);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      updated.has(field) ? updated.delete(field) : updated.add(field);
      return { ...prev, [section]: updated };
    });
  };

  const buildRemarks = () => {
    const allRemarks: Remark[] = [];

    for (const section of Object.keys(selectedRemarks)) {
      selectedRemarks[section].forEach((field) => {
        const message =
          remarkOptions[section as keyof typeof remarkOptions].find(
            (r) => r.field === field
          )?.label || "";
        allRemarks.push({ section, field, message });
      });
    }

    return allRemarks;
  };

  const submit = () => {
    const builtRemarks = buildRemarks();
    onAddOrUpdteRemark(builtRemarks);
  };

  return (
    <Modal open={showRejectModal} onClose={() => setShowRejectModal(false)}>
      <div className="p-6 max-h-[80vh] overflow-y-auto">
        <h3 className="mb-4 text-lg font-semibold">
          {hasRemark ? "Update Rejection Remarks" : "Reject User"}
        </h3>
        <p className="mb-2 text-sm font-semibold">
          Select the reason for {hasRemark ? "updating" : "rejecting"} the user.
        </p>

        {(["personal", "bank", "document"] as const).map((section) => (
          <div key={section} className="mb-4">
            <h4 className="text-sm font-semibold capitalize mb-2">
              {section.replace(/^\w/, (c) => c.toUpperCase())} Details
            </h4>
            {remarkOptions[section].map((opt) => (
              <label
                key={opt.field}
                className="ml-4 flex items-center mb-1 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedRemarks[section].has(opt.field)}
                  onChange={() => toggleField(section, opt.field)}
                  className="mr-2"
                />
                {opt.label}
              </label>
            ))}
          </div>
        ))}

        <div className="flex space-x-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowRejectModal(false)}
            disabled={isRejecting}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={submit} disabled={isRejecting}>
            {isRejecting
              ? hasRemark
                ? "Updating..."
                : "Rejecting..."
              : hasRemark
              ? "Update Remarks"
              : "Confirm Reject"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
