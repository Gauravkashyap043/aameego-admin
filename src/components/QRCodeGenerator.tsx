import React, { useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import Button from './Button';

interface QRCodeGeneratorProps {
  value: string;
  title?: string;
  showDownload?: boolean;
  showPreview?: boolean;
  size?: number;
  className?: string;
  downloadFileName?: string;
  downloadText?: string;
  onDownload?: (file: Blob) => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  title = 'QR Code',
  showDownload = true,
  showPreview = true,
  size = 256,
  className = '',
  downloadFileName,
  downloadText = 'Download QR',
  onDownload,
}) => {
  const qrRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    if (!value || !qrRef.current) return;

    setIsDownloading(true);
    
    setTimeout(() => {
      const svg = qrRef.current?.querySelector('svg');
      if (!svg) {
        setIsDownloading(false);
        return;
      }

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      
      // Create canvas with margins
      const margin = 40;
      const qrSize = size;
      const textHeight = 60;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        setIsDownloading(false);
        return;
      }
      
      // Set canvas size with margins
      canvas.width = qrSize + (margin * 2);
      canvas.height = qrSize + textHeight + (margin * 2);
      
      // Fill background with white
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create image from SVG
      const img = new window.Image();
      img.onload = () => {
        // Draw QR code in center
        ctx.drawImage(img, margin, margin, qrSize, qrSize);
        
        // Add title and value text below QR code
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // Draw title
        ctx.fillText(title, canvas.width / 2, margin + qrSize + 10);
        
        // Draw value
        ctx.font = '18px Arial, sans-serif';
        ctx.fillText(value, canvas.width / 2, margin + qrSize + 40);
        
        // Convert to PNG and download
        canvas.toBlob((blob) => {
          if (blob) {
            if (onDownload) {
              onDownload(blob);
            } else {
              const url = URL.createObjectURL(blob);
              const downloadLink = document.createElement('a');
              downloadLink.href = url;
              downloadLink.download = downloadFileName || `qr-${value}.png`;
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);
              URL.revokeObjectURL(url);
            }
          }
          setIsDownloading(false);
        }, 'image/png');
      };
      
      img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(svgString)));
    }, 100); // Wait for QR to render
  };

  if (!value) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg ${className}`}>
        <div className="text-gray-500 text-center">
          <div className="text-lg font-medium mb-2">No Value Provided</div>
          <div className="text-sm">Please provide a value to generate QR code</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {showPreview && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-center mb-2">{title}</h3>
          <div ref={qrRef} className="bg-white p-4 rounded-lg border">
            <QRCode value={value} size={size} />
          </div>
          <div className="text-center mt-2 text-sm text-gray-600">
            Value: {value}
          </div>
        </div>
      )}
      
      {showDownload && (
        <Button
          variant="primary"
          onClick={handleDownload}
          disabled={isDownloading || !value}
          className="mt-4"
        >
          {isDownloading ? 'Generating...' : downloadText}
        </Button>
      )}
    </div>
  );
};

export default QRCodeGenerator;
