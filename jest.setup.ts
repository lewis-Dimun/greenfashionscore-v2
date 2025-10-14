import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => require('react').createElement('img', props)
}));


