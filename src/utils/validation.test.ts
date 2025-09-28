import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidUrl,
  isEmptyString,
  hasMinLength,
  validateContactForm,
} from './validation';

describe('validation', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.org',
        'firstname.lastname@example.com',
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should return false for invalid emails', () => {
      const invalidEmails = [
        'invalid.email',
        '@example.com',
        'test@',
        'test@@example.com',
        'test@.com',
        'test@example.',
        '',
        'test space@example.com',
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'https://www.example.com/path?query=value',
        'https://subdomain.example.com',
        'https://example.com:8080',
      ];

      validUrls.forEach(url => {
        expect(isValidUrl(url)).toBe(true);
      });
    });

    it('should return false for invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'example.com',
        '',
        'https://',
      ];

      invalidUrls.forEach(url => {
        expect(isValidUrl(url)).toBe(false);
      });
    });

    it('should handle edge cases', () => {
      // https://. is technically valid according to URL constructor
      expect(isValidUrl('https://.')).toBe(true);
    });

    it('should handle different protocols', () => {
      // Note: ftp:// is actually valid for URL constructor
      expect(isValidUrl('ftp://example.com')).toBe(true);
      expect(isValidUrl('file:///path/to/file')).toBe(true);
    });
  });

  describe('isEmptyString', () => {
    it('should return true for empty or whitespace strings', () => {
      expect(isEmptyString('')).toBe(true);
      expect(isEmptyString('   ')).toBe(true);
      expect(isEmptyString('\t\n')).toBe(true);
    });

    it('should return false for non-empty strings', () => {
      expect(isEmptyString('hello')).toBe(false);
      expect(isEmptyString(' hello ')).toBe(false);
      expect(isEmptyString('0')).toBe(false);
    });
  });

  describe('hasMinLength', () => {
    it('should return true when string meets minimum length', () => {
      expect(hasMinLength('hello', 5)).toBe(true);
      expect(hasMinLength('hello world', 5)).toBe(true);
      expect(hasMinLength('  hello  ', 5)).toBe(true); // Trimmed length
    });

    it('should return false when string is shorter than minimum', () => {
      expect(hasMinLength('hi', 5)).toBe(false);
      expect(hasMinLength('', 1)).toBe(false);
      expect(hasMinLength('   ', 1)).toBe(false); // Trimmed length
    });
  });

  describe('validateContactForm', () => {
    it('should return valid for correct form data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a valid message that is long enough.',
      };

      const result = validateContactForm(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return errors for missing name', () => {
      const data = {
        name: '',
        email: 'john@example.com',
        message: 'This is a valid message.',
      };

      const result = validateContactForm(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required');
    });

    it('should return errors for missing email', () => {
      const data = {
        name: 'John Doe',
        email: '',
        message: 'This is a valid message.',
      };

      const result = validateContactForm(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required');
    });

    it('should return errors for invalid email format', () => {
      const data = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'This is a valid message.',
      };

      const result = validateContactForm(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email format is invalid');
    });

    it('should return errors for missing message', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        message: '',
      };

      const result = validateContactForm(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message is required');
    });

    it('should return errors for short message', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Short',
      };

      const result = validateContactForm(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message must be at least 10 characters long');
    });

    it('should return multiple errors when multiple fields are invalid', () => {
      const data = {
        name: '',
        email: 'invalid-email',
        message: 'short',
      };

      const result = validateContactForm(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain('Name is required');
      expect(result.errors).toContain('Email format is invalid');
      expect(result.errors).toContain('Message must be at least 10 characters long');
    });
  });
});