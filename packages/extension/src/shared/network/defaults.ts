import {
  ARGENT_5_MINUTE_ESCAPE_TESTING_ACCOUNT_CLASS_HASH,
  BETTER_MULTICAL_ACCOUNT_CLASS_HASH,
  FEE_TOKEN_ADDRESS_ETH,
  MULTICALL_CONTRACT_ADDRESS,
  MULTISIG_ACCOUNT_CLASS_HASH,
  PLUGIN_ACCOUNT_CLASS_HASH,
  STANDARD_ACCOUNT_CLASS_HASH,
  STANDARD_CAIRO_0_ACCOUNT_CLASS_HASH,
} from "./constants"
import type { Network, NetworkWithStatus } from "./type"
import { getDefaultNetwork } from "./utils"

const DEV_ONLY_NETWORKS: Network[] = [
  {
    id: "integration",
    name: "Integration",
    chainId: "SN_GOERLI",
    sequencerUrl: "https://external.integration.starknet.io",
    accountClassHash: {
      standard: STANDARD_ACCOUNT_CLASS_HASH,
    },
    multicallAddress: MULTICALL_CONTRACT_ADDRESS,
    feeTokenAddress: FEE_TOKEN_ADDRESS_ETH,
  },
]

export const defaultNetworksStatuses: NetworkWithStatus[] = [
  {
    id: "mainnet-alpha",
    status: "unknown",
  },
  {
    id: "goerli-alpha",
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
    sequencerUrl: "https://alpha-mainnet.starknet.io",
    rpcUrl: "https://cloud.argent-api.com/v1/starknet/mainnet/rpc/v0.4",
    explorerUrl: "https://voyager.online",
    l1ExplorerUrl: "https://etherscan.io",
    accountClassHash: {
      standard: STANDARD_ACCOUNT_CLASS_HASH,
      multisig: MULTISIG_ACCOUNT_CLASS_HASH,
    },
    multicallAddress: MULTICALL_CONTRACT_ADDRESS,
    feeTokenAddress: FEE_TOKEN_ADDRESS_ETH,
    readonly: true,
    prefer: "sequencer",
  },
  {
    id: "goerli-alpha",
    name: "Testnet",
    chainId: "SN_GOERLI",
    sequencerUrl: "https://alpha4.starknet.io",
    rpcUrl: "https://cloud.argent-api.com/v1/starknet/goerli/rpc/v0.4",
    explorerUrl: "https://goerli.voyager.online",
    faucetUrl: "https://faucet.goerli.starknet.io",
    l1ExplorerUrl: "https://goerli.etherscan.io",
    accountClassHash: {
      standard: STANDARD_ACCOUNT_CLASS_HASH,
      plugin: PLUGIN_ACCOUNT_CLASS_HASH,
      betterMulticall: BETTER_MULTICAL_ACCOUNT_CLASS_HASH,
      argent5MinuteEscapeTestingAccount:
        ARGENT_5_MINUTE_ESCAPE_TESTING_ACCOUNT_CLASS_HASH,
      multisig: MULTISIG_ACCOUNT_CLASS_HASH,
    },
    multicallAddress: MULTICALL_CONTRACT_ADDRESS,
    feeTokenAddress: FEE_TOKEN_ADDRESS_ETH,
    readonly: true,
    prefer: "rpc",
  },
  ...(process.env.NODE_ENV === "development" ? DEV_ONLY_NETWORKS : []),
  {
    id: "localhost",
    chainId: "SN_GOERLI",
    sequencerUrl: "http://localhost:5050",
    explorerUrl: "https://devnet.starkscan.co",
    name: "Localhost 5050",
    feeTokenAddress: FEE_TOKEN_ADDRESS_ETH,
    accountClassHash: {
      standard: STANDARD_CAIRO_0_ACCOUNT_CLASS_HASH,
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
