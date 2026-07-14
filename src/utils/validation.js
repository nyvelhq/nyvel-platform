/**
 * Validation utility functions for form inputs
 * Provides consistent validation rules and error messages
 */

export const validators = {
  /**
   * Check if a field is required and not empty
   */
  required: (value) => {
    const trimmed = typeof value === 'string' ? value.trim() : value;
    return !trimmed ? 'This field is required' : null;
  },

  /**
   * Validate email format
   */
  email: (value) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? 'Please enter a valid email address' : null;
  },

  /**
   * Validate URL format
   */
  url: (value) => {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  /**
   * Validate number is within min/max range
   */
  number: (value, min = null, max = null) => {
    if (value === '' || value === null) return null;
    const num = Number(value);
    if (isNaN(num)) {
      return 'Please enter a valid number';
    }
    if (min !== null && num < min) {
      return `Value must be at least ${min}`;
    }
    if (max !== null && num > max) {
      return `Value must be at most ${max}`;
    }
    return null;
  },

  /**
   * Validate minimum length
   */
  minLength: (value, min) => {
    if (!value) return null;
    return value.length < min ? `Must be at least ${min} characters` : null;
  },

  /**
   * Validate maximum length
   */
  maxLength: (value, max) => {
    if (!value) return null;
    return value.length > max ? `Must not exceed ${max} characters` : null;
  },

  /**
   * Validate that value is numeric only
   */
  numeric: (value) => {
    if (!value) return null;
    return /^-?\d+(\.\d+)?$/.test(value) ? null : 'Please enter only numbers';
  },

  /**
   * Validate that value is alphabetic only
   */
  alpha: (value) => {
    if (!value) return null;
    return /^[a-zA-Z\s'-]+$/.test(value) ? null : 'Please enter only letters';
  },

  /**
   * Validate alphanumeric
   */
  alphanumeric: (value) => {
    if (!value) return null;
    return /^[a-zA-Z0-9\s'-]+$/.test(value) ? null : 'Please enter only letters and numbers';
  },

  /**
   * Validate date is in future
   */
  futureDate: (value, comparedDate = null) => {
    if (!value) return null;
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return 'Date must be in the future';
    }
    if (comparedDate && new Date(comparedDate) > date) {
      return 'End date must be on or after the start date';
    }
    return null;
  },

  /**
   * Validate date is not in past
   */
  notPastDate: (value) => {
    if (!value) return null;
    const date = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today ? 'Date cannot be in the past' : null;
  },

  /**
   * Validate phone number (basic US format)
   */
  phone: (value) => {
    if (!value) return null;
    const phoneRegex = /^[\d\s\-()+]+$/.test(value) && value.replace(/\D/g, '').length >= 10;
    return !phoneRegex ? 'Please enter a valid phone number' : null;
  },

  /**
   * Validate password strength
   */
  password: (value) => {
    if (!value) return null;
    if (value.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[A-Z]/.test(value)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(value)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/\d/.test(value)) {
      return 'Password must contain at least one number';
    }
    return null;
  },

  /**
   * Validate that two values match
   */
  match: (value, matchValue, fieldName = 'passwords') => {
    if (!value || !matchValue) return null;
    return value !== matchValue ? `${fieldName} do not match` : null;
  },

  /**
   * Validate age is within range
   */
  ageRange: (value, minAge = 18, maxAge = 120) => {
    if (!value) return null;
    const age = Number(value);
    if (isNaN(age)) {
      return 'Please enter a valid age';
    }
    if (age < minAge) {
      return `Age must be at least ${minAge}`;
    }
    if (age > maxAge) {
      return `Age must be at most ${maxAge}`;
    }
    return null;
  },
};

/**
 * Compose multiple validators for a single field
 */
export const composeValidators = (validatorFunctions) => {
  return (value) => {
    for (const validator of validatorFunctions) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
};

/**
 * Validate an entire form object
 */
export const validateForm = (formData, rules) => {
  const errors = {};

  Object.entries(rules).forEach(([field, validator]) => {
    const error = validator(formData[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

/**
 * Check if form has any errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Format validation error for display
 */
export const formatError = (error) => {
  if (!error) return '';
  return typeof error === 'string' ? error : 'Invalid input';
};
