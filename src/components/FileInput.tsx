import React from 'react';

interface FileInputProps {
  label: string;
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file?: File | null;
}

const FileInput: React.FC<FileInputProps> = ({ label, name, onChange, file }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <div className="flex items-center gap-3">
      <label className="cursor-pointer bg-indigo-50 border border-indigo-200 px-4 py-2 rounded-lg text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors">
        {file ? 'Replace File' : 'Upload File'}
        <input
          type="file"
          name={name}
          onChange={onChange}
          className="hidden"
        />
      </label>
      {file && (
        <span className="text-xs text-gray-600 truncate max-w-[160px]">{file.name}</span>
      )}
    </div>
  </div>
);

export default FileInput; 