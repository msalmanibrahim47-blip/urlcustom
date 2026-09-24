/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }]
  },
  eslint: {
    // Don't fail Netlify builds on lint warnings; run `npm run lint` locally instead.
    ignoreDuringBuilds: true
  }
};

module.exports = nextConfig;
