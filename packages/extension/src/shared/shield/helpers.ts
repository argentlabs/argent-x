import { number } from "starknet"

import { WalletAccount } from "../wallet.model"
import { BackendAccount } from "./backend/account"
import {
  ARGENT_SHIELD_ERROR_EMAIL_IN_USE,
  ARGENT_SHIELD_ERROR_WRONG_EMAIL,
} from "./constants"

/**
 * Validate that this email was used for existing local and backend accounts
 * - check if existing accounts in backend match local accounts
 * - if not then must use different email
 */

export const checkForEmailInUse = (
  backendAccounts: BackendAccount[],
  accountsOnNetwork: WalletAccount[],
) => {
  if (!backendAccounts.length) {
    return
  }
  for (const backendAccount of backendAccounts) {
    const existingAccount = accountsOnNetwork.find(
      (account) =>
        number.hexToDecimalString(account.address) ===
        number.hexToDecimalString(backendAccount.address),
    )
    if (existingAccount) {
      return
    }
  }
  throw new Error(ARGENT_SHIELD_ERROR_EMAIL_IN_USE)
}

/**
 * Validate that this email was used for existing local 2FA accounts
 * - no backend accounts for this email
 * - we already have > 0 accounts with guardian assigned
 * - therefore must have used a different email for those
 */

export const checkForWrongEmail = (
  backendAccounts: BackendAccount[],
  accountsWithGuardian: WalletAccount[],
) => {
  if (!backendAccounts.length) {
    if (accountsWithGuardian.length) {
      throw new Error(ARGENT_SHIELD_ERROR_WRONG_EMAIL)
    }
  }
}
