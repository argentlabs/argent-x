import { find, partition } from "lodash-es"

import {
  BaseMultisigWalletAccount,
  CreateAccountType,
  MultisigWalletAccount,
} from "../../../shared/wallet.model"
import { withHiddenSelector } from "../../../shared/account/selectors"
import { PendingMultisig } from "../../../shared/multisig/types"
import { Network, defaultNetwork } from "../../../shared/network"
import { BaseWalletAccount, WalletAccount } from "../../../shared/wallet.model"
import {
  MULTISIG_DERIVATION_PATH,
  STANDARD_DERIVATION_PATH,
} from "../../../shared/wallet.service"
import {
  IObjectStore,
  IRepository,
} from "../../../shared/storage/__new/interface"
import { accountsEqual } from "./../../../shared/utils/accountsEqual"
import { getPathForIndex } from "../../keys/keyDerivation"
import { AccountError } from "../../../shared/errors/account"
import { MULTISIG_ACCOUNT_CLASS_HASH } from "../../../shared/network/constants"

export interface WalletSession {
  secret: string
  password: string
}

export interface WalletStorageProps {
  backup?: string
  selected?: BaseWalletAccount | null
  discoveredOnce?: boolean
}

export class WalletAccountSharedService {
  constructor(
    public readonly store: IObjectStore<WalletStorageProps>,
    public readonly walletStore: IRepository<WalletAccount>,
    public readonly sessionStore: IObjectStore<WalletSession | null>,
    public readonly multisigStore: IRepository<BaseMultisigWalletAccount>,
    public readonly pendingMultisigStore: IRepository<PendingMultisig>,
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

  public getDefaultStandardAccount(
    index: number,
    address: string,
    network: Network,
    needsDeploy: boolean,
  ): WalletAccount {
    return {
      name: `Account ${index + 1}`,
      address,
      network,
      networkId: network.id,
      type: "standard",
      signer: {
        derivationPath: getPathForIndex(index, STANDARD_DERIVATION_PATH),
        type: "local_secret",
      },
      needsDeploy,
    }
  }

  public getDefaultMultisigAccount(
    index: number,
    address: string,
    network: Network,
    needsDeploy: boolean,
  ): WalletAccount {
    return {
      name: `Multisig ${index + 1}`,
      address,
      networkId: network.id,
      network,
      type: "multisig",
      signer: {
        derivationPath: getPathForIndex(index, MULTISIG_DERIVATION_PATH),
        type: "local_secret",
      },
      classHash: MULTISIG_ACCOUNT_CLASS_HASH,
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
    if (!selectedAccount) {
      return defaultAccount
    }
    const account = find(accounts, (account) =>
      accountsEqual(selectedAccount, account),
    )
    return account ?? defaultAccount
  }

  public async selectAccount(accountIdentifier?: BaseWalletAccount | null) {
    if (!accountIdentifier) {
      // handles undefined and null
      await this.store.set({ selected: null }) // Set null instead of undefinded
      return
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
    return account
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
}
