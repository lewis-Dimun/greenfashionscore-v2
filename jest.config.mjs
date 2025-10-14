import nextJest from 'next/jest.js';

const createNextConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const base = {
  moduleNameMapper: {
    '^whatwg-fetch$': '<rootDir>/test/polyfills/whatwg-fetch.ts',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      { tsconfig: 'tsconfig.json', useESM: true }
    ]
  }
};

const apiProject = {
  displayName: 'api',
  testMatch: ['<rootDir>/__tests__/api.*.spec.ts'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.node.ts', '<rootDir>/jest.setup.ts'],
  ...base
};

const uiProject = await createNextConfig({
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  ...base
});

export default {
  projects: [apiProject, uiProject]
};


