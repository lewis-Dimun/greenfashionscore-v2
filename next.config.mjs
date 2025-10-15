import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Enable compression
  compress: true,
  // Silence workspace root warning
  outputFileTracingRoot: process.cwd(),
  // Disable typed routes to prevent Windows filesystem errors
  experimental: {
    typedRoutes: false,
  },
  // Additional Windows workarounds
  outputFileTracing: false,
};

export default withBundleAnalyzer(nextConfig);


