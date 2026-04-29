/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/proposals',
        destination: '/registration',
        permanent: true,
      },
      {
        source: '/proposals/:path*',
        destination: '/registration/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
