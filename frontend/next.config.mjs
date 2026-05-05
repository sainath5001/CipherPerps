/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config) {
    // RainbowKit/wagmi may pull optional deps meant for React Native / pretty logging.
    // For a web-only Next.js app we safely stub them to avoid build-time resolution errors.
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@react-native-async-storage/async-storage": new URL("./shims/async-storage.ts", import.meta.url).pathname,
      "pino-pretty": new URL("./shims/pino-pretty.ts", import.meta.url).pathname
    };
    return config;
  }
};

export default nextConfig;

