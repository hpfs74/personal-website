import { vi } from 'vitest';

// Mock Astro environment
Object.defineProperty(globalThis, 'Astro', {
  value: {
    props: {},
    slots: {},
    params: {},
    request: {
      url: 'http://localhost:4321/',
    },
    url: new URL('http://localhost:4321/'),
    site: new URL('http://localhost:4321/'),
    generator: 'Astro v5.13.10',
  },
  writable: true,
});

// Setup global test utilities
global.vi = vi;