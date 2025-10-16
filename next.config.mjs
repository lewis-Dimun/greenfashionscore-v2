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
  // Enable typed routes (moved from experimental)
  typedRoutes: true,
  // Disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default withBundleAnalyzer(nextConfig);


