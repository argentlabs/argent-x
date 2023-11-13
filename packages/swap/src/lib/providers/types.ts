import { ProviderInterface } from "starknet"
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
}

export interface SwapProviderArgs {
  selectedAccount?: BaseWalletAccount
  multicall?: MinimalProvider
  children: React.ReactNode
}
