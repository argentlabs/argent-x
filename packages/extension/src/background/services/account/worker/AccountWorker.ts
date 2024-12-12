import type { IScheduleService } from "../../../../shared/schedule/IScheduleService"
import type {
  ArgentAccountType,
  ArgentWalletAccount,
  BaseWalletAccount,
  NetworkOnlyPlaceholderAccount,
  WalletAccount,
  WalletAccountType,
} from "../../../../shared/wallet.model"
import { accountIdSchema } from "../../../../shared/wallet.model"
import { getAccountClassHashFromChain } from "../../../../shared/account/details/getAccountClassHashFromChain"
import { getAccountCairoVersionFromChain } from "../../../../shared/account/details/getAccountCairoVersionFromChain"
import type { IAccountService } from "../../../../shared/account/service/accountService/IAccountService"
import { keyBy } from "lodash-es"
import { onInstallAndUpgrade } from "../../worker/schedule/decorators"

import type { AllowArray } from "../../../../shared/storage/__new/interface"
import { pipe } from "../../worker/schedule/pipe"
import { getOwnerForAccount } from "../../../../shared/account/details/getOwner"
import type {
  AccountActivityPayload,
  IActivityService,
} from "../../activity/IActivityService"
import {
  AccountDeployActivity,
  GuardianChangedActivity,
  SignerChangedActivity,
} from "../../activity/IActivityService"
import { getGuardianForAccount } from "../../../../shared/account/details/getGuardian"
import { getAccountIdentifier } from "../../../../shared/utils/accountIdentifier"
import type { IWalletStore } from "../../../../shared/wallet/walletStore"
import { isEqualAddress } from "@argent/x-shared"
import { filterArgentAccounts } from "../../../../shared/utils/isExternalAccount"
import type { AnalyticsService } from "../../../../shared/analytics/AnalyticsService"

export enum AccountUpdaterTaskId {
  ACCOUNT_UPDATE_ON_STARTUP = "accountUpdateOnStartup",
  ACCOUNT_UPDATE_ON_INSTALL_AND_UPGRADE = "accountUpdateOnInstallAndUpgrade",
}

enum AccountUpdaterTask {
  UPDATE_ACCOUNT_ID,
  UPDATE_DEPLOYED,
  UPDATE_ACCOUNT_CLASS_HASH,
  UPDATE_ACCOUNT_CAIRO_VERSION,
  UPDATE_ACCOUNT_GUARDIAN,
}

export class AccountWorker {
  constructor(
    private readonly walletStore: IWalletStore,
    private readonly accountService: IAccountService,
    private readonly activityService: IActivityService,
    private readonly scheduleService: IScheduleService<AccountUpdaterTaskId>,
    private readonly ampli: AnalyticsService,
  ) {
    this.activityService.emitter.on(
      SignerChangedActivity,
      this.onSignerChanged.bind(this),
    )
    this.activityService.emitter.on(
      AccountDeployActivity,
      this.updateDeployed.bind(this),
    )
    this.activityService.emitter.on(
      GuardianChangedActivity,
      this.onGuardianChanged.bind(this),
    )
  }

  async updateAccountUserProperties() {
    const accounts = await this.accountService.get()

    // count the number of accounts by type
    const counts = accounts.reduce<{
      [Key in WalletAccountType | "ledger" | "testnet"]?: number
    }>(
      (acc, account) => {
        if (account.networkId === "sepolia-alpha") {
          acc.testnet = (acc.testnet || 0) + 1
        } else if (account.networkId === "mainnet-alpha") {
          acc[account.type] = (acc[account.type] || 0) + 1
          if (account.signer.type === "ledger") {
            acc.ledger = (acc.ledger || 0) + 1
          }
        }
        return acc
      },
      { standard: 0, smart: 0, multisig: 0, ledger: 0, testnet: 0 },
    )

    void this.ampli.identify(undefined, {
      "ArgentX Standard Accounts Count": counts.standard,
      "ArgentX Smart Accounts Count": counts.smart,
      "ArgentX Ledger Accounts Count": counts.ledger,
      "ArgentX Multisig Accounts Count": counts.multisig,
      "ArgentX Testnet Accounts Count": counts.testnet,
    })
  }

