import { AllowArray } from "starknet"

import { getAccountSelector, withoutHiddenSelector } from "../account/selectors"
import {
  accountStore,
  addAccounts,
  getAccounts,
  removeAccount,
} from "../account/store"
import { ArrayStorage } from "../storage"
import { SelectorFn } from "../storage/types"
import {
  BaseMultisigWalletAccount,
  BaseWalletAccount,
  MultisigWalletAccount,
  WalletAccount,
} from "../wallet.model"
import { accountsEqual } from "../wallet.service"

export const multisigBaseWalletStore =
  new ArrayStorage<BaseMultisigWalletAccount>([], {
    namespace: "core:multisig:baseWallet",
    compare: accountsEqual,
  })

export async function getBaseMultisigAccounts(): Promise<
  BaseMultisigWalletAccount[]
> {
  return multisigBaseWalletStore.get()
}

export async function getMultisigAccounts(
  selector: SelectorFn<WalletAccount> = withoutHiddenSelector,
): Promise<MultisigWalletAccount[]> {
  const baseMultisigAccounts = await getBaseMultisigAccounts()
  const walletAccounts = await getAccounts(selector)

  return baseMultisigAccounts
    .map((baseMultisigAccount) => {
      const walletAccount = walletAccounts.find((walletAccount) =>
        accountsEqual(walletAccount, baseMultisigAccount),
      )

      return {
        ...walletAccount,
        ...baseMultisigAccount,
        type: "multisig",
      }
    })
    .filter((account): account is MultisigWalletAccount => !!account) // If the account is hidden, it will be undefined and filtered out here
}

export async function getMultisigAccountFromBaseWallet(
  baseWalletAccount: BaseWalletAccount,
): Promise<MultisigWalletAccount | undefined> {
  const baseMultisigWalletAccounts = await getBaseMultisigAccounts()
  const walletAccounts = await getAccounts()

  const bma = baseMultisigWalletAccounts.find((baseMultisigWalletAccount) =>
    accountsEqual(baseMultisigWalletAccount, baseWalletAccount),
  )

  const wa = walletAccounts.find((walletAccount) =>
    accountsEqual(walletAccount, baseWalletAccount),
  )

  if (!bma || !wa) {
    return undefined
  }

  return {
    ...wa,
    ...bma,
    type: "multisig",
  }
}

export async function addBaseMultisigAccounts(
  account: AllowArray<BaseMultisigWalletAccount>,
): Promise<void> {
  await multisigBaseWalletStore.push(account)
}

export async function addMultisigAccounts(
  account: AllowArray<MultisigWalletAccount>,
): Promise<void> {
  await addAccounts(account)
  await addBaseMultisigAccounts(account)
}

export async function updateBaseMultisigAccount(
  baseAccount: BaseMultisigWalletAccount,
) {
  await multisigBaseWalletStore.push(baseAccount)

  return getMultisigAccountFromBaseWallet(baseAccount)
}

export async function removeMultisigAccount(
  baseAccount: BaseMultisigWalletAccount,
): Promise<void> {
  await multisigBaseWalletStore.remove((account) =>
    accountsEqual(account, baseAccount),
  )

  await removeAccount(baseAccount)
}

export async function hideAccount(
  baseAccount: BaseMultisigWalletAccount,
): Promise<void> {
  const [hit] = await getAccounts(getAccountSelector(baseAccount))
  if (!hit) {
    return
  }

  await accountStore.push({
    ...hit,
    hidden: true,
  })
}
