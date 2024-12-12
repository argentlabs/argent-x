import { find, partition } from "lodash-es"

import type { IHttpService } from "@argent/x-shared"
import {
  addressSchemaArgentBackend,
  BaseError,
  ensureArray,
  getLatestArgentMultisigClassHash,
} from "@argent/x-shared"
import { ARGENT_ACCOUNT_URL, ARGENT_ACCOUNTS_URL } from "../../../api/constants"
import { AccountError } from "../../../errors/account"
import type { PendingMultisig } from "../../../multisig/types"
import { defaultNetwork } from "../../../network"
import type {
  IObjectStore,
  IRepository,
} from "../../../storage/__new/interface"
import { accountsEqual, isEqualAccountIds } from "../../../utils/accountsEqual"
import { getIndexForPath, getPathForIndex } from "../../../utils/derivationPath"
import type {
  AccountId,
  ArgentWalletAccount,
  BaseMultisigWalletAccount,
  BaseWalletAccount,
  CreateAccountType,
  MultisigWalletAccount,
  NetworkOnlyPlaceholderAccount,
  WalletAccount,
  WalletAccountSigner,
} from "../../../wallet.model"
import {
  defaultNetworkOnlyPlaceholderAccount,
  isNetworkOnlyPlaceholderAccount,
  SignerType,
} from "../../../wallet.model"
import type { WalletStorageProps } from "../../../wallet/walletStore"
import { withHiddenSelector } from "../../selectors"

import urlJoin from "url-join"
import { getBaseDerivationPath } from "../../../signer/utils"
import { SMART_ACCOUNT_NETWORK_ID } from "../../../smartAccount/constants"
import { generateJwt } from "../../../smartAccount/jwt"
import type { IAccountService } from "../accountService/IAccountService"
import { walletAccountToArgentAccount } from "../../../utils/isExternalAccount"
import { getAccountIdentifier } from "../../../utils/accountIdentifier"
import { toBaseWalletAccount } from "../../utils"

export interface WalletSession {
  secret: string
  password: string
}

interface GetAccountArgs
  extends Pick<
    WalletAccount,
    "address" | "network" | "needsDeploy" | "classHash"
  > {
  index: number
  name?: string
  signerType?: SignerType
  signer?: WalletAccountSigner
}

export class WalletAccountSharedService {
  constructor(
    public readonly store: IObjectStore<WalletStorageProps>,
    public readonly walletStore: IRepository<WalletAccount>,
    public readonly sessionStore: IObjectStore<WalletSession | null>,
    public readonly multisigStore: IRepository<BaseMultisigWalletAccount>,
    public readonly pendingMultisigStore: IRepository<PendingMultisig>,
    private readonly httpService: IHttpService,
    public readonly accountService: IAccountService,
  ) {}

  public async getDefaultAccountName(
    networkId: string,
    type: CreateAccountType,
  ): Promise<string> {
    const accounts = await this.walletStore.get(withHiddenSelector)
    const pendingMultisigs = await this.pendingMultisigStore.get()

    const networkAccounts = accounts.filter(
      (account) => account.networkId === networkId,
    )

    const [multisigs, standards] = partition(
      networkAccounts,
      (account) => account.type === "multisig",
    )

    const allMultisigs = [...multisigs, ...pendingMultisigs]

    const defaultAccountName =
      type === "multisig"
        ? `Multisig ${allMultisigs.length + 1}`
        : `Account ${standards.length + 1}`

    return defaultAccountName
  }

  public getDefaultStandardAccount({
    index,
    address,
    network,
    needsDeploy,
    name,
    classHash,
    signerType = SignerType.LOCAL_SECRET,
    signer: providedSigner,
  }: GetAccountArgs): ArgentWalletAccount {
    const baseDerivationPath = getBaseDerivationPath("standard", signerType)

    const signer = providedSigner ?? {
      type: signerType,
      derivationPath: getPathForIndex(index, baseDerivationPath),
    }

    return {
      id: getAccountIdentifier(address, network.id, signer),
      name: name || `Account ${index + 1}`,
      address,
      network,
      networkId: network.id,
      type: "standard",
      signer,
      classHash,
      needsDeploy,
    }
  }

