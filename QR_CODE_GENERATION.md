# Vehicle QR Code Generation Feature

## Overview
This feature allows administrators to generate QR codes for all vehicles in the system and export them as a PDF document. Each QR code contains the vehicle number and can be scanned to identify the vehicle.

## Features

### Individual QR Code Generation
- Generate QR codes for individual vehicles
- Download as PNG image
- Includes vehicle number and basic information

### Bulk QR Code Generation
- Generate QR codes for all vehicles at once
- Export as PDF document with multiple QR codes per page
- Includes vehicle information (number, model, type, city) below each QR code
- Progress indicator during generation
- Preview of all QR codes before generation

## How to Use

### Individual QR Codes
1. Navigate to the Vehicle Master page
2. Click on the "Generate QR" action for any vehicle
3. A modal will open showing the QR code
4. Click "Download QR Code" to save as PNG

### Bulk QR Codes
1. Navigate to the Vehicle Master page
2. Click the "Import All Vehicle QR" button in the top right
3. A modal will open showing all vehicle QR codes
4. Click "Generate PDF" to create and download the PDF
5. The PDF will contain all QR codes arranged in a grid format

## Technical Details

### Backend API
- New endpoint: `GET /vehicle/qr-generation`
- Optimized to return only necessary fields for QR generation
- Supports search and filter parameters
- Returns minimal data to improve performance

### Frontend Components
- `BulkQRCodeGenerator`: Main component for bulk QR generation
- `QRCodeGenerator`: Component for individual QR codes
- Uses `react-qr-code` for QR generation
- Uses `jspdf` for PDF creation

### PDF Layout
- A4 page size
- Grid layout with multiple QR codes per page
- Vehicle information displayed below each QR code
- Automatic page breaks for large numbers of vehicles
- Title page with generation date and total count

## File Structure
```
src/
├── components/
│   ├── BulkQRCodeGenerator.tsx    # Bulk QR generation component
│   └── QRCodeGenerator.tsx        # Individual QR generation component
├── hooks/
│   └── useVehicles.ts             # Updated with useAllVehicles hook
└── pages/
    └── VehicleMaster.tsx          # Updated with bulk QR functionality
```

## Dependencies
- `react-qr-code`: QR code generation
- `jspdf`: PDF creation
- `react-icons/fi`: Icons

## Browser Compatibility
- Modern browsers with ES6+ support
- Requires Canvas API for PDF generation
- Requires SVG support for QR code rendering
