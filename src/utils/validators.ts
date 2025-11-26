/**
 * Validate Egyptian phone number
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(010|011|012|015)\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate email address
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate required field
 */
export const validateRequired = (value: string | number | null | undefined): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
};

/**
 * Validate positive number
 */
export const validatePositiveNumber = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

/**
 * Validate date range
 */
export const validateDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

/**
 * Get validation error message
 */
export const getValidationError = (field: string, type: 'required' | 'email' | 'phone' | 'positive' | 'dateRange'): string => {
  const messages = {
    required: `${field} مطلوب`,
    email: 'البريد الإلكتروني غير صحيح',
    phone: 'رقم الهاتف غير صحيح',
    positive: `${field} يجب أن يكون أكبر من صفر`,
    dateRange: 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية',
  };
  return messages[type];
};
