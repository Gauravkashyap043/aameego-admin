import React, { useState, useRef, useEffect } from 'react';

type SearchableSelectProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
    placeholder?: string;
    error?: string;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    className?: string;
};

const SearchableSelect: React.FC<SearchableSelectProps> = ({
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Select...',
    error = '',
    name,
    required = false,
    disabled = false,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState(options);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    console.log(name)
    // Filter options based on search term
    useEffect(() => {
        const filtered = options.filter(option =>
            (option.label || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOptions(filtered);
    }, [searchTerm, options]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Reset highlighted index when filtered options change
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [filteredOptions]);

    const selectedOption = options.find(option => option.value === value && option.label);

    const handleSelect = (option: { label: string; value: string }) => {
        onChange(option.value);
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggle();
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setIsOpen(false);
                setSearchTerm('');
                setHighlightedIndex(-1);
                break;
        }
    };

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                setSearchTerm('');
            }
        }
    };

    return (
        <div style={{ marginBottom: 18, width: '100%' }} className={className} ref={dropdownRef}>
            <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#222' }}>
                {label} {required && <span style={{ color: 'red' }}>*</span>}
            </label>

            <div style={{ position: 'relative' }}>
                <button
                    type="button"
                    onClick={handleToggle}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    style={{
                        width: '100%',
                        padding: 10,
                        border: error ? '1.5px solid #FF3B3B' : '1.5px solid #E0E0E0',
                        borderRadius: 8,
                        fontSize: 16,
                        background: disabled ? '#F5F5F5' : '#fff',
                        textAlign: 'left',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <span style={{ color: selectedOption ? '#222' : '#999' }}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    <svg
                        width="12"
                        height="8"
                        viewBox="0 0 12 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                        }}
                    >
                        <path d="M1 1L6 6L11 1" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>

                {isOpen && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            backgroundColor: '#fff',
                            border: '1.5px solid #E0E0E0',
                            borderRadius: 8,
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            zIndex: 1000,
                            maxHeight: 300,
                            overflow: 'hidden',
                        }}
                    >
                        {/* Search Input */}
                        <div style={{ padding: 8, borderBottom: '1px solid #E0E0E0' }}>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search..."
                                style={{
                                    width: '100%',
                                    padding: 8,
                                    border: '1px solid #E0E0E0',
                                    borderRadius: 4,
                                    fontSize: 14,
                                }}
                                autoFocus
                            />
                        </div>

                        {/* Options List */}
                        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option, index) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        style={{
                                            width: '100%',
                                            padding: '10px 12px',
                                            border: 'none',
                                            background: index === highlightedIndex ? '#e3f2fd' : 'transparent',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: 14,
                                            color: '#222',
                                            borderBottom: '1px solid #f0f0f0',
                                        }}
                                        onMouseEnter={() => {
                                            setHighlightedIndex(index);
                                        }}
                                        onMouseLeave={() => {
                                            setHighlightedIndex(-1);
                                        }}
                                    >
                                        {option.label}
                                    </button>
                                ))
                            ) : (
                                <div
                                    style={{
                                        padding: '12px',
                                        textAlign: 'center',
                                        color: '#666',
                                        fontSize: 14,
                                    }}
                                >
                                    No options found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && <div style={{ color: '#FF3B3B', fontSize: 13, marginTop: 4 }}>{error}</div>}
        </div>
    );
};

export default SearchableSelect;
