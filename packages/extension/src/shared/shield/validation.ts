import { number } from "starknet"

import { WalletAccount } from "../wallet.model"
import { BackendAccount } from "./backend/account"

/**
 * localAccounts <-- all local accounts
 * localAccountsWithGuardian <-- all local accounts with 2FA
 * backendAccounts <-- all backend accounts for supplied email
 */

/**
 * Scenario 1: When there is no 2FA locally, and accounts do not match
 *
 * Technical context: Here we retrieve the accounts associated with the email,
 * and see that there are accounts, and we know locally that there are no acccounts with 2FA
 *
 * backendAccounts.length > 0 && localAccountsWithGuardian.length === 0
 */

export const SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_1 =
  "SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_1"

/**
 * Scenario 2: When there is 2FA locally, and there are no backend accounts (email never used)
 *
 * Show this error if the email used is different to the one that is already
 * being used for 2FA. ‘Try again’ should redirect user back to enter email screen
 *
 * backendAccounts.length === 0 && localAccountsWithGuardian.length > 0
 */

export const SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_2 =
  "SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_2"

/**
 * Scenario 3: When there is 2FA locally, and accounts do not match
 *
 * Technical context: Here we retrieve the accounts associated with the email,
 * and see that there are accounts, but they don’t match the ones for this seedphrase
 *
 * *** like Scenario 2 but has localAccountsWithGuardian.length > 0
 *
 * localAccountsWithGuardian.length > 0
 * &&
 * backendAccounts.length > 0 && localAccounts does not match backendAccounts
 * OR
 * backendAccounts.length === 0
 */

export const SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_3 =
  "SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_3"

export type ShieldValidationErrorMessage =
  | typeof SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_1
  | typeof SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_2
  | typeof SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_3

/** retreive shield error passed from background process via messages */

export const getShieldValidationErrorFromBackendError = (error: unknown) => {
  const message = (error as Error)?.message?.toString()
  const errorMessage = message.match(/Error: (.+)/)?.[1]
  if (
    errorMessage &&
    [
      SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_1,
      SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_2,
      SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_3,
    ].includes(errorMessage)
  ) {
    return errorMessage as ShieldValidationErrorMessage
  }
}

interface ValidateEmailForAccountsProps {
  localAccounts: WalletAccount[]
  localAccountsWithGuardian: WalletAccount[]
  backendAccounts: BackendAccount[]
}

export const validateEmailForAccounts = ({
  localAccounts,
  localAccountsWithGuardian,
  backendAccounts,
}: ValidateEmailForAccountsProps) => {
  /** Scenario 1 */
  if (localAccountsWithGuardian.length === 0) {
    if (backendAccounts.length > 0) {
      throw new Error(SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_1)
    }
  }

  if (localAccountsWithGuardian.length > 0) {
    /** Scenario 2 */
    if (backendAccounts.length === 0) {
      throw new Error(SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_2)
    }
    /** Scenario 3 */
    const localAccountsMatchBackendAccounts =
      getLocalAccountsMatchBackendAccounts(localAccounts, backendAccounts)
    if (backendAccounts.length > 0 && !localAccountsMatchBackendAccounts) {
      throw new Error(SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_3)
    }
  }
}

export const getLocalAccountsMatchBackendAccounts = (
  localAccounts: WalletAccount[],
  backendAccounts: BackendAccount[],
) => {
  if (backendAccounts.length === 0) {
    return true
  }
  for (const backendAccount of backendAccounts) {
    const existingAccount = localAccounts.find(
      (account) =>
        number.hexToDecimalString(account.address) ===
        number.hexToDecimalString(backendAccount.address),
    )
    if (existingAccount) {
      return true
    }
  }
  return false
}
