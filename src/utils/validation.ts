/**
 * Utility functions for validation
 */

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isEmptyString(value: string): boolean {
  return !value || value.trim().length === 0;
}

export function hasMinLength(value: string, minLength: number): boolean {
  return value.trim().length >= minLength;
}

export function validateContactForm(data: {
  name: string;
  email: string;
  message: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (isEmptyString(data.name)) {
    errors.push('Name is required');
  }

  if (isEmptyString(data.email)) {
    errors.push('Email is required');
  } else if (!isValidEmail(data.email)) {
    errors.push('Email format is invalid');
  }

  if (isEmptyString(data.message)) {
    errors.push('Message is required');
  } else if (!hasMinLength(data.message, 10)) {
    errors.push('Message must be at least 10 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}