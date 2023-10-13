import { networkService } from "../../network/service"
import { ArrayStorage } from "../../storage"
import type { IRepository } from "../../storage/__new/interface"
import { adaptArrayStorage } from "../../storage/__new/repository"
import type { WalletAccount } from "../../wallet.model"
import { accountsEqual } from "../../utils/accountsEqual"
import { deserializeFactory, serialize } from "./serialize"

export type IAccountRepo = IRepository<WalletAccount>

/**
 * @deprecated use `accountRepo` instead
 */
export const accountStore = new ArrayStorage<WalletAccount>([], {
  namespace: "core:accounts",
  compare: accountsEqual,
  serialize,
  deserialize: deserializeFactory(networkService.getById.bind(networkService)),
})

export const accountRepo: IAccountRepo = adaptArrayStorage(accountStore)
