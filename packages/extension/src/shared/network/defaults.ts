import {
  TXV3_ACCOUNT_CLASS_HASH,
  TXV3_MULTISIG_CLASS_HASH,
} from "@argent/x-shared"
import urlJoin from "url-join"
import {
  ETH_TOKEN_ADDRESS,
  MULTICALL_CONTRACT_ADDRESS,
  STANDARD_CAIRO_0_ACCOUNT_CLASS_HASH,
  STANDARD_DEVNET_ACCOUNT_CLASS_HASH,
  STRK_TOKEN_ADDRESS,
} from "./constants"
import type { Network, NetworkWithStatus } from "./type"
import { getDefaultNetwork } from "./utils"

const NODE_ENV_DEV_ONLY_NETWORKS: Network[] = [
  {
    id: "integration",
    name: "Integration",
    chainId: "SN_SEPOLIA",
    rpcUrl: "https://cloud-dev.argent-api.com/v1/starknet/sepolia/rpc/v0.7",
    accountClassHash: {
      standard: TXV3_ACCOUNT_CLASS_HASH,
      smart: TXV3_ACCOUNT_CLASS_HASH,
    },
    // multicallAddress: MULTICALL_CONTRACT_ADDRESS, // not defined on integration
    possibleFeeTokenAddresses: [ETH_TOKEN_ADDRESS, STRK_TOKEN_ADDRESS],
    explorerUrl: "https://integration.starkscan.co",
    readonly: true,
  },
]

export const defaultNetworksStatuses: NetworkWithStatus[] = [
  {
    id: "mainnet-alpha",
    status: "unknown",
  },
  {
    id: "sepolia-alpha",
    status: "unknown",
  },
  {
    id: "localhost",
    status: "unknown",
  },
]

export const defaultNetworks: Network[] = [
  {
    id: "mainnet-alpha",
    name: "Mainnet",
    chainId: "SN_MAIN",
    rpcUrl: "https://cloud.argent-api.com/v1/starknet/mainnet/rpc/v0.7",
    explorerUrl: "https://voyager.online",
    l1ExplorerUrl: "https://etherscan.io",
    accountClassHash: {
      standard: TXV3_ACCOUNT_CLASS_HASH,
      multisig: TXV3_MULTISIG_CLASS_HASH,
      standardCairo0: STANDARD_CAIRO_0_ACCOUNT_CLASS_HASH,
      smart: TXV3_ACCOUNT_CLASS_HASH,
    },
    multicallAddress: MULTICALL_CONTRACT_ADDRESS,
    possibleFeeTokenAddresses: [ETH_TOKEN_ADDRESS, STRK_TOKEN_ADDRESS],
    readonly: true,
  },
  {
    id: "sepolia-alpha",
    name: "Sepolia",
    chainId: "SN_SEPOLIA",
    rpcUrl: urlJoin(
      process.env.ARGENT_API_BASE_URL || "",
      "starknet/sepolia/rpc/v0.7",
    ),
    explorerUrl: "https://sepolia.voyager.online",
    l1ExplorerUrl: "https://sepolia.etherscan.io",
    accountClassHash: {
      standard: TXV3_ACCOUNT_CLASS_HASH,
      standardCairo0: STANDARD_CAIRO_0_ACCOUNT_CLASS_HASH,
      multisig: TXV3_MULTISIG_CLASS_HASH,
      smart: TXV3_ACCOUNT_CLASS_HASH,
    },
    multicallAddress: MULTICALL_CONTRACT_ADDRESS,
    possibleFeeTokenAddresses: [ETH_TOKEN_ADDRESS, STRK_TOKEN_ADDRESS],
    readonly: true,
  },
  ...(process.env.NODE_ENV === "development" ? NODE_ENV_DEV_ONLY_NETWORKS : []),
  {
    id: "localhost",
    chainId: "SN_GOERLI",
    rpcUrl: "http://localhost:5050",
    explorerUrl: "http://localhost:4000/testnet/",
    name: "Devnet",
    possibleFeeTokenAddresses: [ETH_TOKEN_ADDRESS],
    accountClassHash: {
      standard: STANDARD_DEVNET_ACCOUNT_CLASS_HASH,
      smart: STANDARD_DEVNET_ACCOUNT_CLASS_HASH,
    },
  },
]

export const defaultNetwork = getDefaultNetwork(defaultNetworks)

export const defaultCustomNetworks = defaultNetworks.filter(
  ({ readonly }) => !readonly,
)

export const defaultReadonlyNetworks = defaultNetworks.filter(
  ({ readonly }) => !!readonly,
)
