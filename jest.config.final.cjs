const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@supabase/auth-helpers-nextjs$': '<rootDir>/__mocks__/@supabase/auth-helpers-nextjs.ts',
  },
  testMatch: [
    '<rootDir>/__tests__/**/*.spec.ts',
    '<rootDir>/__tests__/**/*.spec.tsx',
    '<rootDir>/__tests__/**/*.test.ts',
    '<rootDir>/__tests__/**/*.test.tsx',
  ],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true, isolatedModules: true }],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  testPathIgnorePatterns: ['<rootDir>/e2e/', '<rootDir>/.next/', '<rootDir>/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/e2e/**',
  ],
};

module.exports = createJestConfig(customJestConfig);
