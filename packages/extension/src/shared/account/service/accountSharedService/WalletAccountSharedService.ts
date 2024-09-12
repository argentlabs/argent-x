import { find, partition } from "lodash-es"

import {
  addressSchemaArgentBackend,
  BaseError,
  ensureArray,
  getLatestArgentMultisigClassHash,
  IHttpService,
} from "@argent/x-shared"
import { ARGENT_ACCOUNT_URL, ARGENT_ACCOUNTS_URL } from "../../../api/constants"
import { AccountError } from "../../../errors/account"
import { PendingMultisig } from "../../../multisig/types"
import { defaultNetwork } from "../../../network"
import { IObjectStore, IRepository } from "../../../storage/__new/interface"
import { accountsEqual } from "../../../utils/accountsEqual"
import { getIndexForPath, getPathForIndex } from "../../../utils/derivationPath"
import {
  BaseMultisigWalletAccount,
  BaseWalletAccount,
  CreateAccountType,
  defaultNetworkOnlyPlaceholderAccount,
  isNetworkOnlyPlaceholderAccount,
  MultisigWalletAccount,
  NetworkOnlyPlaceholderAccount,
  SignerType,
  WalletAccount,
  WalletAccountSigner,
} from "../../../wallet.model"
import type { WalletStorageProps } from "../../../wallet/walletStore"
import { withHiddenSelector } from "../../selectors"

import urlJoin from "url-join"
import { getBaseDerivationPath } from "../../../signer/utils"
import { SMART_ACCOUNT_NETWORK_ID } from "../../../smartAccount/constants"
import { generateJwt } from "../../../smartAccount/jwt"
import { IAccountService } from "../accountService/IAccountService"

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
    signer,
  }: GetAccountArgs): WalletAccount {
    const baseDerivationPath = getBaseDerivationPath("standard", signerType)
    return {
      name: name || `Account ${index + 1}`,
      address,
      network,
      networkId: network.id,
      type: "standard",
      signer: signer || {
        derivationPath: getPathForIndex(index, baseDerivationPath),
        type: signerType,
      },
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
  }: GetAccountArgs): WalletAccount {
    const baseDerivationPath = getBaseDerivationPath("smart", signerType)
    return {
      name: name || `Account ${index + 1}`,
      address,
      network,
      networkId: network.id,
      type: "smart",
      signer: {
        derivationPath: getPathForIndex(index, baseDerivationPath),
        type: signerType,
      },
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
  }: GetAccountArgs): WalletAccount {
    const baseDerivationPath = getBaseDerivationPath("multisig", signerType)
    return {
      name: name || `Multisig ${index + 1}`,
      address,
      networkId: network.id,
      network,
      type: "multisig",
      signer: {
        derivationPath: getPathForIndex(index, baseDerivationPath),
        type: signerType,
      },
      classHash: getLatestArgentMultisigClassHash(),
      cairoVersion: "1",
      needsDeploy,
    }
  }

  // TODO rewrite using views, move out of service and rename to accountView
  public async getAccount(
    selector: BaseWalletAccount,
  ): Promise<WalletAccount | null> {
    const [hit] = await this.walletStore.get((account) =>
      accountsEqual(account, selector),
    )
    if (!hit) {
      throw new AccountError({ code: "NOT_FOUND" })
    }
    return hit
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
      | BaseWalletAccount
      | NetworkOnlyPlaceholderAccount = defaultNetworkOnlyPlaceholderAccount,
  ) {
    if (isNetworkOnlyPlaceholderAccount(accountIdentifier)) {
      await this.store.set({ selected: accountIdentifier })
      return accountIdentifier
    }

    const accounts = await this.walletStore.get()
    const account = find(accounts, (account) =>
      accountsEqual(account, accountIdentifier),
    )

    if (!account) {
      throw new AccountError({ code: "NOT_FOUND" })
    }

    const { address, networkId } = account // makes sure to strip away unused properties
    await this.store.set({ selected: { address, networkId } })

    await this.updateLastUsedAccountOnNetwork(networkId, account)

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
      lastUsedAccountByNetwork[networkId] = account
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
        noUpgradeBannerAccounts: updatedAccounts.map(
          ({ address, networkId }) => ({
            address,
            networkId,
          }),
        ),
      })
    }
  }

  public async getMultisigAccount(
    selector: BaseWalletAccount,
  ): Promise<MultisigWalletAccount> {
    const [walletAccount] = await this.walletStore.get(
      (account) =>
        accountsEqual(account, selector) && account.type === "multisig",
    )
    if (!walletAccount) {
      throw new AccountError({ code: "MULTISIG_NOT_FOUND" })
    }

    const [multisigBaseWalletAccount] = await this.multisigStore.get(
      (account) => accountsEqual(account, selector),
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
    } catch (e) {
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
    } catch (e) {
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
      await this.accountService.setName(account.name, account)
    }
  }

  public async getLastUsedAccountOnNetwork(networkId: string) {
    const lastUsedAccountByNetwork = (await this.store.get())
      .lastUsedAccountByNetwork
    return lastUsedAccountByNetwork?.[networkId]
  }
}
