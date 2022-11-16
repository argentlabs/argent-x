const withTM = require("next-transpile-modules")(["micro-starknet"])

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["dv3jj1unlp2jl.cloudfront.net"],
  },
})

module.exports = nextConfig
