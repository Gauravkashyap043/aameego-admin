import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';

const VehicleQR: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const canvas = document.createElement('canvas');
    const img = new window.Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngFile;
        downloadLink.download = `vehicle-qr-${vehicleId}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgString)));
  };

  if (!vehicleId) {
    return <div>No Vehicle ID provided.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f6f7ff]">
      <div className="bg-white p-8 rounded-xl shadow flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-4 text-[#3B36FF]">Vehicle QR Code</h2>
        <div ref={qrRef} className="bg-white p-4 rounded">
          <QRCode value={vehicleId} size={256} />
        </div>
        <button
          onClick={handleDownload}
          className="mt-6 px-6 py-2 bg-[#3B36FF] text-white rounded-lg font-semibold hover:bg-[#2a28b3] transition-colors"
        >
          Download QR
        </button>
        <div className="mt-4 text-gray-500 text-sm">Vehicle ID: {vehicleId}</div>
      </div>
    </div>
  );
};

export default VehicleQR; 