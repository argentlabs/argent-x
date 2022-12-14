import { Multicall } from "@argent/x-multicall"

import { SupportedNetworks } from "../../sdk"

interface BaseWalletAccount {
  address: string
  networkId: string
}

export interface SwapContextInterface {
  selectedAccount?: BaseWalletAccount
  multicall?: Multicall
  networkId?: SupportedNetworks
}

export interface SwapProviderArgs {
  selectedAccount?: BaseWalletAccount
  multicall?: Multicall
  children: React.ReactNode
}
