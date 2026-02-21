/** @type {import('next').NextConfig} */
const isExport = process.env.NEXT_EXPORT === 'true';

const nextConfig = {
  // Only export for production builds when we explicitly ask for it
  ...(isExport ? { output: 'export' } : {}),
};

module.exports = nextConfig;
