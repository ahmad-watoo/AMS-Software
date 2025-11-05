/**
 * Validation Utility Functions
 * 
 * This module provides validation functions for common data types used in the application,
 * with special focus on Pakistani-specific formats (CNIC, phone numbers).
 * 
 * @module utils/validators
 */

/**
 * Regular expression for validating email addresses.
 * Matches standard email format: user@domain.com
 */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Regular expression for validating Pakistani CNIC format.
 * Format: 12345-1234567-1 (5 digits, hyphen, 7 digits, hyphen, 1 digit)
 */
export const cnicRegex = /^[0-9]{5}-[0-9]{7}-[0-9]{1}$/;

/**
 * Regular expression for validating phone numbers.
 * Allows digits, plus signs, hyphens, spaces, and parentheses.
 * Used for international and Pakistani phone number formats.
 */
export const phoneRegex = /^[0-9+\-\s()]+$/;

/**
 * Regular expression for validating password strength.
 * Requirements:
 * - At least 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one digit
 * - At least one special character (@$!%*?&)
 */
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Validate Email Format
 * 
 * Checks if a string matches a valid email address format.
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email format is valid, false otherwise
 * 
 * @example
 * isValidEmail('user@example.com'); // true
 * isValidEmail('invalid-email'); // false
 */
export const isValidEmail = (email: string): boolean => {
  return emailRegex.test(email);
};

/**
 * Validate CNIC Format (Pakistan)
 * 
 * Validates Pakistani CNIC (Computerized National Identity Card) format.
 * Format: XXXXX-XXXXXXX-X (5 digits, hyphen, 7 digits, hyphen, 1 digit)
 * 
 * @param {string} cnic - CNIC number to validate
 * @returns {boolean} True if CNIC format is valid, false otherwise
 * 
 * @example
 * isValidCnic('12345-1234567-1'); // true
 * isValidCnic('12345-1234567'); // false (missing last digit)
 */
export const isValidCnic = (cnic: string): boolean => {
  return cnicRegex.test(cnic);
};

/**
 * Validate Phone Number Format
 * 
 * Validates phone number format. Accepts international formats with various separators.
 * 
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone format is valid, false otherwise
 * 
 * @example
 * isValidPhone('+92-300-1234567'); // true
 * isValidPhone('0300-1234567'); // true
 * isValidPhone('abc123'); // false
 */
export const isValidPhone = (phone: string): boolean => {
  return phoneRegex.test(phone);
};

/**
 * Validate Password Strength
 * 
 * Validates password against security requirements:
 * - Minimum 8 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one digit
 * - At least one special character
 * 
 * @param {string} password - Password to validate
 * @returns {boolean} True if password meets requirements, false otherwise
 * 
 * @example
 * isValidPassword('Password123!'); // true
 * isValidPassword('weak'); // false
 */
export const isValidPassword = (password: string): boolean => {
  return passwordRegex.test(password);
};

/**
 * Format CNIC String
 * 
 * Formats a CNIC string to standard Pakistani format: XXXXX-XXXXXXX-X
 * Removes all non-digit characters and applies proper formatting.
 * 
 * @param {string} cnic - CNIC string to format (can be with or without hyphens)
 * @returns {string} Formatted CNIC string, or original if invalid length
 * 
 * @example
 * formatCnic('1234512345671'); // '12345-1234567-1'
 * formatCnic('12345-1234567-1'); // '12345-1234567-1' (already formatted)
 * formatCnic('12345'); // '12345' (invalid length, returned as-is)
 */
export const formatCnic = (cnic: string): string => {
  // Remove all non-digit characters
  const digits = cnic.replace(/\D/g, '');
  
  // Format as 12345-1234567-1 if we have exactly 13 digits
  if (digits.length === 13) {
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  }
  
  // Return original if invalid length
  return cnic;
};
