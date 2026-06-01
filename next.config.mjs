/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ufs.sh',
        pathname: '/f/**',
      },
      {
        protocol: 'https',
        hostname: '*.ufs.sh',
        pathname: '/f/**',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
        pathname: '/f/**',
      },
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
        pathname: '/f/**',
      },
    ],
  },
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
