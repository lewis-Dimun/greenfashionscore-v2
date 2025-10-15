module.exports = async () => {
  const nextJest = require('next/jest');
  const createNextConfig = nextJest({ dir: './' });

  const base = {
    moduleNameMapper: {
      '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      '^@/(.*)$': '<rootDir>/$1',
      '^@supabase/auth-helpers-nextjs$': '<rootDir>/__mocks__/@supabase/auth-helpers-nextjs.ts',
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
    testMatch: [
      '<rootDir>/__tests__/api.*.spec.ts', 
      '<rootDir>/__tests__/domain.*.spec.ts', 
      '<rootDir>/__tests__/scoring.*.spec.ts', 
      '<rootDir>/__tests__/excel.*.spec.ts', 
      '<rootDir>/__tests__/rls.*.spec.ts'
    ],
    testEnvironment: 'node',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.node.ts'],
    preset: 'ts-jest',
    transform: {
      '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }],
    },
    ...base,
  };

  const uiProject = await createNextConfig({
    displayName: 'ui',
    testMatch: [
      '<rootDir>/__tests__/ui.*.spec.tsx',
      '<rootDir>/__tests__/components.*.spec.tsx',
      '<rootDir>/__tests__/a11y.*.spec.tsx',
      '<rootDir>/__tests__/ui.*.spec.ts',
      '<rootDir>/__tests__/components.*.spec.ts',
      '<rootDir>/__tests__/a11y.*.spec.ts',
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