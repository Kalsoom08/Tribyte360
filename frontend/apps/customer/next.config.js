/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@repo/ui', '@repo/utils', '@repo/tenant', '@repo/api-client', '@repo/i18n', '@repo/config'],
};
module.exports = nextConfig;
