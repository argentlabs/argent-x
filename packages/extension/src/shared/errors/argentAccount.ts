import { BaseError, BaseErrorPayload } from "./baseError"

/**
 * localAccounts <-- all local accounts
 * localAccountsWithGuardian <-- all local accounts with 2FA
 * backendAccounts <-- all backend accounts for supplied email
 */

/**
 * Scenario 1: When there is no 2FA locally, and accounts do not match
 *
 * Technical context: Here we retrieve the accounts associated with the email,
 * and see that there are accounts, and we know locally that there are no accounts with 2FA
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
 * and see that there are accounts, but they don’t match the ones for this seed phrase
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

export class ArgentAccountError extends BaseError<ShieldValidationErrorMessage> {
  constructor(payload: BaseErrorPayload<ShieldValidationErrorMessage>) {
    super(payload)
    this.name = "ArgentAccountError"
  }
}
