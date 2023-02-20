import type {
  AddStarknetChainParameters,
  SwitchStarknetChainParameter,
  WatchAssetParameters,
} from "get-starknet-core"
import { AccountInterface } from "starknet"

export type StarknetMethods = {
  enable: (options?: { starknetVersion?: "v3" | "v4" }) => Promise<string[]>
  getLoginStatus: () => Promise<
    | { isLoggedIn: false }
    | { isLoggedIn: true; hasSession: boolean; isPreauthorized: boolean }
  >
  addStarknetChain: (params: AddStarknetChainParameters) => Promise<boolean>
  switchStarknetChain: (
    params: SwitchStarknetChainParameter,
  ) => Promise<boolean>
  watchAsset: (params: WatchAssetParameters) => Promise<boolean>
} & Pick<AccountInterface, "execute" | "signMessage">

export type ConnectMethods = {
  connect: () => void
}

export type ModalMethods = {
  shouldShow: () => void
  shouldHide: () => void
  heightChanged: (height: number) => void
}

export type WebWalletMethods = ConnectMethods & ModalMethods

export type IframeMethods = {
  connect: () => void
}
