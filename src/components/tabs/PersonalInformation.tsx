import React, { useState, useRef, useEffect } from "react";
import InputField from "../InputField";
import Button from "../Button";
import { toast } from "react-toastify";
import { formatDateForInput, formatDateForBackend } from "../../utils/dateUtils";
import {
  useUpdateUserPersonalDetails,
  useUploadProfilePicture,
} from "../../hooks/useUpdateUser";
import { useFetchBusinessPartners } from "../../hooks/useFetchBusinessPartners";
import Modal from "../Modal";

interface PersonalInformationProps {
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
  setHasChanges: React.Dispatch<React.SetStateAction<{
    personal: boolean;
    bank: boolean;
    vehicle: boolean;
    documents: boolean;
    assets: boolean;
  }>>;
}

const PersonalInformation: React.FC<PersonalInformationProps> = ({
  userId,
  userData,
  onTabChange,
  hasChanges,
  setHasChanges,
}) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Hooks
  const updateUserPersonalDetails = useUpdateUserPersonalDetails();
  const uploadProfilePicture = useUploadProfilePicture();
  const { data: businessPartnersData, isLoading: loadingBusinessPartners } = useFetchBusinessPartners();

  // Refs
  const profilePictureInputRef = useRef<HTMLInputElement>(null);

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
  const [businessPartner, setBusinessPartner] = useState("");

  // Profile picture state
  const [profilePicturePreview, setProfilePicturePreview] = useState<any>(null);

  // Profile picture preview modal state
  const [profilePictureModal, setProfilePictureModal] = useState<{
    open: boolean;
    url: string;
    name: string;
  } | null>(null);

  // Initialize form data from userData
  useEffect(() => {
    if (userData) {
      setFullName(userData.name || "");
      setPhone(userData.authRef?.identifier || "");
      setDob(formatDateForInput(userData.document?.aadhaar?.ocrFront?.dob || ""));
      setGender(userData.document?.aadhaar?.ocrFront?.gender || "");
      setFather(userData.fatherName || "");
      setAddress(userData?.addressRef?.address || "");
      setCity(userData?.addressRef?.cityDistrict || "");
      setPin(userData?.addressRef?.pinCode || "");
      setState(userData?.addressRef?.state || "");
      setBusinessPartner(userData?.businessPartnerRef?._id || "");

      // Set profile picture preview from user data
      if (userData?.profilePicture && userData.profilePicture !== 'default.jpg') {
        setProfilePicturePreview({
          url: userData.profilePicture,
          name: 'Profile Picture',
          size: 'N/A',
        });
      } else {
        // Clear preview if no profile picture or default
        setProfilePicturePreview(null);
      }
    }
  }, [userData]);

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

  // Profile picture change handler
  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }

      if (!userId) {
        toast.error("User ID not found");
        return;
      }

      try {
        // Upload the profile picture immediately
        await uploadProfilePicture.mutateAsync({
          userId: String(userId),
          file: file,
        });

        toast.success("Profile picture uploaded successfully!");
        setHasChanges((prev) => ({ ...prev, personal: false }));
      } catch (error: any) {
        toast.error(`Failed to upload profile picture: ${error.message}`);
        // Clear the file input
        if (e.target) {
          e.target.value = '';
        }
      }
    }
  };

  // Save personal information
  const handleSavePersonalInfo = async () => {
    if (!userId) return;

    if (!validatePersonalInfo()) {
      return;
    }

    setSaving(true);

    try {
      const personalData: any = {
        fullName: fullName,
        dob: formatDateForBackend(dob),
        gender: gender.toLowerCase(),
        fatherName: father,
        businessPartnerRef: businessPartner || undefined,
        address: {
          address: address,
          cityDistrict: city,
          pinCode: pin,
          state,
        },
      };

      await updateUserPersonalDetails.mutateAsync({
        userId: String(userId),
        data: personalData,
      });

      setSaving(false);
      toast.success("Personal information updated successfully!");
      setHasChanges((prev) => ({ ...prev, personal: false }));
      
      setTimeout(() => {
        onTabChange(1); // Move to next tab
      }, 2000);
    } catch (error: any) {
      setSaving(false);
      toast.error(`Failed to save personal information: ${error.message}`);
    }
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
      <Button
        variant="primary"
        onClick={onSave}
        disabled={saving}
      >
        {saving ? "Saving..." : saveText}
      </Button>
    </div>
  );

  return (
    <div>
      <div className="text-xl font-semibold mb-4">
        Personal Details
      </div>
      
      {/* Profile Picture Section */}
      <div className="mb-6">
        <div className="text-base font-semibold mb-4">Profile Picture</div>
        <div className="flex items-center gap-6">
          {/* Current Profile Picture */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <div 
                className={`w-24 h-24 rounded-full border-2 border-gray-300 overflow-hidden bg-gray-100 ${profilePicturePreview ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                onClick={() => {
                  if (profilePicturePreview) {
                    setProfilePictureModal({
                      open: true,
                      url: profilePicturePreview.url,
                      name: profilePicturePreview.name || 'Profile Picture'
                    });
                  }
                }}
              >
                {profilePicturePreview ? (
                  <img
                    src={profilePicturePreview.url}
                    alt="Profile Picture"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-semibold">
                    {fullName ? fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              {uploadProfilePicture.isPending && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="text-white text-xs">Uploading...</div>
                </div>
              )}
            </div>
            <span className="text-sm text-gray-600">
              {profilePicturePreview ? 'Click to view' : 'Current Picture'}
            </span>
          </div>

          {/* Upload New Picture */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => profilePictureInputRef.current?.click()}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-sm font-medium"
              disabled={uploadProfilePicture.isPending}
            >
              {uploadProfilePicture.isPending ? 'Uploading...' : 'Upload Picture'}
            </button>
            <input
              type="file"
              ref={profilePictureInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleProfilePictureChange}
            />
            <div className="text-xs text-gray-400">
              Max size: 5MB, Formats: JPG, PNG, GIF
            </div>
          </div>
        </div>
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
        <InputField
          label="Business Partner"
          value={businessPartner}
          onChange={(e) => {
            setBusinessPartner(e.target.value);
            setHasChanges((prev) => ({
              ...prev,
              personal: true,
            }));
          }}
          type="select"
          options={[
            ...((businessPartnersData as any)?.data?.map((partner: any) => ({
              label: `${partner.name} (${partner.code})`,
              value: partner._id,
            })) || []),
          ]}
          disabled={loadingBusinessPartners}
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-4">{error}</div>
      )}

      <ActionButtons onSave={handleSavePersonalInfo} saveText="Save & Next" />

      {/* Profile Picture Preview Modal */}
      <Modal
        open={!!profilePictureModal?.open} 
        onClose={() => setProfilePictureModal(null)}
        title={`Profile Picture - ${profilePictureModal?.name || 'User'}`}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={profilePictureModal?.url}
              alt="Profile Picture Preview"
              className="max-w-full max-h-96 rounded-lg shadow-lg object-contain"
            />
          </div>
          <div className="flex justify-center mt-4">
            <Button
              variant="secondary"
              onClick={() => setProfilePictureModal(null)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PersonalInformation;
