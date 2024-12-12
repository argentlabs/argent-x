import type { Hex } from "@argent/x-shared"
import type { AccountId } from "../../shared/wallet.model"

export interface INonceManagementService {
  getNonce(account: AccountId): Promise<Hex>
  increaseLocalNonce(account: AccountId): Promise<void>
  resetLocalNonce(account: AccountId): Promise<void>
}
