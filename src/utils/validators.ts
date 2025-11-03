/**
 * Validation utility functions
 */

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;

export const phoneRegex = /^[0-9+\-\s()]+$/;

export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  return emailRegex.test(email);
};

/**
 * Validate CNIC format (Pakistan)
 */
export const isValidCnic = (cnic: string): boolean => {
  return cnicRegex.test(cnic);
};

/**
 * Validate phone number format
 */
export const isValidPhone = (phone: string): boolean => {
  return phoneRegex.test(phone);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  return passwordRegex.test(password);
};

/**
 * Format CNIC string
 */
export const formatCnic = (cnic: string): string => {
  // Remove all non-digits
  const digits = cnic.replace(/\D/g, '');
  
  // Format as 12345-1234567-1
  if (digits.length === 13) {
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  }
  
  return cnic;
};

