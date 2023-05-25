import { ArrayStorage } from "../../storage"
import type { IRepository } from "../../storage/__new/interface"
import { adaptArrayStorage } from "../../storage/__new/repository"
import type { WalletAccount } from "../../wallet.model"
import { accountsEqual } from "../../wallet.service"
import { deserialize, serialize } from "./serialize"

export type IAccountRepo = IRepository<WalletAccount>

/**
 * @deprecated use `accountRepo` instead
 */
export const accountStore = new ArrayStorage<WalletAccount>([], {
  namespace: "core:accounts",
  compare: accountsEqual,
  serialize,
  deserialize,
})

export const accountRepo: IAccountRepo = adaptArrayStorage(accountStore)
