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
  const qrRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const generatePDF = async () => {
    if (!vehicles.length) {
      alert('No vehicles found to generate QR codes for.');
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
      pdf.text(`Total Vehicles: ${vehicles.length}`, pageWidth / 2, 32, { align: 'center' });

      for (let i = 0; i < vehicles.length; i++) {
        const vehicle = vehicles[i];
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
        setProgress(((i + 1) / vehicles.length) * 100);
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
                This will generate QR codes for all <strong>{vehicles.length}</strong> vehicles and create a PDF document.
              </p>
              <p className="text-sm text-gray-500">
                Each QR code will contain the vehicle number and can be scanned to identify the vehicle.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={generatePDF}
              disabled={isGenerating || vehicles.length === 0}
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
                  Generate PDF
                </>
              )}
            </Button>
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
              Progress: {Math.round(progress)}% ({Math.round((progress / 100) * vehicles.length)} of {vehicles.length} vehicles)
            </p>
          )}
        </div>

        {/* Preview Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
          {vehicles.map((vehicle) => (
            <div 
              key={vehicle._id}
              ref={(el) => {
                qrRefs.current[vehicle._id] = el;
              }}
              className="bg-white p-3 rounded-lg border text-center"
            >
              <div className="bg-white p-2 rounded border">
                <QRCode 
                  value={vehicle.vehicleNumber} 
                  size={60}
                  level="M"
                />
              </div>
              <div className="mt-2">
                <p className="text-xs font-medium text-gray-900 truncate">
                  Vehicle: {vehicle.vehicleNumber}
                </p>
                {vehicle.vehicleModel?.name && (
                  <p className="text-xs text-gray-500 truncate">
                    Vehicle Model: {vehicle.vehicleModel.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            The PDF will contain all QR codes arranged in a grid format, with vehicle information displayed below each QR code.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BulkQRCodeGenerator;
