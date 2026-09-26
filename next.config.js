/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/:exchange/market/:spotMarket",
        destination: "/:exchange/spot/market/:spotMarket",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
