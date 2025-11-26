/**
 * Format a number as Egyptian currency
 */
export const formatCurrency = (amount: number): string => {
  return `${amount.toLocaleString('ar-EG')} ج.م`;
};

/**
 * Format a date to Arabic locale
 */
export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  return dateObj.toLocaleDateString('ar-EG', defaultOptions);
};

/**
 * Format a date to short format (DD/MM/YYYY)
 */
export const formatDateShort = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

/**
 * Parse a number from Arabic numerals
 */
export const parseArabicNumber = (value: string): number => {
  const arabicNumerals = '٠١٢٣٤٥٦٧٨٩';
  const westernNumerals = '0123456789';
  
  let result = value;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(arabicNumerals[i], 'g'), westernNumerals[i]);
  }
  
  return parseFloat(result.replace(/,/g, ''));
};

/**
 * Generate a unique voucher number
 */
export const generateVoucherNumber = (prefix: string, count: number): string => {
  const year = new Date().getFullYear();
  const paddedCount = String(count).padStart(3, '0');
  return `${prefix}-${year}-${paddedCount}`;
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};
