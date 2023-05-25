import { AllowArray } from "starknet"

import { withoutHiddenSelector } from "../../account/selectors"
import { accountService } from "../../account/service"
import { SelectorFn } from "../../storage/types"
import {
  BaseMultisigWalletAccount,
  BaseWalletAccount,
  MultisigWalletAccount,
  WalletAccount,
} from "../../wallet.model"
import { accountsEqual } from "../../wallet.service"
import { multisigBaseWalletStore } from "../store"

export async function getBaseMultisigAccounts(): Promise<
  BaseMultisigWalletAccount[]
> {
  return multisigBaseWalletStore.get()
}

export async function getMultisigAccounts(
  selector: SelectorFn<WalletAccount> = withoutHiddenSelector,
): Promise<MultisigWalletAccount[]> {
  const baseMultisigAccounts = await getBaseMultisigAccounts()
  const walletAccounts = await accountService.get(selector)

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
  const walletAccounts = await accountService.get()

  const baseMultisigAccount = baseMultisigWalletAccounts.find((acc) =>
    accountsEqual(acc, baseWalletAccount),
  )

  const walletAccount = walletAccounts.find((acc) =>
    accountsEqual(acc, baseWalletAccount),
  )

  if (!baseMultisigAccount || !walletAccount) {
    return undefined
  }

  return {
    ...walletAccount,
    ...baseMultisigAccount,
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
  await accountService.upsert(account)
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

  await accountService.remove(baseAccount)
}

export async function hideMultisig(
  baseAccount: BaseMultisigWalletAccount,
): Promise<void> {
  await accountService.setHide(true, baseAccount)
}
