import { KeyValueStorage } from "../storage"
import { BaseWalletAccount } from "../wallet.model"

export interface WalletStorageProps {
  backup?: string
  selected?: BaseWalletAccount | null
  discoveredOnce?: boolean
}

export const walletStore = new KeyValueStorage<WalletStorageProps>(
  {},
  "core:wallet",
)
