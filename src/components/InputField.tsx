import React from 'react';

type InputFieldProps = {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: 'text' | 'date' | 'select' | 'textarea';
  options?: { label: string; value: string }[]; // for select
  placeholder?: string;
  error?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number; // for textarea
  className?: string;
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  options = [],
  placeholder = '',
  error = '',
  name,
  required = false,
  disabled = false,
  rows = 3,
  className = '',
}) => {
  return (
    <div style={{ marginBottom: 18, width: '100%' }} className={className}>
      <label style={{ fontWeight: 500, marginBottom: 6, display: 'block', color: '#222' }}>
        {label} {required && <span style={{ color: 'red' }}>*</span>}
      </label>
      {type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{
            width: '100%',
            padding: 10,
            border: error ? '1.5px solid #FF3B3B' : '1.5px solid #E0E0E0',
            borderRadius: 8,
            fontSize: 16,
            background: disabled ? '#F5F5F5' : '#fff',
          }}
        >
          <option value="">Select</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          style={{
            width: '100%',
            padding: 10,
            border: error ? '1.5px solid #FF3B3B' : '1.5px solid #E0E0E0',
            borderRadius: 8,
            fontSize: 16,
            background: disabled ? '#F5F5F5' : '#fff',
            resize: 'vertical',
          }}
        />
      ) : (
        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            padding: 10,
            border: error ? '1.5px solid #FF3B3B' : '1.5px solid #E0E0E0',
            borderRadius: 8,
            fontSize: 16,
            background: disabled ? '#F5F5F5' : '#fff',
          }}
        />
      )}
      {error && <div style={{ color: '#FF3B3B', fontSize: 13, marginTop: 4 }}>{error}</div>}
    </div>
  );
};

export default InputField; 