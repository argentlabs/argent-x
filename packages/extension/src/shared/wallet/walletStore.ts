import { KeyValueStorage } from "../storage"
import type { IObjectStore } from "../storage/__new/interface"
import { adaptKeyValue } from "../storage/__new/keyvalue"
import type {
  BaseWalletAccount,
  NetworkOnlyPlaceholderAccount,
} from "../wallet.model"

export type SelectedWalletStoreAccount =
  | BaseWalletAccount
  | NetworkOnlyPlaceholderAccount
  | null

export interface WalletStorageProps {
  backup?: string
  selected?: SelectedWalletStoreAccount
  discoveredOnce?: boolean
  hasSavedRecoverySeedPhrase?: boolean
  lastUsedAccountByNetwork?: Record<string, BaseWalletAccount>
  noUpgradeBannerAccounts?: BaseWalletAccount[]
}

export type IWalletStore = IObjectStore<WalletStorageProps>

/**
 * @deprecated use `walletStore` instead
 */
export const old_walletStore = new KeyValueStorage<WalletStorageProps>(
  {},
  "core:wallet",
)

export const walletStore: IWalletStore = adaptKeyValue(old_walletStore)
