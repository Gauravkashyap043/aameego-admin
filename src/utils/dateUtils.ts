// Date utility functions for handling DD/MM/YYYY format

/**
 * Converts a date string from DD/MM/YYYY format to YYYY-MM-DD format (for HTML date input)
 * @param dateString - Date in DD/MM/YYYY format
 * @returns Date in YYYY-MM-DD format
 */
export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  
  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Parse DD/MM/YYYY format
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  // If it's already in a different format, try to parse it
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  return '';
};

/**
 * Converts a date string from YYYY-MM-DD format to DD/MM/YYYY format (for backend)
 * @param dateString - Date in YYYY-MM-DD format
 * @returns Date in DD/MM/YYYY format
 */
export const formatDateForBackend = (dateString: string): string => {
  if (!dateString) return '';
  
  // If already in DD/MM/YYYY format, return as is
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return dateString;
  }
  
  // Parse YYYY-MM-DD format
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  return '';
};

/**
 * Converts a Date object to DD/MM/YYYY format
 * @param date - Date object
 * @returns Date in DD/MM/YYYY format
 */
export const formatDateObject = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Validates if a date string is in DD/MM/YYYY format
 * @param dateString - Date string to validate
 * @returns boolean indicating if the format is valid
 */
export const isValidDateFormat = (dateString: string): boolean => {
  if (!dateString) return false;
  
  // Check DD/MM/YYYY format
  const ddMmYyyyRegex = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
  if (ddMmYyyyRegex.test(dateString)) {
    return true;
  }
  
  // Check YYYY-MM-DD format
  const yyyyMmDdRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (yyyyMmDdRegex.test(dateString)) {
    return true;
  }
  
  return false;
}; 