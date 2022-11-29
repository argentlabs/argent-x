import {
  AddStarknetChainParameters,
  SwitchStarknetChainParameter,
  WatchAssetParameters,
} from "get-starknet-core"
import { LocalHandle, RemoteHandle } from "post-me"
import { AccountInterface } from "starknet"

export interface ConnectionOptions {
  localWindow?: Window
  remoteWindow: Window
  remoteOrigin: string
}

export type WindowMethods = {
  enable: (options?: { starknetVersion?: "v3" | "v4" }) => Promise<string[]>
  isPreauthorized: () => Promise<boolean>
  getLoginStatus: () => Promise<
    | { isLoggedIn: false }
    | { isLoggedIn: true; hasSession: boolean; email: string }
  >
  reloadData: () => Promise<void>
  addStarknetChain: (params: AddStarknetChainParameters) => Promise<boolean>
  switchStarknetChain: (
    params: SwitchStarknetChainParameter,
  ) => Promise<boolean>
  watchAsset: (params: WatchAssetParameters) => Promise<boolean>
} & Pick<AccountInterface, "execute" | "signMessage">

export type WindowEvents = {
  "ARGENT_WEB_WALLET::LOADED": undefined
  "ARGENT_WEB_WALLET::CONNECT": undefined
  "ARGENT_WEB_WALLET::SHOULD_SHOW": undefined
  "ARGENT_WEB_WALLET::SHOULD_HIDE": undefined
  "ARGENT_WEB_WALLET::HEIGHT_CHANGED": number
}

export type LocalConnection = LocalHandle<WindowMethods, WindowEvents>
export type RemoteConnection = RemoteHandle<WindowMethods, WindowEvents>
