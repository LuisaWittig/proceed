/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['antd'],
  env: {
    API_URL:
      process.env.NODE_ENV === 'development' ? 'https://localhost:33083/api' : process.env.API_URL,
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/processes',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;