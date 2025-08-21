import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';
import Button from './Button';
import { FiDownload, FiLoader } from 'react-icons/fi';

interface Vehicle {
  _id: string;
  vehicleNumber: string;
  vehicleModel?: { name: string };
  vehicleType?: { name: string };
  city?: { name: string };
}

interface BulkQRCodeGeneratorProps {
  vehicles: Vehicle[];
  onClose: () => void;
}

const BulkQRCodeGenerator: React.FC<BulkQRCodeGeneratorProps> = ({
  vehicles,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedVehicles, setSelectedVehicles] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const qrRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Initialize all vehicles as selected by default
  React.useEffect(() => {
    setSelectedVehicles(new Set(vehicles.map(v => v._id)));
  }, [vehicles]);

  const handleSelectAll = () => {
    if (selectedVehicles.size === vehicles.length) {
      setSelectedVehicles(new Set());
    } else {
      setSelectedVehicles(new Set(vehicles.map(v => v._id)));
    }
  };

  const handleSelectVehicle = (vehicleId: string) => {
    const newSelected = new Set(selectedVehicles);
    if (newSelected.has(vehicleId)) {
      newSelected.delete(vehicleId);
    } else {
      newSelected.add(vehicleId);
    }
    setSelectedVehicles(newSelected);
  };

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle => {
    const searchLower = searchTerm.toLowerCase();
    return (
      vehicle.vehicleNumber.toLowerCase().includes(searchLower) ||
      vehicle.vehicleModel?.name?.toLowerCase().includes(searchLower) ||
      vehicle.vehicleType?.name?.toLowerCase().includes(searchLower) ||
      vehicle.city?.name?.toLowerCase().includes(searchLower)
    );
  });

  // Handle select all filtered vehicles
  const handleSelectAllFiltered = () => {
    const filteredIds = new Set(filteredVehicles.map(v => v._id));
    const selectedFiltered = filteredVehicles.filter(v => selectedVehicles.has(v._id));
    
    if (selectedFiltered.length === filteredVehicles.length) {
      // Deselect all filtered
      const newSelected = new Set(selectedVehicles);
      filteredIds.forEach(id => newSelected.delete(id));
      setSelectedVehicles(newSelected);
    } else {
      // Select all filtered
      const newSelected = new Set(selectedVehicles);
      filteredIds.forEach(id => newSelected.add(id));
      setSelectedVehicles(newSelected);
    }
  };

  const generatePDF = async () => {
    const selectedVehiclesList = vehicles.filter(v => selectedVehicles.has(v._id));
    
    if (!selectedVehiclesList.length) {
      alert('Please select at least one vehicle to generate QR codes for.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const qrSize = 40; // QR code size in mm
      const textHeight = 12; // Text height in mm (increased from 10)
      const spacing = 15; // Spacing between QR codes
      
      const qrCodesPerRow = Math.floor((pageWidth - 2 * margin) / (qrSize + spacing));
      const qrCodesPerPage = qrCodesPerRow * Math.floor((pageHeight - 2 * margin) / (qrSize + textHeight + spacing));
      
      let currentPage = 1;
      let currentRow = 0;
      let currentCol = 0;

      // Add title to first page
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Vehicle QR Codes', pageWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, 25, { align: 'center' });
      pdf.text(`Total Vehicles: ${selectedVehiclesList.length}`, pageWidth / 2, 32, { align: 'center' });

      for (let i = 0; i < selectedVehiclesList.length; i++) {
        const vehicle = selectedVehiclesList[i];
        const qrRef = qrRefs.current[vehicle._id];
        
        if (!qrRef) {
          console.warn(`QR ref not found for vehicle ${vehicle._id}`);
          continue;
        }

        // Check if we need a new page
        if (i > 0 && i % qrCodesPerPage === 0) {
          pdf.addPage();
          currentPage++;
          currentRow = 0;
          currentCol = 0;
        }

        // Calculate position
        const x = margin + currentCol * (qrSize + spacing);
        const y = margin + 50 + currentRow * (qrSize + textHeight + spacing); // 50 for title space (increased from 40)

        // Generate QR code as image
        const svg = qrRef.querySelector('svg');
        if (svg) {
          const serializer = new XMLSerializer();
          const svgString = serializer.serializeToString(svg);
          
          // Convert SVG to image
          const img = new window.Image();
          await new Promise((resolve) => {
            img.onload = resolve;
            img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgString)));
          });

          // Create canvas to convert to base64
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = qrSize * 3; // Higher resolution
            canvas.height = qrSize * 3;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            const imgData = canvas.toDataURL('image/png');
            pdf.addImage(imgData, 'PNG', x, y, qrSize, qrSize);
          }
        }

        // Add vehicle information
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Vehicle: ${vehicle.vehicleNumber}`, x + qrSize / 2, y + qrSize + 5, { align: 'center' });
        
        // Add model if available
        if (vehicle.vehicleModel?.name) {
          pdf.setFontSize(7);
          pdf.text(`Vehicle Model: ${vehicle.vehicleModel.name}`, x + qrSize / 2, y + qrSize + 10, { align: 'center' });
        }

        // Update position for next QR code
        currentCol++;
        if (currentCol >= qrCodesPerRow) {
          currentCol = 0;
          currentRow++;
        }

        // Update progress
        setProgress(((i + 1) / selectedVehiclesList.length) * 100);
      }

      // Save the PDF
      const fileName = `vehicle-qr-codes-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Generate All Vehicle QR Codes</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-700 mb-2">
                Select vehicles to generate QR codes for. Currently <strong>{selectedVehicles.size}</strong> of <strong>{vehicles.length}</strong> vehicles selected.
              </p>
              <p className="text-sm text-gray-500">
                Each QR code will contain the vehicle number and can be scanned to identify the vehicle.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={generatePDF}
              disabled={isGenerating || selectedVehicles.size === 0}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <FiDownload className="w-4 h-4" />
                  Generate PDF ({selectedVehicles.size})
                </>
              )}
            </Button>
          </div>

          {/* Search and Selection Controls */}
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search vehicles by number, model, type, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Selection Controls */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedVehicles.size === vehicles.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {selectedVehicles.size === vehicles.length ? 'Deselect All' : 'Select All'}
                  </span>
                </label>
                <span className="text-sm text-gray-500">
                  ({selectedVehicles.size} of {vehicles.length} selected)
                </span>
              </div>

              {/* Filtered Selection Controls */}
              {searchTerm && filteredVehicles.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">
                    Showing {filteredVehicles.length} of {vehicles.length} vehicles
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filteredVehicles.every(v => selectedVehicles.has(v._id))}
                      onChange={handleSelectAllFiltered}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {filteredVehicles.every(v => selectedVehicles.has(v._id)) ? 'Deselect Filtered' : 'Select Filtered'}
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {isGenerating && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}

          {progress > 0 && isGenerating && (
            <p className="text-sm text-gray-600 text-center">
              Progress: {Math.round(progress)}% ({Math.round((progress / 100) * selectedVehicles.size)} of {selectedVehicles.size} vehicles)
            </p>
          )}
        </div>

        {/* Preview Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
          {filteredVehicles.length === 0 && searchTerm ? (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No vehicles found matching "{searchTerm}"</p>
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-800 text-sm mt-2"
              >
                Clear search
              </button>
            </div>
          ) : (
            filteredVehicles.map((vehicle) => (
            <div 
              key={vehicle._id}
              ref={(el) => {
                qrRefs.current[vehicle._id] = el;
              }}
              className={`bg-white p-3 rounded-lg border text-center relative ${
                selectedVehicles.has(vehicle._id) ? 'ring-2 ring-blue-500' : 'opacity-60'
              }`}
            >
              {/* Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedVehicles.has(vehicle._id)}
                  onChange={() => handleSelectVehicle(vehicle._id)}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              
              <div className="bg-white p-2 rounded border">
                <QRCode 
                  value={vehicle.vehicleNumber} 
                  size={60}
                  level="M"
                />
              </div>
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {vehicle.vehicleNumber}
                </p>
                {vehicle.vehicleModel?.name && (
                  <p className="text-xs text-gray-500 truncate">
                    Vehicle Model: {vehicle.vehicleModel.name}
                  </p>
                )}
              </div>
            </div>
          ))
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            The PDF will contain selected QR codes arranged in a grid format, with vehicle information displayed below each QR code.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Use the search bar to find specific vehicles. Selected vehicles are highlighted with a blue border. Unselected vehicles appear dimmed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BulkQRCodeGenerator;
