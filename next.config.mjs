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
      {
        source: '/admin/circle-proposals',
        destination: '/admin/circle-registration',
        permanent: true,
      },
      {
        source: '/admin/circle-proposals/:path*',
        destination: '/admin/circle-registration/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
