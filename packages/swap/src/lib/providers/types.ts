import { ProviderInterface, constants } from "starknet"
import { SupportedNetworks } from "../../sdk"

interface BaseWalletAccount {
  address: string
  networkId: string
}

type MinimalProvider = Pick<ProviderInterface, "callContract">

export interface SwapContextInterface {
  selectedAccount?: BaseWalletAccount
  multicall?: MinimalProvider
  networkId?: SupportedNetworks
  rpcUrl?: string
  chainId?: constants.StarknetChainId
}

export interface SwapProviderArgs {
  selectedAccount?: BaseWalletAccount
  rpcUrl?: string
  multicall?: MinimalProvider
  chainId?: string
  children: React.ReactNode
}
