import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children, title }) => {
  if (!open) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={handleOverlayClick} 
    >
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[340px] max-w-full relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          ×
        </button>
        {title && <h2 className="text-xl font-semibold mb-4 text-indigo-700">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
