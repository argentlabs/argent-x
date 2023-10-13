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
import { accountsEqual } from "../../utils/accountsEqual"
import { multisigBaseWalletRepo } from "../repository"
import { MULTISIG_ACCOUNT_CLASS_HASH } from "../../network/constants"

export async function getBaseMultisigAccounts(): Promise<
  BaseMultisigWalletAccount[]
> {
  return multisigBaseWalletRepo.get()
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
  await multisigBaseWalletRepo.upsert(account)
}

export async function addMultisigAccount(
  account: MultisigWalletAccount,
): Promise<void> {
  await accountService.upsert({
    address: account.address,
    name: account.name,
    network: account.network,
    networkId: account.networkId,
    signer: account.signer,
    type: account.type,
    escape: account.escape,
    hidden: account.hidden,
    guardian: account.guardian,
    needsDeploy: account.needsDeploy,
    classHash: MULTISIG_ACCOUNT_CLASS_HASH,
    cairoVersion: "1",
  })

  await addBaseMultisigAccounts({
    address: account.address,
    networkId: account.networkId,
    publicKey: account.publicKey,
    signers: account.signers,
    threshold: account.threshold,
    creator: account.creator,
    updatedAt: Date.now(),
  })
}

export async function hideMultisig(
  baseAccount: BaseMultisigWalletAccount,
): Promise<void> {
  await accountService.setHide(true, baseAccount)
}

export async function updateBaseMultisigAccount(
  baseAccount: BaseMultisigWalletAccount,
) {
  await multisigBaseWalletRepo.upsert(baseAccount)

  return getMultisigAccountFromBaseWallet(baseAccount)
}

export async function removeMultisigAccount(
  baseAccount: BaseMultisigWalletAccount,
): Promise<void> {
  await multisigBaseWalletRepo.remove((account) =>
    accountsEqual(account, baseAccount),
  )

  await accountService.remove(baseAccount)
}
