import React, { useState, useEffect } from 'react';

interface ActionItem {
  label: string;
  onClick: () => void;
  className?: string;
}

interface ActionDropdownProps {
  items: ActionItem[];
  className?: string;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ items, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.action-dropdown-container')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleItemClick = (onClick: () => void) => {
    onClick();
    setIsOpen(false);
  };

  return (
    <div className={`relative action-dropdown-container ${className}`}>
      <button
        className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1"
        onClick={toggleDropdown}
        type="button"
      >
        Actions <span>▼</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded shadow-lg z-[9999]">
          {items.map((item, index) => (
            <button
              key={index}
              className={`block w-full text-left px-4 py-2 hover:bg-indigo-50 ${item.className || ''}`}
              onClick={() => handleItemClick(item.onClick)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionDropdown; 