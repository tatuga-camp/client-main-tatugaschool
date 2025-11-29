/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Webpack config is removed because we handle asset copying via scripts now
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
      {
        protocol: "https",
        hostname: "n14jpqkv.api.sanity.io",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "storage.tatugaschool.com",
      },
      {
        protocol: "https",
        hostname: "development-storage.tatugaschool.com",
      },
    ],
  },
};

export default nextConfig;
