import { PublicRpcNode } from "./type"

export const ETH_TOKEN_ADDRESS =
  "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
export const STRK_TOKEN_ADDRESS =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"

// This should always be the latest. If you need to use the old or custom one, don't use this constant.
export const STANDARD_ACCOUNT_CLASS_HASH =
  "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003"

export const TXV3_ACCOUNT_CLASS_HASH =
  "0x028463df0e5e765507ae51f9e67d6ae36c7e5af793424eccc9bc22ad705fc09d"

export const STANDARD_CAIRO_0_ACCOUNT_CLASS_HASH =
  "0x033434ad846cdd5f23eb73ff09fe6fddd568284a0fb7d1be20ee482f044dabe2"

export const PLUGIN_ACCOUNT_CLASS_HASH =
  "0x4ee23ad83fb55c1e3fac26e2cd951c60abf3ddc851caa9a7fbb9f5eddb2091"

export const MULTISIG_ACCOUNT_CLASS_HASH =
  "0x0737ee2f87ce571a58c6c8da558ec18a07ceb64a6172d5ec46171fbc80077a48"

export const BETTER_MULTICAL_ACCOUNT_CLASS_HASH =
  "0x057c2f22f0209a819e6c60f78ad7d3690f82ade9c0c68caea492151698934ede"

export const ARGENT_5_MINUTE_ESCAPE_TESTING_ACCOUNT_CLASS_HASH =
  "0x0545d680a2b4909f886371b2ac820745491f55ac7f0e81b3c4668a81e2a656f0" /** Cairo 1 */
// "0x058a42e2553e65e301b7f22fb89e4a2576e9867c1e20bb1d32746c74ff823639" /** Cairo 0 - please keep for testing */

export const MULTICALL_CONTRACT_ADDRESS =
  "0x05754af3760f3356da99aea5c3ec39ccac7783d925a19666ebbeca58ff0087f4"

// Public RPC nodes
export const BLAST_RPC_NODE: PublicRpcNode = {
  mainnet: "https://starknet-mainnet.public.blastapi.io",
  testnet: "https://starknet-testnet.public.blastapi.io",
} as const

export const LAVA_RPC_NODE: PublicRpcNode = {
  mainnet: "https://rpc.starknet.lava.build",
  testnet: "https://rpc.starknet-testnet.lava.build",
} as const

export const PUBLIC_RPC_NODES = [BLAST_RPC_NODE, LAVA_RPC_NODE] as const
