module.exports = async () => {
  const nextJest = require('next/jest');
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
        { tsconfig: 'tsconfig.json', useESM: false }
      ]
    },
    extensionsToTreatAsEsm: [],
  };

  const apiProject = {
    displayName: 'api',
    testMatch: ['<rootDir>/__tests__/api.*.spec.ts'],
    testEnvironment: 'node',
    setupFilesAfterEnv: [
      '<rootDir>/jest.setup.node.ts',
      '<rootDir>/jest.setup.ts'
    ],
    ...base,
  };

  const uiProject = await createNextConfig({
    displayName: 'ui',
    testMatch: [
      '<rootDir>/**/?(*.)+(spec|test).tsx',
      '<rootDir>/**/?(*.)+(spec|test).ts',
      '!<rootDir>/__tests__/api.*.spec.ts',
    ],
    testEnvironment: 'jest-environment-jsdom',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: base.moduleNameMapper,
    testPathIgnorePatterns: base.testPathIgnorePatterns,
  })();

  return {
    projects: [apiProject, uiProject]
  };
};