  public getDefaultSmartAccount({
    index,
    address,
    network,
    needsDeploy,
    name,
    classHash,
    signerType = SignerType.LOCAL_SECRET,
    signer: providedSigner,
  }: GetAccountArgs): ArgentWalletAccount {
    const baseDerivationPath = getBaseDerivationPath("smart", signerType)
    const signer = providedSigner ?? {
      type: signerType,
      derivationPath: getPathForIndex(index, baseDerivationPath),
    }

    return {
      id: getAccountIdentifier(address, network.id, signer, false),
      name: name || `Account ${index + 1}`,
      address,
      network,
      networkId: network.id,
      type: "smart",
      signer,
      classHash,
      needsDeploy,
    }
  }

  public getDefaultMultisigAccount({
    index,
    address,
    network,
    needsDeploy,
    name,
    signerType = SignerType.LOCAL_SECRET,
    signer: providedSigner,
  }: GetAccountArgs): ArgentWalletAccount {
    const baseDerivationPath = getBaseDerivationPath("multisig", signerType)

    const signer = providedSigner ?? {
      type: signerType,
      derivationPath: getPathForIndex(index, baseDerivationPath),
    }

    return {
      id: getAccountIdentifier(address, network.id, signer),
      name: name || `Multisig ${index + 1}`,
      address,
      networkId: network.id,
      network,
      type: "multisig",
      signer,
      classHash: getLatestArgentMultisigClassHash(),
      cairoVersion: "1",
      needsDeploy,
    }
  }

  // TODO rewrite using views, move out of service and rename to accountView
  public async getAccount(accountId: AccountId): Promise<WalletAccount | null> {
    const [hit] = await this.walletStore.get((account) =>
      isEqualAccountIds(account.id, accountId),
    )
    if (!hit) {
      throw new AccountError({ code: "NOT_FOUND" })
    }
    return hit
  }

  public async getArgentAccount(
    accountId: AccountId,
  ): Promise<ArgentWalletAccount | null> {
    const account = await this.getAccount(accountId)
    if (!account) {
      return null
    }

    return walletAccountToArgentAccount(account)
  }

  public async getSelectedAccount(): Promise<WalletAccount | undefined> {
    // Replace with session service once instantiated
    if ((await this.sessionStore.get()) === null) {
      return
    }
    const accounts = await this.walletStore.get()
    const selectedAccount = (await this.store.get()).selected
    const defaultAccount =
      accounts.find((account) => account.networkId === defaultNetwork.id) ??
      accounts[0]
    if (!selectedAccount || isNetworkOnlyPlaceholderAccount(selectedAccount)) {
      return defaultAccount
    }
    const account = find(accounts, (account) =>
      accountsEqual(selectedAccount, account),
    )
    return account ?? defaultAccount
  }

  public async selectAccount(
    accountIdentifier:
      | AccountId
      | NetworkOnlyPlaceholderAccount = defaultNetworkOnlyPlaceholderAccount,
  ) {
    if (isNetworkOnlyPlaceholderAccount(accountIdentifier)) {
      await this.store.set({ selected: accountIdentifier })
      return accountIdentifier
    }

    const accounts = await this.walletStore.get()
    const account = find(accounts, (account) =>
      isEqualAccountIds(account.id, accountIdentifier),
    )

    if (!account) {
      throw new AccountError({ code: "NOT_FOUND" })
    }

    const baseAccount = toBaseWalletAccount(account)
    await this.store.set({ selected: baseAccount })

    await this.updateLastUsedAccountOnNetwork(
      baseAccount.networkId,
      baseAccount,
    )

    return account
  }

  public async updateLastUsedAccountOnNetwork(
    networkId: string,
    account: BaseWalletAccount,
  ) {
    let lastUsedAccountByNetwork = (await this.store.get())
      ?.lastUsedAccountByNetwork
    if (!lastUsedAccountByNetwork) {
      lastUsedAccountByNetwork = {}
    }
    if (!accountsEqual(lastUsedAccountByNetwork[networkId], account)) {
      const baseAccount = toBaseWalletAccount(account)
      lastUsedAccountByNetwork[networkId] = baseAccount
      await this.store.set({ lastUsedAccountByNetwork })
    }
  }

