import React, { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

type FilterDropdownProps = {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
};

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  options,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [menuWidth, setMenuWidth] = useState<number | "auto">("auto");
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const selected = options.find((opt) => opt.value === value);

  // Ensure dropdown width >= trigger width
  useEffect(() => {
    if (buttonRef.current) {
      setMenuWidth(buttonRef.current.offsetWidth);
    }
  }, [buttonRef.current]);

  return (
    <div className="relative inline-block">
      {/* Trigger */}
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="flex items-center bg-indigo-50 px-3 py-2 rounded-lg text-xs shadow-sm cursor-pointer min-w-[100px]"
      >
        <span className="text-gray-500 mr-1">{label}:</span>
        <span className="font-medium text-gray-700 truncate max-w-[120px]">
          {selected?.label}
        </span>
        <FiChevronDown
          size={14}
          className={`ml-1 transition-transform ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className="absolute mt-1 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden"
          style={{ minWidth: menuWidth, maxWidth: 200 }}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors 
                  ${
                    isSelected
                      ? "bg-indigo-50 text-indigo-600 font-medium border-l-2 border-indigo-500"
                      : "text-gray-700"
                  } 
                  hover:bg-indigo-50 hover:text-indigo-600 whitespace-nowrap`}
                style={{
                  borderTopLeftRadius: idx === 0 ? "0.5rem" : undefined,
                  borderTopRightRadius: idx === 0 ? "0.5rem" : undefined,
                  borderBottomLeftRadius:
                    idx === options.length - 1 ? "0.5rem" : undefined,
                  borderBottomRightRadius:
                    idx === options.length - 1 ? "0.5rem" : undefined,
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterDropdown;
