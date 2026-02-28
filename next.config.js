/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io',
      },
      {
        protocol: 'https',
        hostname: '*.cloud.appwrite.io',
      },
      {
        protocol: 'https',
        hostname: '*.appwrite.io',
      },
      {
        protocol: 'https',
        hostname: 'api.together.ai',
      },
      {
        protocol: 'https',
        hostname: 'api.together.xyz',
      },
    ],
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
