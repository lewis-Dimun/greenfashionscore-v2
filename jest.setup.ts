import '@testing-library/jest-dom';
// jest-axe types can be tricky with ESM; import via require fallback
// eslint-disable-next-line
const { toHaveNoViolations } = require('jest-axe');
expect.extend({ toHaveNoViolations: toHaveNoViolations });

jest.mock('next/image', () => {
  return {
    __esModule: true,
    default: function NextImage(props: any) {
      return require('react').createElement('img', props);
    }
  };
});


