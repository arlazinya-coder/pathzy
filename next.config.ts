import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config, { dev, nextRuntime }) {
    if (!dev && nextRuntime === "edge") {
      config.devtool = false;
    }
    return config;
  }
};

export default nextConfig;
