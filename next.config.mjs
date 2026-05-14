/** @type {import('next').NextConfig} */
const nextConfig = {
  typedRoutes: true,
  async rewrites() {
    return [
      {
        source: '/admin/login',
        destination: '/admin-login',
      },
    ];
  },
};

export default nextConfig;