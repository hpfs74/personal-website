# Testing Setup

This project uses **Vitest** for unit testing, which is the recommended testing framework for Vite-based projects.

## Test Structure

- **Unit Tests**: Located in `src/**/*.test.ts` files
- **Test Utilities**: Setup files in `src/test/`
- **Coverage Reports**: Generated in `coverage/` directory

## Available Scripts

```bash
# Run tests in watch mode (interactive)
npm run test

# Run tests once (CI/build)
npm run test:run

# Run tests with UI interface
npm run test:ui

# Run tests in watch mode
npm run test:watch
```

## Configuration

- **Config File**: `vitest.config.ts`
- **Setup File**: `src/test/setup.ts`
- **Environment**: `happy-dom` (lightweight DOM simulation)

## Test Organization

### Example Test Categories

1. **Utility Functions** (`src/utils/*.test.ts`)
   - Data formatting functions
   - Validation helpers
   - String manipulation

2. **Example Tests** (`src/test/example.test.ts`)
   - Basic functionality tests
   - Async operation tests

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect } from 'vitest';
import { functionToTest } from './module';

describe('module name', () => {
  describe('function name', () => {
    it('should describe expected behavior', () => {
      expect(functionToTest('input')).toBe('expected output');
    });
  });
});
```

### Test Coverage

- Coverage reports include text, JSON, and HTML formats
- Excludes test files, config files, and type definitions
- Runs automatically in CI/build pipeline

## CI Integration

Tests are integrated into the build pipeline (`buildspec.yml`):

1. Unit tests run before building
2. Coverage reports are generated
3. Build fails if any tests fail

This ensures code quality and prevents broken code from being deployed.