import type { Hex } from "@argent/x-shared"
import type { AccountId } from "../../wallet.model"

export interface IPKManager {
  storeEncryptedKey(
    pk: Hex,
    password: string,
    accountId: AccountId,
  ): Promise<void>
  retrieveDecryptedKey(password: string, accountId: AccountId): Promise<Hex>

  removeKey(accountId: AccountId): Promise<void>
}
