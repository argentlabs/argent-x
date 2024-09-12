import { IChainService } from "../../../chain/service/IChainService"
import type { AllowArray, SelectorFn } from "../../../storage/__new/interface"
import {
  type BaseWalletAccount,
  type WalletAccount,
} from "../../../wallet.model"
import { accountsEqual } from "../../../utils/accountsEqual"
import { withoutHiddenSelector } from "../../selectors"
import type { IAccountRepo } from "../../store"
import { IAccountService } from "./IAccountService"

export class AccountService implements IAccountService {
  constructor(
    private readonly chainService: IChainService,
    private readonly accountRepo: IAccountRepo,
  ) {}

  async get(
    selector: SelectorFn<WalletAccount> = withoutHiddenSelector,
  ): Promise<WalletAccount[]> {
    return this.accountRepo.get(selector)
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
  }

  async remove(baseAccount: BaseWalletAccount): Promise<void> {
    await this.accountRepo.remove((account) =>
      accountsEqual(account, baseAccount),
    )
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

  async setHide(
    hidden: boolean,
    baseAccount: BaseWalletAccount,
  ): Promise<void> {
    return this.update(
      (account) => accountsEqual(account, baseAccount),
      (account) => ({ ...account, hidden }),
    )
  }

  async setName(name: string, baseAccount: BaseWalletAccount): Promise<void> {
    return this.update(
      (account) => accountsEqual(account, baseAccount),
      (account) => ({ ...account, name }),
    )
  }

  async getDeployed(baseAccount: BaseWalletAccount): Promise<boolean> {
    return this.chainService.getDeployed(baseAccount)
  }
}
