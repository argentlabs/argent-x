import type { BlockExplorerKey } from "./defaultBlockExplorers"
import type { NftMarketplaceKey } from "../nft/marketplaces"

export interface ISettingsStorage {
  privacyUseArgentServices: boolean
  privacyShareAnalyticsData: boolean
  privacyErrorReporting: boolean
  privacyAutomaticErrorReporting: boolean
  experimentalAllowChooseAccount: boolean
  blockExplorerKey: BlockExplorerKey
  nftMarketplaceKey: NftMarketplaceKey
  autoLockTimeMinutes: number
  disableAnimation: boolean
  airGapEnabled: boolean
  idProvider: "starknetid" | "brotherid"
  sidePanelEnabled: boolean
}

export type SettingsStorageKey = keyof ISettingsStorage

export type SettingsStorageValue<
  K extends SettingsStorageKey = SettingsStorageKey,
> = ISettingsStorage[K]
