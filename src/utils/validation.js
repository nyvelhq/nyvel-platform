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

// ─── ADMIN-SPECIFIC VALIDATORS ────────────────────────────────────

/**
 * Safe property access with null checking
 */
export const safeProp = (obj, path, defaultValue = null) => {
  if (!obj || typeof obj !== 'object') return defaultValue;
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }
  return value !== undefined ? value : defaultValue;
};

/**
 * Validate platform name
 */
export const validatePlatformName = (name) => {
  if (!name || typeof name !== 'string') return 'Platform name is required';
  const trimmed = name.trim();
  if (trimmed.length < 2) return 'Platform name must be at least 2 characters';
  if (trimmed.length > 100) return 'Platform name must not exceed 100 characters';
  return null;
};

/**
 * Validate API rate limit
 */
export const validateRateLimit = (value) => {
  const error = validators.number(value, 1, 100000);
  return error || 'API rate limit must be between 1 and 100,000 requests/min';
};

/**
 * Validate timeout in seconds
 */
export const validateTimeout = (value) => {
  const error = validators.number(value, 1, 3600);
  return error || 'Timeout must be between 1 and 3600 seconds';
};

/**
 * Validate max concurrent tests
 */
export const validateConcurrentTests = (value) => {
  const error = validators.number(value, 1, 100000);
  return error || 'Concurrent tests must be between 1 and 100,000';
};

/**
 * Validate user object structure
 */
export const validateUser = (user, requiredFields = ['id', 'name', 'type', 'email', 'status']) => {
  if (!user || typeof user !== 'object') return false;

  // Check required fields exist
  if (!requiredFields.every(field => field in user)) {
    console.warn('User missing required fields:', { user, requiredFields });
    return false;
  }

  // Validate email if present
  if (user.email && validators.email(user.email)) {
    console.warn('Invalid email for user:', user.email);
    return false;
  }

  // Validate type
  if (user.type && !['Company', 'Tester'].includes(user.type)) {
    console.warn('Invalid user type:', user.type);
    return false;
  }

  // Validate status
  if (user.status && !['Active', 'Inactive'].includes(user.status)) {
    console.warn('Invalid user status:', user.status);
    return false;
  }

  return true;
};

/**
 * Validate test object structure
 */
export const validateTest = (test, requiredFields = ['id', 'name', 'company', 'type', 'status']) => {
  if (!test || typeof test !== 'object') return false;

  // Check required fields
  if (!requiredFields.every(field => field in test)) {
    console.warn('Test missing required fields:', { test, requiredFields });
    return false;
  }

  // Validate progress percentage if present
  if (test.progress !== undefined) {
    if (!Number.isInteger(test.progress) || test.progress < 0 || test.progress > 100) {
      console.warn('Invalid test progress:', test.progress);
      return false;
    }
  }

  // Validate status
  const validStatuses = ['Active', 'In Progress', 'Completed'];
  if (!validStatuses.includes(test.status)) {
    console.warn('Invalid test status:', test.status);
    return false;
  }

  // Validate numeric fields
  const numericFields = ['testers', 'target', 'issues', 'critical'];
  for (const field of numericFields) {
    if (field in test && (!Number.isInteger(test[field]) || test[field] < 0)) {
      console.warn(`Invalid numeric value for ${field}:`, test[field]);
      return false;
    }
  }

  return true;
};

/**
 * Validate array of users
 */
export const validateUsers = (users) => {
  if (!Array.isArray(users)) {
    console.warn('Users is not an array');
    return [];
  }
  return users.filter((user, index) => {
    if (!validateUser(user)) {
      console.warn(`Invalid user at index ${index}:`, user);
      return false;
    }
    return true;
  });
};

/**
 * Validate array of tests
 */
export const validateTests = (tests) => {
  if (!Array.isArray(tests)) {
    console.warn('Tests is not an array');
    return [];
  }
  return tests.filter((test, index) => {
    if (!validateTest(test)) {
      console.warn(`Invalid test at index ${index}:`, test);
      return false;
    }
    return true;
  });
};

/**
 * Format currency safely
 */
export const formatCurrency = (value, fallback = '$0') => {
  const num = Number(value);
  if (isNaN(num)) {
    console.warn('Invalid currency value:', value);
    return fallback;
  }
  return `$${num.toLocaleString()}`;
};

/**
 * Format number safely
 */
export const formatNumber = (value, fallback = '0') => {
  const num = Number(value);
  if (isNaN(num)) {
    console.warn('Invalid number value:', value);
    return fallback;
  }
  return num.toLocaleString();
};

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input, maxLength = 500) => {
  if (typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (trimmed.length > maxLength) {
    console.warn(`Input truncated from ${trimmed.length} to ${maxLength} characters`);
  }
  return trimmed.substring(0, maxLength);
};
