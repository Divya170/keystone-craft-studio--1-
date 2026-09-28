/** @type {import('next').NextConfig} */
const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/api\/?$/, '');

let apiHostname = 'localhost';
try {
  apiHostname = new URL(API_ORIGIN).hostname;
} catch {
  // keep default
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: apiHostname },
      { protocol: 'https', hostname: apiHostname },
    ],
  },
};

module.exports = nextConfig;
