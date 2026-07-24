/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Add your Supabase Storage domain here once you have a project,
      // e.g. { protocol: 'https', hostname: '<project-ref>.supabase.co' }
    ],
  },
};

module.exports = nextConfig;
