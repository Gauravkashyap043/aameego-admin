export interface Remark {
  section: string;
  field: string;
  message: string;
}

export interface CreateDocRemarkPayload {
  userId: string;
  remarks: Remark[];
}


export interface City {
  _id: string;
  name: string;
  state: string;
  country: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Hub {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Supervisor {
  _id: string;
  authRef: string;
  __v: number;
  createdAt: string;
  isActive: boolean;
  isVerified: boolean;
  language: string;
  profilePicture: string;
  role: string;
  twoFactorEnabled: boolean;
  updatedAt: string;
  profileCode: string;
  name: string;
  document: string;
  addressRef: string;
  dob: string;
  fatherName: string;
  gender: string;
  status: string;
}

export interface VehicleType {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface OEM {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface VehicleModel {
  _id: string;
  name: string;
  description: string;
  oem: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface BatteryType {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface VehicleOwnership {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface VehicleVendor {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Auth {
  _id: string;
  identifier: string;
  method: string;
  status: string;
  ipAddress: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  accountRef: string;
  lastLoginAt: string;
  otp: {
    code: string;
    expiresAt: string;
    verified: boolean;
  };
  steps: {
    enteredIdentifier: boolean;
    verifiedOtpOrPassword: boolean;
    verifiedAccount: boolean;
    enteredUserDetails: boolean;
  };
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface Insurance {
  _id: string;
  vehicle: string;
  insuranceNumber: string;
  validTill: string;
  provider: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface VehicleCondition {
  description?: string;
  images: string[];
  videos: string[];
}

export interface CurrentAssignment {
  _id: string;
  vehicle: string;
  rider: string | null;
  assignedBy: string | null;
  status: string;
  assignmentDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  isActive: boolean;
  vehicleCondition: VehicleCondition;
  returnVehicleCondition: {
    images: string[];
    videos: string[];
  };
}

export interface Vehicle {
  _id: string;
  city: City;
  hub: Hub;
  supervisor: Supervisor;
  vehicleType: VehicleType;
  oem: OEM;
  vehicleModel: VehicleModel;
  vehicleModelVersion: string;
  batteryType: BatteryType;
  batteryCapacity: string;
  batteryNumber: string;
  chassisNumber: string;
  vehicleRCNumber: string;
  rcRegistrationDate: string;
  rcExpiryDate: string;
  fitnessCertificateNumber: string;
  manufacturingYear: number;
  fitnessCertificateExpDate: string;
  numberPlateStatus: "pending" | "available" | "rejected";
  vehicleNumber: string;
  invoiceNumber: string;
  invoiceAmount: number;
  invoiceDate: string;
  vehicleOwnership: VehicleOwnership;
  vehicleVendor: VehicleVendor;
  deliveryDate: string;
  addedBy: Auth;
  createdAt: string;
  updatedAt: string;
  __v: number;
  insurance: Insurance;
  currentAssignment: CurrentAssignment;
  vehicleStatus: "available" | "assigned" | "damaged" | "maintenance";
}