  runUpdaterForAllTasks = pipe(
    onInstallAndUpgrade(this.scheduleService), // This will run the function on install and upgrade
  )(async (): Promise<void> => {
    await this.runUpdaterTask([
      AccountUpdaterTask.UPDATE_ACCOUNT_ID,
      AccountUpdaterTask.UPDATE_DEPLOYED,
      AccountUpdaterTask.UPDATE_ACCOUNT_CLASS_HASH,
      AccountUpdaterTask.UPDATE_ACCOUNT_CAIRO_VERSION,
      AccountUpdaterTask.UPDATE_ACCOUNT_GUARDIAN,
    ])
    await this.updateAccountUserProperties()
  })

  /** @internal just exposed for testing */
  async runUpdaterTask(tasks: AllowArray<AccountUpdaterTask>): Promise<void> {
    const updaterTasks = Array.isArray(tasks) ? tasks : [tasks]
    for (const task of updaterTasks) {
      switch (task) {
        case AccountUpdaterTask.UPDATE_ACCOUNT_ID:
          await this.updateAccountId()
          break
        case AccountUpdaterTask.UPDATE_DEPLOYED:
          await this.updateDeployed()
          break
        case AccountUpdaterTask.UPDATE_ACCOUNT_CLASS_HASH:
          await this.updateAccountClassHash()
          break
        case AccountUpdaterTask.UPDATE_ACCOUNT_CAIRO_VERSION:
          await this.updateAccountCairoVersion()
          break
        case AccountUpdaterTask.UPDATE_ACCOUNT_GUARDIAN:
          await this.updateAccountGuardian()
      }
    }
  }

  /** @internal just exposed for testing */
  async updateDeployed(): Promise<void> {
    const accounts = await this.accountService.get(
      (account) => account.needsDeploy !== false,
    )

    const deployStatuses = await Promise.allSettled(
      accounts.map((account) =>
        this.accountService.getDeployed(account).then((deployed) => ({
          deployed,
          account,
        })),
      ),
    )

    const newlyDeployedAccounts = deployStatuses.reduce<WalletAccount[]>(
      (acc, status) => {
        if (status.status === "fulfilled" && status.value.deployed) {
          acc.push({ ...status.value.account, needsDeploy: false })
        }
        return acc
      },
      [],
    )

    await this.accountService.upsert(newlyDeployedAccounts)
  }

  /** @internal just exposed for testing */
  async updateAccountClassHash(): Promise<void> {
    const accounts = await this.accountService.getArgentWalletAccounts()
    const accountsWithClassHash = await getAccountClassHashFromChain(accounts)

    // Create a map to store accountWithClassHash with key as unique account id.
    const accountsWithClassHashMap = keyBy(accountsWithClassHash, "id")

    const updated = accounts.map((account) => {
      return accountsWithClassHashMap[account.id]
        ? { ...account, ...accountsWithClassHashMap[account.id] }
        : account
    })

    await this.accountService.upsert(updated)
  }

  /** @internal just exposed for testing */
  async updateAccountCairoVersion(): Promise<void> {
    const accounts = await this.accountService.getArgentWalletAccounts()

    const accountsWithCairoVersion =
      await getAccountCairoVersionFromChain(accounts)

    // Create a map to store accountWithCairoVersion with key as unique account id.
    const accountsWithCairoVersionMap = keyBy(accountsWithCairoVersion, "id")

    const updated = accounts.map((account) => {
      return accountsWithCairoVersionMap[account.id]
        ? { ...account, ...accountsWithCairoVersionMap[account.id] }
        : account
    })

    await this.accountService.upsert(updated)
  }

  async updateAccountGuardian() {
    const accounts = await this.accountService.getArgentWalletAccounts()
    await this.updateGuardianForAccounts(accounts)
  }

