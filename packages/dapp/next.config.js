/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: false, // we need to use terser, as swc doesn't support svelte and `@argent/get-starknet`
  publicRuntimeConfig: {
    webWalletUrl:
      process.env.NEXT_PUBLIC_WEBWALLET_URL ?? "http://localhost:3005",
    argentMobileChainId: process.env.NEXT_PUBLIC_ARGENT_CHAIN_ID ?? "SN_GOERLI",
  },
}
