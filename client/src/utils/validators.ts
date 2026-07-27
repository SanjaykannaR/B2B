// This file is for: Validation utility functions
// Module: Frontend Utilities (Module 10)
// Owner: Developer 2 (Web Frontend Engineer)

/**
 * Validates email format
 */
export const validateEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validates phone format (basic digits and length check)
 */
export const validatePhone = (phone: string | null | undefined): boolean => {
  if (!phone) return false;
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

/**
 * Validates that value is not empty, null, or undefined
 */
export const validateRequired = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

/**
 * Validates that value is a positive number
 */
export const validatePositiveNumber = (value: any): boolean => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};

/**
 * Validates string minimum length
 */
export const validateMinLength = (value: string | null | undefined, min: number): boolean => {
  if (!value) return false;
  return value.trim().length >= min;
};

/**
 * Validates password complexity
 */
export const validatePassword = (password: string | null | undefined): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (!password) {
    errors.push('Password is required');
    return { valid: false, errors };
  }
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates Manifest Create wizard form data
 */
export interface ManifestFormData {
  clientId?: string;
  origin?: string;
  destination?: string;
  pickupDate?: string;
  deliveryDate?: string;
  description?: string;
  weight?: string | number;
  volume?: string | number;
  itemCount?: string | number;
  hazmat?: boolean;
  vehicleId?: string;
}

export const validateManifestForm = (data: ManifestFormData): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!validateRequired(data.clientId)) {
    errors.clientId = 'Client is required';
  }
  if (!validateRequired(data.origin)) {
    errors.origin = 'Origin address is required';
  }
  if (!validateRequired(data.destination)) {
    errors.destination = 'Destination address is required';
  }
  if (!validateRequired(data.pickupDate)) {
    errors.pickupDate = 'Pickup date is required';
  }
  if (!validateRequired(data.deliveryDate)) {
    errors.deliveryDate = 'Delivery date is required';
  } else if (data.pickupDate && data.deliveryDate && new Date(data.deliveryDate) < new Date(data.pickupDate)) {
    errors.deliveryDate = 'Delivery date cannot be before pickup date';
  }

  if (!validateRequired(data.description)) {
    errors.description = 'Cargo description is required';
  }
  if (!validateRequired(data.weight) || !validatePositiveNumber(data.weight)) {
    errors.weight = 'Weight must be a positive number';
  }
  if (!validateRequired(data.volume) || !validatePositiveNumber(data.volume)) {
    errors.volume = 'Volume must be a positive number';
  }
  if (!validateRequired(data.itemCount) || !validatePositiveNumber(data.itemCount)) {
    errors.itemCount = 'Item count must be a positive number';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};
