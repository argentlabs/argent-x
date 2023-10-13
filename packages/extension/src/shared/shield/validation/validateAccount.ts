import { num } from "starknet"

import { WalletAccount } from "../../wallet.model"
import { BackendAccount } from "../backend/account"
import {
  ArgentAccountError,
  SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_1,
  SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_2,
  SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_3,
  ShieldValidationErrorMessage,
} from "../../errors/argentAccount"
import { isErrorOfType } from "../../errors/errorData"

export const getShieldValidationErrorFromBackendError = (error: unknown) => {
  if (
    !isErrorOfType<ShieldValidationErrorMessage>(error, "ArgentAccountError")
  ) {
    return null
  }

  return error.data.code
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
  const localAccountsMatchBackendAccounts =
    getLocalAccountsMatchBackendAccounts(localAccounts, backendAccounts)
  if (localAccountsWithGuardian.length === 0) {
    if (backendAccounts.length > 0) {
      if (localAccountsMatchBackendAccounts) {
        return
      }
      /** Scenario 1 */
      throw new ArgentAccountError({
        code: SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_1,
      })
    }
  }

  if (localAccountsWithGuardian.length > 0) {
    /** Scenario 2 */
    if (backendAccounts.length === 0) {
      throw new ArgentAccountError({
        code: SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_2,
      })
    }
    /** Scenario 3 */
    if (backendAccounts.length > 0 && !localAccountsMatchBackendAccounts) {
      throw new ArgentAccountError({
        code: SHIELD_EMAIL_VALIDATION_FAILURE_SCENARIO_3,
      })
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
        num.hexToDecimalString(account.address) ===
        num.hexToDecimalString(backendAccount.address),
    )
    if (existingAccount) {
      return true
    }
  }
  return false
}
