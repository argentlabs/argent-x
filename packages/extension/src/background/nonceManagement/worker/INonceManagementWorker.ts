import type { AccountId } from "../../../shared/wallet.model"

export interface INonceManagementWorker {
  refreshLocalNonce(accountId: AccountId): Promise<void>
}
