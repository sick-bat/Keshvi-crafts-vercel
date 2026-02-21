/** @type {import('next').NextConfig} */
const isExport = process.env.NEXT_EXPORT === 'true';

const nextConfig = {
  // Only export for production builds when we explicitly ask for it
  ...(isExport ? { output: 'export' } : {}),
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.keshvicrafts.in',
          },
        ],
        destination: 'https://keshvicrafts.in/:path*',
        permanent: true,
      },
    ]
  },
};

module.exports = nextConfig;
