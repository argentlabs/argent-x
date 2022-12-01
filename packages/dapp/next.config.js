/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  swcMinify: false, // we need to use terser, as swc doesn't support svelte and `@argent/get-starknet`
}
