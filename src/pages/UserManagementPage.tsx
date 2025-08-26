import React, { useState } from "react";
import { UserTable } from "../components/UserTable";
import { Copy } from "lucide-react";

type Status = "Verified" | "Pending" | "pending" | "deactivated" | "Rejected";

type BaseUser = {
  id: string;
  name: string;
  phone: string;
  address: string;
  dob: string;
  aadhaar: string;
  vehicleNo: string;
  status: Status;
  avatar?: string;
  profileCode?: string;
  dlNumber?: string;
};

type User = BaseUser & { supervisor: string };
type Supervisor = BaseUser & { hubLocation: string };

// Dummy Data
const dummyRiders: User[] = Array.from({ length: 10 }, (_, i) => ({
  id: `${i + 1}`,
  name: `Rider ${i + 1}`,
  phone: `+91 987654321${i}`,
  address: "Noida, Uttar Pradesh",
  dob: "12-04-2025",
  aadhaar: "123456789012",
  vehicleNo: `UP82 AB${1000 + i}`,
  supervisor: `Supervisor ${i + 1}`,
  status: ["Verified", "Pending", "deactivated", "Rejected"][i % 4] as Status,
  avatar: `https://i.pravatar.cc/100?img=${i + 5}`,
  profileCode: `ABCD${1000 + i}`,
  dlNumber: `DL132020000${1000 + i}`,
}));

const dummySupervisors: Supervisor[] = Array.from({ length: 8 }, (_, i) => ({
  id: `${i + 1}`,
  name: `Supervisor ${i + 1}`,
  phone: `+91 912345678${i}`,
  address: "Delhi, India",
  hubLocation: `Hub Location ${i + 1}`,
  dob: "15-06-1990",
  aadhaar: "987654321098",
  dlNumber: `DL132020000${1000 + i}`,
  vehicleNo: `UP81 XY${2000 + i}`,
  status: ["Verified", "pending", "deactivated", "Rejected"][i % 4] as Status,
  avatar: `https://i.pravatar.cc/100?img=${i + 20}`,
  profileCode: `SUP${2000 + i}`,
}));

// Helpers
const statusColors: Record<Status, string> = {
  Verified: "bg-green-100 text-green-600",
  Pending: "bg-yellow-100 text-yellow-600",
  pending: "bg-yellow-100 text-yellow-600",
  deactivated: "bg-gray-200 text-gray-700",
  Rejected: "bg-red-100 text-red-600",
};

const renderStatus = (value: Status) => (
  <span
    className={`px-1 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap ${
      statusColors[value] || "bg-gray-100 text-gray-600"
    }`}
  >
    ● {value}
  </span>
);

const renderNameCell = (
  avatar: string | undefined,
  name: string,
  profileCode?: string,
  extraInfo?: string
) => (
  <div className="flex items-center gap-2 min-w-[100px] md:min-w-[140px] lg:min-w-[180px] max-w-[200px]">
    <img src={avatar} alt={name} className="w-6 h-6 rounded-full border object-cover" />
    <div className="overflow-hidden">
      <p className="font-medium text-[11px] text-indigo-700 truncate">{name}</p>
      {profileCode && (
        <p className="text-[9px] text-gray-500 flex items-center gap-1 truncate">
          Code:
          <span className="font-semibold text-blue-600">{profileCode}</span>
          <button
            onClick={() => navigator.clipboard.writeText(profileCode)}
            className="text-gray-400 hover:text-gray-600"
            title="Copy Profile Code"
          >
            <Copy size={10} />
          </button>
        </p>
      )}
      {extraInfo && <p className="text-[9px] text-gray-400 truncate">{extraInfo}</p>}
    </div>
  </div>
);

// Columns
const getColumns = (type: "rider" | "supervisor") => {
  const common = [
    {
      key: "name",
      title: "Name",
      render: (_: any, row: any) =>
        renderNameCell(row.avatar, row.name, row.profileCode, row.dlNumber),
    },
    { key: "phone", title: "Phone" },
    { key: "address", title: "Address", className: "whitespace-normal break-words max-w-[150px]" },
  ];

  const extra =
    type === "rider"
      ? [
          { key: "dob", title: "DOB" },
          { key: "aadhaar", title: "Aadhaar #", className: "whitespace-normal break-words max-w-[140px]" },
          { key: "vehicleNo", title: "Vehicle #" },
          { key: "supervisor", title: "Supervisor" },
        ]
      : [
          { key: "hubLocation", title: "Hub Location", className: "whitespace-normal break-words max-w-[150px]" },
          { key: "dob", title: "DOB" },
          { key: "aadhaar", title: "Aadhaar #", className: "whitespace-normal break-words max-w-[140px]" },
          { key: "vehicleNo", title: "Vehicle #" },
        ];

  return [...common, ...extra, { key: "status", title: "Status", render: renderStatus }];
};

// Main
export default function UserManagementPage() {
  const [selectedTab, setSelectedTab] = useState<"riders" | "supervisors">("riders");
  const [selected, setSelected] = useState<any[]>([]);

  const data = selectedTab === "riders" ? dummyRiders : dummySupervisors;
  const columns = getColumns(selectedTab === "riders" ? "rider" : "supervisor");

  return (
    <div className="p-2 md:p-3 lg:p-4 overflow-hidden">
      {/* Tabs */}
      <div className="flex md:flex-row border-b mb-2 gap-2">
        {["riders", "supervisors"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setSelectedTab(tab as any);
              setSelected([]);
            }}
            className={`px-3 py-1 font-medium text-xs transition-colors ${
              selectedTab === tab ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Mobile (<640px) */}
      <div className="sm:hidden">
        <UserTable<any>
          columns={columns}
          data={data}
          rowsPerPage={5}
          onActionClick={(item) => alert(`Clicked: ${item.name}`)}
          onSelectionChange={setSelected}
        />
      </div>

      {/* Desktop (≥640px) */}
      <div className="hidden sm:block w-full overflow-x-auto">
        <div className="min-w-[600px] md:min-w-[720px] lg:min-w-[820px]">
          <UserTable<any>
            columns={columns}
            data={data}
            rowsPerPage={7}
            onActionClick={(item) => alert(`Clicked: ${item.name}`)}
            onSelectionChange={setSelected}
          />
        </div>
      </div>

      {selected.length > 0 && (
        <div className="mt-2 p-2 bg-indigo-50 rounded-md">
          <p className="text-[11px] text-indigo-700">
            Selected {selectedTab}: {selected.map((u) => u.name).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
