import type {
  BackendAccount,
  BackendResponsePageable,
  BackendSession,
  IHttpService,
} from "@argent/x-shared"
import {
  addressSchemaArgentBackend,
  BaseError,
  ensureArray,
  getLatestArgentMultisigClassHash,
  HttpError,
} from "@argent/x-shared"
import { find, partition } from "lodash-es"
import urlJoin from "url-join"

import { ARGENT_ACCOUNT_URL, ARGENT_ACCOUNTS_URL } from "../../../api/constants"
import { argentApiNetworkForNetwork } from "../../../api/headers"
import { AccountError } from "../../../errors/account"
import type { PendingMultisig } from "../../../multisig/types"
import { defaultNetwork } from "../../../network"
import { getBaseDerivationPath } from "../../../signer/utils"
import { generateJwt } from "../../../smartAccount/jwt"
import type {
  IObjectStore,
  IRepository,
} from "../../../storage/__new/interface"
import { getAccountIdentifier } from "../../../utils/accountIdentifier"
import {
  accountsEqual,
  accountsEqualByAddress,
  isEqualAccountIds,
} from "../../../utils/accountsEqual"
import { getPathForIndex } from "../../../utils/derivationPath"
import { walletAccountToArgentAccount } from "../../../utils/isExternalAccount"
import { urlWithQuery } from "../../../utils/url"
import type {
  AccountId,
  ArgentWalletAccount,
  AvatarMeta,
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
import { toBaseWalletAccount } from "../../utils"
import type { IAccountService } from "../accountService/IAccountService"
import type { ISmartAccountService } from "../../../smartAccount/ISmartAccountService"
import type { IKeyValueStorage } from "../../../storage"
import type { ISessionStore } from "../../../session/storage"
import { getAccountMeta } from "../../../accountNameGenerator"
import { starknetNetworkToNetworkId } from "../../../utils/starknetNetwork"
import { getDefaultNetworkId } from "../../../network/utils"

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
    public readonly sessionStorage: IKeyValueStorage<ISessionStore>,
    public readonly multisigStore: IRepository<BaseMultisigWalletAccount>,
    public readonly pendingMultisigStore: IRepository<PendingMultisig>,
    private readonly httpService: IHttpService,
    public readonly accountService: IAccountService,
    public readonly smartAccountService: ISmartAccountService,
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
    classHash,
    signerType = SignerType.LOCAL_SECRET,
    signer: providedSigner,
  }: GetAccountArgs): ArgentWalletAccount {
    const baseDerivationPath = getBaseDerivationPath("standard", signerType)

    const signer = providedSigner ?? {
      type: signerType,
      derivationPath: getPathForIndex(index, baseDerivationPath),
    }

    const id = getAccountIdentifier(address, network.id, signer)
    const { name } = getAccountMeta(id, "standard")

    return {
      id,
      name,
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
    classHash,
    signerType = SignerType.LOCAL_SECRET,
    signer: providedSigner,
  }: GetAccountArgs): ArgentWalletAccount {
    const baseDerivationPath = getBaseDerivationPath("smart", signerType)
    const signer = providedSigner ?? {
      type: signerType,
      derivationPath: getPathForIndex(index, baseDerivationPath),
    }

    const id = getAccountIdentifier(address, network.id, signer, false)
    const { name } = getAccountMeta(id, "smart")

    return {
      id,
      name,
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
    signerType = SignerType.LOCAL_SECRET,
    signer: providedSigner,
  }: GetAccountArgs): ArgentWalletAccount {
    const baseDerivationPath = getBaseDerivationPath("multisig", signerType)

    const signer = providedSigner ?? {
      type: signerType,
      derivationPath: getPathForIndex(index, baseDerivationPath),
    }

    const id = getAccountIdentifier(address, network.id, signer)
    const { name } = getAccountMeta(id, "multisig")

    return {
      id,
      name,
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
    if (!(await this.sessionStorage.get("isUnlocked"))) {
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

  public async sendAccountLabelToBackend({
    address,
    name,
    networkId,
    avatarMeta,
  }: {
    address: string
    name: string
    networkId: string
    avatarMeta?: AvatarMeta
  }) {
    try {
      if (!ARGENT_ACCOUNT_URL) {
        throw new BaseError({ message: "ARGENT_ACCOUNTS_URL is not defined" })
      }
      const jwt = await generateJwt()
      const url = urlWithQuery(
        [ARGENT_ACCOUNT_URL, addressSchemaArgentBackend.parse(address)],
        { network: argentApiNetworkForNetwork(networkId) },
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
          icon: avatarMeta?.emoji,
          colour: avatarMeta?.bgColor,
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

  public async fetchBackendAccounts(): Promise<BackendAccount[]> {
    try {
      if (!ARGENT_ACCOUNTS_URL) {
        throw new BaseError({ message: "ARGENT_ACCOUNTS_URL is not defined" })
      }
      const jwt = await generateJwt()
      const url = urlJoin(ARGENT_ACCOUNTS_URL)
      return (
        await this.httpService.get<{ accounts: BackendAccount[] }>(url, {
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
        })
      ).accounts
    } catch {
      throw new BaseError({ message: "Failed to send account name to backend" })
    }
  }

  public async syncAccountNamesWithBackend() {
    const backendAccounts = await this.fetchBackendAccounts()

    // Not using Promise.all because using it we call setName concurrently for multiple accounts,
    // and each call to update attempts to read, modify, and write the accounts array in the accountRepo almost simultaneously.
    // This can lead to race conditions where some updates overwrite others because they all read the accounts array before any of them has a chance to write their updates back.
    for (const account of backendAccounts) {
      const wa = await this.getWalletAccountFromBackendSmartAccount(account)
      if (!wa) continue

      if (account.version && account.version < 2) {
        // WalletAccount contains generated labels
        // It's okay to do this sequentially
        await this.sendAccountLabelToBackend({
          address: account.address,
          name: wa.name,
          networkId: wa.networkId,
          avatarMeta: wa.avatarMeta,
        })
      } else {
        // Otherwise, respect user's changes and change the local state instead
        await this.accountService.setName(account.name ?? wa.name, wa.id)
        await this.accountService.setAvatarMeta(
          { bgColor: account.colour, emoji: account.icon },
          wa.id,
        )
      }
    }
  }

  public async getLastUsedAccountOnNetwork(networkId: string) {
    const lastUsedAccountByNetwork = (await this.store.get())
      .lastUsedAccountByNetwork
    return lastUsedAccountByNetwork?.[networkId]
  }

  async getActiveSessions({
    account,
    page = 0,
    size = 100,
  }: {
    account?: BaseWalletAccount
    page?: number
    size?: number
  }): Promise<BackendSession[] | undefined> {
    // Only supported on default network
    if (!account || account.networkId !== defaultNetwork.id) {
      return
    }
    // Can't get sessions if not signed in
    if (!this.smartAccountService.isSignedIn) {
      return
    }
    // Only smart accounts have sessions
    const [walletAccount] = await this.accountService.getFromBaseWalletAccounts(
      [account],
    )
    if (walletAccount.type !== "smart") {
      return
    }
    if (!ARGENT_ACCOUNT_URL) {
      throw new BaseError({ message: "ARGENT_ACCOUNT_URL is not defined" })
    }
    const jwt = await generateJwt()
    const url = urlWithQuery(
      [
        ARGENT_ACCOUNT_URL,
        addressSchemaArgentBackend.parse(account.address),
        "sessions",
      ],
      {
        page,
        size,
        network: argentApiNetworkForNetwork(account.networkId),
      },
    )
    try {
      const json = await this.httpService.get<
        BackendResponsePageable<BackendSession>
      >(url, {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      })
      return json.content
    } catch (error) {
      if (error instanceof HttpError && error.status === 403) {
        // 403 when the token is expired, or it's not actually a smart account
        return
      }
      throw error
    }
  }

  async revokeSession(session: BackendSession) {
    if (!ARGENT_ACCOUNT_URL) {
      throw new BaseError({ message: "ARGENT_ACCOUNT_URL is not defined" })
    }
    const jwt = await generateJwt()
    const url = urlJoin(
      ARGENT_ACCOUNT_URL,
      addressSchemaArgentBackend.parse(session.accountAddress),
      "sessions",
      session.sessionKey,
    )
    await this.httpService.delete(url, {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    })
  }

  async getWalletAccountFromBackendSmartAccount({
    address,
    network,
  }: Pick<BackendAccount, "address" | "network">) {
    const networkId = network
      ? starknetNetworkToNetworkId(network)
      : getDefaultNetworkId()

    const accounts = await this.accountService.get(
      (acc) => acc.type === "smart",
    )

    // This should be safe because Smart Account are unique by address and network
    const account = accounts.find((acc) =>
      accountsEqualByAddress(acc, { address, networkId }),
    )
    if (!account) {
      return
    }
    return account
  }
}
