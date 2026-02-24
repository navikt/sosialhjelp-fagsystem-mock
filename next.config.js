/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  basePath: "/sosialhjelp/fagsystem-mock",
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX,
  output: "standalone",
  trailingSlash: true,
};

module.exports = nextConfig;
