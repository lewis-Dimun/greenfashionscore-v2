module.exports = async () => {
  const nextJest = require('next/jest');
  const createNextConfig = nextJest({ dir: './' });

  const base = {
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '^@/(.*)$': '<rootDir>/$1',
    },
    testPathIgnorePatterns: ['<rootDir>/e2e/', '<rootDir>/.next/', '<rootDir>/node_modules/'],
    collectCoverageFrom: [
      'app/**/*.{js,jsx,ts,tsx}',
      'components/**/*.{js,jsx,ts,tsx}',
      'lib/**/*.{js,ts}',
      '!**/*.d.ts',
      '!**/node_modules/**',
    ],
  };

  const apiProject = {
    displayName: 'api',
    testMatch: ['<rootDir>/__tests__/api.*.spec.ts', '<rootDir>/__tests__/domain.*.spec.ts', '<rootDir>/__tests__/data.*.spec.ts'],
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.node.ts'],
    ...base,
  };

  const uiProject = await createNextConfig({
    displayName: 'ui',
    testMatch: [
      '<rootDir>/__tests__/**/*.spec.tsx',
      '<rootDir>/__tests__/**/*.spec.ts',
      '!<rootDir>/__tests__/api.*.spec.ts',
      '!<rootDir>/__tests__/domain.*.spec.ts',
      '!<rootDir>/__tests__/data.*.spec.ts',
    ],
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: base.moduleNameMapper,
    testPathIgnorePatterns: base.testPathIgnorePatterns,
  })();

  return {
    projects: [apiProject, uiProject],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
  };
};