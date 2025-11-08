/** @type {import('next').NextConfig} */
import path from "path";
import { fileURLToPath } from "url";
import CopyPlugin from "copy-webpack-plugin";

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const nextConfig = {
  reactStrictMode: true,
  webpack(config, options) {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: path.join(__dirname, "node_modules/tinymce"),
            to: path.join(__dirname, "public/assets/libs/tinymce"),
          },
        ],
      }),
    );

    return config;
  },
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
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "development-storage.tatugaschool.com",
      },
    ],
  },
};

export default nextConfig;
