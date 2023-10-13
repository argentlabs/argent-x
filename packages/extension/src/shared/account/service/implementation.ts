import { Account } from "../../../ui/features/accounts/Account"
import { Multisig } from "../../../ui/features/multisig/Multisig"
import { messageClient } from "../../../ui/services/messaging/trpc"
import { IChainService } from "../../chain/service/interface"
import type { AllowArray, SelectorFn } from "../../storage/__new/interface"
import {
  baseWalletAccountSchema,
  type ArgentAccountType,
  type BaseWalletAccount,
  type CreateAccountType,
  type MultisigData,
  type WalletAccount,
} from "../../wallet.model"
import { accountsEqual } from "../../utils/accountsEqual"
import type { IWalletStore } from "../../wallet/walletStore"
import { withoutHiddenSelector } from "../selectors"
import type { IAccountRepo } from "../store"
import type { IAccountService } from "./interface"
import { IMultisigService } from "../../multisig/service/messaging/interface"

// TODO: once the data presentation of account changes, this should be updated and tests should be added
// TODO: once the messaging is trpc, we should add tests
export class AccountService implements IAccountService {
  constructor(
    private readonly chainService: IChainService,
    private readonly accountRepo: IAccountRepo,
    private readonly walletStore: IWalletStore,
    private readonly trpcClient: typeof messageClient,
    private readonly multisigService: IMultisigService,
  ) {}

  async select(baseAccount: BaseWalletAccount | null): Promise<void> {
    let parsedAccount = baseAccount

    if (parsedAccount) {
      parsedAccount = baseWalletAccountSchema.parse(baseAccount)
    }

    return this.trpcClient.account.select.mutate(parsedAccount)
  }

  async create(
    type: CreateAccountType,
    networkId: string,
    multisigPayload?: MultisigData,
  ): Promise<WalletAccount> {
    if (type === "multisig" && !multisigPayload) {
      throw new Error("Multisig payload is required")
    }

    let newAccount: Account
    if (type === "multisig") {
      // get rid of these extra abstractions
      newAccount = await Multisig.create(networkId, multisigPayload)
    } else {
      newAccount = await Account.create(networkId, type)
    }

    // get WalletAccount format
    const [hit] = await this.accountRepo.get((account) =>
      accountsEqual(account, newAccount),
    )

    if (!hit) {
      throw new Error("Something went wrong")
    }

    // switch background wallet to the account that was selected
    await this.select(newAccount)

    return hit
  }

  // TODO: make isomorphic
  async deploy(baseAccount: BaseWalletAccount): Promise<void> {
    const [account] = await this.accountRepo.get((account) =>
      accountsEqual(account, baseAccount),
    )

    if (!account) {
      throw new Error("Account not found")
    }

    if (account.needsDeploy === false) {
      throw new Error("Account already deployed")
    }

    if (account.type === "multisig") {
      await this.multisigService.deploy(account)
    } else {
      await this.trpcClient.account.deploy.mutate(account)
    }
  }

  // TODO: make isomorphic
  async upgrade(
    baseWalletAccount: BaseWalletAccount,
    targetImplementationType?: ArgentAccountType | undefined,
  ): Promise<void> {
    const account = baseWalletAccountSchema.parse(baseWalletAccount)

    return this.trpcClient.account.upgrade.mutate({
      account,
      targetImplementationType,
    })
  }

  async get(
    selector: SelectorFn<WalletAccount> = withoutHiddenSelector,
  ): Promise<WalletAccount[]> {
    return this.accountRepo.get(selector)
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
