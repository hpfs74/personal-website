import { describe, it, expect } from 'vitest';

describe('example tests', () => {
  describe('basic functionality', () => {
    it('should perform basic math operations', () => {
      expect(2 + 2).toBe(4);
      expect(10 - 5).toBe(5);
      expect(3 * 4).toBe(12);
      expect(15 / 3).toBe(5);
    });

    it('should handle string operations', () => {
      expect('hello' + ' world').toBe('hello world');
      expect('test'.toUpperCase()).toBe('TEST');
      expect('TEST'.toLowerCase()).toBe('test');
    });

    it('should handle array operations', () => {
      const arr = [1, 2, 3];
      expect(arr.length).toBe(3);
      expect(arr.includes(2)).toBe(true);
      expect(arr.includes(4)).toBe(false);
    });

    it('should handle object operations', () => {
      const obj = { name: 'John', age: 30 };
      expect(obj.name).toBe('John');
      expect(obj.age).toBe(30);
      expect(Object.keys(obj)).toEqual(['name', 'age']);
    });
  });

  describe('async operations', () => {
    it('should handle promises', async () => {
      const promise = Promise.resolve('success');
      const result = await promise;
      expect(result).toBe('success');
    });

    it('should handle async functions', async () => {
      const asyncFunction = async () => {
        return new Promise((resolve) => {
          setTimeout(() => resolve('async result'), 10);
        });
      };

      const result = await asyncFunction();
      expect(result).toBe('async result');
    });
  });
});