  async onSignerChanged(payload: AccountActivityPayload) {
    const accounts =
      await this.accountService.getFromBaseWalletAccounts(payload)
    const results = await Promise.allSettled(
      accounts.map((account) => {
        return getOwnerForAccount(account)
      }),
    )
    const updated = accounts.map((account, index) => {
      const result = results[index]
      const owner = result.status === "fulfilled" ? result.value : undefined
      return {
        ...account,
        owner,
      }
    })
    await this.accountService.upsert(updated)
  }

  async onGuardianChanged(payload: AccountActivityPayload) {
    const accounts =
      await this.accountService.getFromBaseWalletAccounts(payload)
    await this.updateGuardianForAccounts(filterArgentAccounts(accounts))
  }

  async updateAccountId() {
    const accounts = await this.accountService.get()

    const accountsWithoutId = accounts.filter(
      (account) => !accountIdSchema.safeParse(account.id).success, // This is future-proof as we can change the id format in the future
    )

    if (accountsWithoutId.length === 0) {
      await this.updateSelectedAccount()
      return
    }

    const updatedAccountsWithoutId = accountsWithoutId.map((acc) => ({
      ...acc,
      id: getAccountIdentifier(acc.address, acc.networkId, acc.signer),
    }))

    await this.accountService.remove(
      (acc) => !accountIdSchema.safeParse(acc.id).success, // Need to use selector function instead of values to override the default compare function
    )

    await this.accountService.upsert(updatedAccountsWithoutId)
    await this.updateSelectedAccount()
  }

  private async getAccountWithId(
    account: BaseWalletAccount | NetworkOnlyPlaceholderAccount | null,
  ) {
    if (!account || account.id) {
      return account
    }

    const accountsOnNetwork = await this.accountService.get(
      (acc) => acc.networkId === account.networkId,
    )

    const fullSelectedAccount = accountsOnNetwork.find(
      (acc) => account.address && isEqualAddress(acc.address, account.address),
    )

    const { id, address, networkId } =
      fullSelectedAccount ?? accountsOnNetwork[0]

    return {
      id,
      address,
      networkId,
    }
  }

  async updateSelectedAccount() {
    const { selected, lastUsedAccountByNetwork } = await this.walletStore.get()

    let updatedSelected
    if (selected && !selected.id) {
      updatedSelected = await this.getAccountWithId(selected)
    }

    const updatedLastUsedAccountByNetwork: Record<string, BaseWalletAccount> =
      {}

    for (const networkId in lastUsedAccountByNetwork) {
      const account = lastUsedAccountByNetwork[networkId]
      const accountWithId = await this.getAccountWithId(account)

      if (accountWithId) {
        updatedLastUsedAccountByNetwork[networkId] = accountWithId
      }
    }

    await this.walletStore.set({
      ...(updatedSelected && { selected: updatedSelected }),
      lastUsedAccountByNetwork: {
        ...lastUsedAccountByNetwork,
        ...updatedLastUsedAccountByNetwork,
      },
    })
  }

  private async updateGuardianForAccounts(accounts: ArgentWalletAccount[]) {
    const results = await Promise.allSettled(
      accounts
        .filter((account) => !account.needsDeploy)
        .map(async (account) => ({
          address: account.address,
          guardian: await getGuardianForAccount(account),
        })),
    )

    const updated = accounts.map((account) => {
      const result = results
        .filter((r) => r.status === "fulfilled")
        .find((r) => isEqualAddress(r.value.address, account.address))

      if (!result) {
        return { ...account }
      }

      const onChainGuardian = result.value.guardian
      const guardian =
        account.needsDeploy && account.guardian
          ? account.guardian
          : onChainGuardian

      // we need to update the type to smart if guardian is enabled, or to standard if the guardian is disabled
      let updatedType: ArgentAccountType | undefined
      if (guardian) {
        updatedType = "smart"
      } else if (account.type === "smart") {
        updatedType = "standard"
      }

      return {
        ...account,
        guardian,
        ...(updatedType ? { type: updatedType } : {}),
      }
    })

    await this.accountService.upsert(updated)
  }
}
