import type { CairoVersion } from "starknet"
import type {
  ArgentWalletAccount,
  ExternalWalletAccount,
  WalletAccount,
} from "../wallet.model"
import {
  argentAccountTypeSchema,
  externalAccountTypeSchema,
} from "../wallet.model"
import { getArgentAccountClassHashes, isEqualAddress } from "@argent/x-shared"

export function isArgentAccount(
  account: WalletAccount,
): account is ArgentWalletAccount {
  return argentAccountTypeSchema.safeParse(account.type).success
}

export function isExternalAccount(
  account: WalletAccount,
): account is ExternalWalletAccount {
  return externalAccountTypeSchema.safeParse(account.type).success
}

export const walletAccountToArgentAccount = (
  account: WalletAccount,
): ArgentWalletAccount => {
  if (isArgentAccount(account)) {
    return account
  }
  throw new Error("Not an argent account")
}

export const filterArgentAccounts = (accounts: WalletAccount[]) =>
  accounts.filter(isArgentAccount)

export const isArgentAccountClassHash = (
  classHash?: string,
  cairoVersion: CairoVersion = "1",
) => {
  const argentClassHashes = getArgentAccountClassHashes(
    cairoVersion === "0" ? "cairo0" : "cairo1",
  )

  return argentClassHashes.some((hash) => isEqualAddress(hash, classHash))
}

export const isImportedArgentAccount = (account: WalletAccount) => {
  return (
    account.type === "imported" &&
    isArgentAccountClassHash(account.classHash, account.cairoVersion)
  )
}
