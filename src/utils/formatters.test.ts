import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateShort,
  slugify,
  truncateText,
  capitalizeWords,
  getReadingTime,
} from './formatters';

describe('formatters', () => {
  describe('formatDate', () => {
    it('should format a Date object correctly', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toBe('January 15, 2024');
    });

    it('should format a date string correctly', () => {
      const result = formatDate('2024-01-15');
      expect(result).toBe('January 15, 2024');
    });

    it('should throw error for invalid date', () => {
      expect(() => formatDate('invalid-date')).toThrow('Invalid date provided');
    });
  });

  describe('formatDateShort', () => {
    it('should format a Date object in short format', () => {
      const date = new Date('2024-01-15');
      const result = formatDateShort(date);
      expect(result).toBe('Jan 2024');
    });

    it('should format a date string in short format', () => {
      const result = formatDateShort('2024-01-15');
      expect(result).toBe('Jan 2024');
    });

    it('should throw error for invalid date', () => {
      expect(() => formatDateShort('invalid-date')).toThrow('Invalid date provided');
    });
  });

  describe('slugify', () => {
    it('should convert text to slug format', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should handle special characters', () => {
      expect(slugify('Hello, World!')).toBe('hello-world');
    });

    it('should handle multiple spaces', () => {
      expect(slugify('Hello    World')).toBe('hello-world');
    });

    it('should handle leading and trailing spaces', () => {
      expect(slugify('  Hello World  ')).toBe('hello-world');
    });

    it('should handle underscores', () => {
      expect(slugify('hello_world_test')).toBe('hello-world-test');
    });

    it('should handle empty string', () => {
      expect(slugify('')).toBe('');
    });
  });

  describe('truncateText', () => {
    it('should truncate text longer than maxLength', () => {
      const text = 'This is a very long text that needs to be truncated';
      const result = truncateText(text, 20);
      expect(result).toBe('This is a very long...');
    });

    it('should return original text if shorter than maxLength', () => {
      const text = 'Short text';
      const result = truncateText(text, 20);
      expect(result).toBe('Short text');
    });

    it('should return original text if equal to maxLength', () => {
      const text = 'Exactly twenty chars';
      const result = truncateText(text, 20);
      expect(result).toBe('Exactly twenty chars');
    });

    it('should throw error for non-positive maxLength', () => {
      expect(() => truncateText('text', 0)).toThrow('Max length must be positive');
      expect(() => truncateText('text', -1)).toThrow('Max length must be positive');
    });
  });

  describe('capitalizeWords', () => {
    it('should capitalize first letter of each word', () => {
      expect(capitalizeWords('hello world')).toBe('Hello World');
    });

    it('should handle mixed case', () => {
      expect(capitalizeWords('hELLo WoRLD')).toBe('Hello World');
    });

    it('should handle single word', () => {
      expect(capitalizeWords('hello')).toBe('Hello');
    });

    it('should handle empty string', () => {
      expect(capitalizeWords('')).toBe('');
    });

    it('should handle multiple spaces', () => {
      expect(capitalizeWords('hello  world')).toBe('Hello  World');
    });
  });

  describe('getReadingTime', () => {
    it('should calculate reading time for short content', () => {
      const content = 'This is a short piece of content with about twenty words here to test the function.';
      const result = getReadingTime(content);
      expect(result).toBe(1); // Should round up to 1 minute
    });

    it('should calculate reading time for longer content', () => {
      const words = Array(400).fill('word').join(' '); // 400 words
      const result = getReadingTime(words);
      expect(result).toBe(2); // 400 words / 200 wpm = 2 minutes
    });

    it('should handle empty content', () => {
      expect(getReadingTime('')).toBe(0);
    });

    it('should handle content with extra whitespace', () => {
      const content = '   word1   word2   word3   ';
      const result = getReadingTime(content);
      expect(result).toBe(1); // Should round up to 1 minute
    });
  });
});