  public async dismissUpgradeBannerForAccount(account: BaseWalletAccount) {
    const currentAccounts = ensureArray(
      (await this.store.get())?.noUpgradeBannerAccounts,
    )
    const accountExists = currentAccounts.some((acc) =>
      accountsEqual(acc, account),
    )

    if (!accountExists) {
      const updatedAccounts = [...currentAccounts, account]
      await this.store.set({
        noUpgradeBannerAccounts: updatedAccounts.map(toBaseWalletAccount),
      })
    }
  }

  public async getMultisigAccount(
    accountId: AccountId,
  ): Promise<MultisigWalletAccount> {
    const [walletAccount] = await this.walletStore.get(
      (account) =>
        isEqualAccountIds(account.id, accountId) && account.type === "multisig",
    )
    if (!walletAccount) {
      throw new AccountError({ code: "MULTISIG_NOT_FOUND" })
    }

    const [multisigBaseWalletAccount] = await this.multisigStore.get(
      (account) => isEqualAccountIds(account.id, accountId),
    )

    if (!multisigBaseWalletAccount) {
      throw new AccountError({ code: "MULTISIG_BASE_NOT_FOUND" })
    }

    return {
      ...walletAccount,
      ...multisigBaseWalletAccount,
      type: "multisig",
    }
  }

  public async sendAccountNameToBackend({
    address,
    name,
  }: {
    address: string
    name: string
  }) {
    try {
      const jwt = await generateJwt()
      if (!ARGENT_ACCOUNT_URL) {
        throw new BaseError({ message: "ARGENT_ACCOUNTS_URL is not defined" })
      }
      const url = urlJoin(
        ARGENT_ACCOUNT_URL,
        addressSchemaArgentBackend.parse(address),
      )
      const currentValue = await this.httpService.get<{ version: number }>(
        url,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
        },
      )

      await this.httpService.put(url, {
        method: "PUT",
        body: JSON.stringify({
          name,
          version: currentValue.version,
        }),
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      })
    } catch {
      throw new BaseError({ message: "Failed to send account name to backend" })
    }
  }

  public async sendSmartAccountsNamesToBackend() {
    const accounts = await this.walletStore.get()
    await Promise.all(
      accounts
        .filter((acc) => acc.type === "smart")
        // we only save the name if it's different from the default, to avoid overriding account names set before a recovery
        .filter((acc) => {
          const baseDerivationPath = getBaseDerivationPath(
            "smart",
            acc.signer.type,
          )
          const accountIndex = getIndexForPath(
            acc.signer.derivationPath,
            baseDerivationPath,
          )
          return !!acc.name && acc.name !== `Account ${accountIndex + 1}`
        })
        .map((account) =>
          this.sendAccountNameToBackend({
            address: account.address,
            name: account.name,
          }),
        ),
    )
  }

  public async getAccountNamesFromBackend(): Promise<WalletAccount[]> {
    try {
      const jwt = await generateJwt()
      if (!ARGENT_ACCOUNTS_URL) {
        throw new BaseError({ message: "ARGENT_ACCOUNTS_URL is not defined" })
      }
      const url = urlJoin(ARGENT_ACCOUNTS_URL)
      return (
        await this.httpService.get<{ accounts: WalletAccount[] }>(url, {
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
        })
      ).accounts.map((account) => {
        // BE does not retrieve the networkId because smart accounts are not multi-network. E.g. in prod you cannot add smart accounts on Sepolia
        return { ...account, networkId: SMART_ACCOUNT_NETWORK_ID }
      })
    } catch {
      throw new BaseError({ message: "Failed to send account name to backend" })
    }
  }

  public async syncAccountNamesWithBackend() {
    await this.sendSmartAccountsNamesToBackend()

    const accounts = await this.getAccountNamesFromBackend()

    // Not using Promise.all because using it we call setName concurrently for multiple accounts,
    // and each call to update attempts to read, modify, and write the accounts array in the accountRepo almost simultaneously.
    // This can lead to race conditions where some updates overwrite others because they all read the accounts array before any of them has a chance to write their updates back.
    for (const account of accounts) {
      await this.accountService.setName(account.name, account.id)
    }
  }

  public async getLastUsedAccountOnNetwork(networkId: string) {
    const lastUsedAccountByNetwork = (await this.store.get())
      .lastUsedAccountByNetwork
    return lastUsedAccountByNetwork?.[networkId]
  }
}
