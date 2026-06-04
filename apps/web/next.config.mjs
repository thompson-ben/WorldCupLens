/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Workspace packages ship TypeScript source; let Next compile them.
  transpilePackages: ["@worldcuplens/core", "@worldcuplens/data-providers"],
  webpack: (config) => {
    // The packages use ESM-style ".js" import specifiers that actually point at
    // ".ts" sources. Teach webpack to resolve them.
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
  },
};

export default nextConfig;
