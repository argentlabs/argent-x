import { BlockExplorerKey } from "./defaultBlockExplorers"

export interface ISettingsStorage {
  privacyUseArgentServices: boolean
  privacyShareAnalyticsData: boolean
  privacyErrorReporting: boolean
  privacyAutomaticErrorReporting: boolean
  experimentalAllowChooseAccount: boolean
  blockExplorerKey: BlockExplorerKey
  betaFeatureMultisig: boolean
  betaFeatureRpcProvider: boolean
}

export type SettingsStorageKey = keyof ISettingsStorage

export type SettingsStorageValue<
  K extends SettingsStorageKey = SettingsStorageKey,
> = ISettingsStorage[K]
