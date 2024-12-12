import type { IChainService } from "../../../chain/service/IChainService"
import type { AllowArray, SelectorFn } from "../../../storage/__new/interface"
import type { AccountId, ArgentWalletAccount } from "../../../wallet.model"
import {
  type BaseWalletAccount,
  type WalletAccount,
} from "../../../wallet.model"
import { accountsEqual, isEqualAccountIds } from "../../../utils/accountsEqual"
import { withoutHiddenSelector } from "../../selectors"
import type { IAccountRepo } from "../../store"
import type { Events, IAccountService } from "./IAccountService"
import { AccountAddedEvent } from "./IAccountService"
import type { IPKManager } from "../../../accountImport/pkManager/IPKManager"
import type Emittery from "emittery"
import { ensureArray } from "@argent/x-shared"
import { filterArgentAccounts } from "../../../utils/isExternalAccount"

export class AccountService implements IAccountService {
  constructor(
    public readonly emitter: Emittery<Events>,
    private readonly chainService: IChainService,
    private readonly accountRepo: IAccountRepo,
    private readonly pkManager: IPKManager,
  ) {}

  async get(
    selector: SelectorFn<WalletAccount> = withoutHiddenSelector,
  ): Promise<WalletAccount[]> {
    return this.accountRepo.get(selector)
  }

  async getArgentWalletAccounts(): Promise<ArgentWalletAccount[]> {
    const accounts = await this.get()
    return filterArgentAccounts(accounts)
  }

  async getFromBaseWalletAccounts(baseWalletAccounts: BaseWalletAccount[]) {
    const accounts = await this.get((account) => {
      return baseWalletAccounts.some((baseWalletAccount) =>
        accountsEqual(account, baseWalletAccount),
      )
    })
    return accounts
  }

  async upsert(account: AllowArray<WalletAccount>): Promise<void> {
    await this.accountRepo.upsert(account)

    for (const accountItem of ensureArray(account)) {
      await this.emitter.emit(AccountAddedEvent, accountItem)
    }
  }

  async remove(
    selector: SelectorFn<WalletAccount> | AllowArray<WalletAccount>,
  ): Promise<WalletAccount[]> {
    return this.accountRepo.remove(selector)
  }

  async removeById(accountId: AccountId): Promise<void> {
    const [account] = await this.accountRepo.get((account) =>
      isEqualAccountIds(account.id, accountId),
    )

    if (!account) {
      return
    }

    await this.accountRepo.remove(account)

    if (account.type === "imported") {
      await this.pkManager.removeKey(account.id)
    }
  }

  // TBD: should we expose this function and get rid of one function per property? Or should we keep it as is?
  private async update(
    selector: SelectorFn<WalletAccount>,
    updateFn: (account: WalletAccount) => WalletAccount,
  ): Promise<void> {
    await this.accountRepo.upsert((accounts) => {
      return accounts.map((account) => {
        if (selector(account)) {
          return updateFn(account)
        }
        return account
      })
    })
  }

  async setHide(hidden: boolean, accountId: AccountId): Promise<void> {
    return this.update(
      (account) => isEqualAccountIds(account.id, accountId),
      (account) => ({ ...account, hidden }),
    )
  }

  async setName(name: string, accountId: AccountId): Promise<void> {
    return this.update(
      (account) => isEqualAccountIds(account.id, accountId),
      (account) => ({ ...account, name }),
    )
  }

  async getDeployed(baseAccount: BaseWalletAccount): Promise<boolean> {
    return this.chainService.getDeployed(baseAccount)
  }
}
