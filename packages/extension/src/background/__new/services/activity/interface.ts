import type { Token } from "@argent/shared"
import type Emittery from "emittery"

import type { ContractAddress } from "../../../../shared/storage/__new/repositories/nft"
import type { BaseWalletAccount } from "../../../../shared/wallet.model"
import type { Activity } from "./schema"

/** raw */
export const Activities = Symbol("Activities")

/** finance */
export const TokenActivity = Symbol("TokenActivity")
export const NftActivity = Symbol("NftActivity")

/** security */
export const TriggerEscapeGuardianActivity = Symbol(
  "TriggerEscapeGuardianActivity",
)
export const TriggerEscapeSignerActivity = Symbol("TriggerEscapeSignerActivity")
export const EscapeGuardianActivity = Symbol("EscapeGuardianActivity")
export const EscapeSignerActivity = Symbol("EscapeSignerActivity")
export const GuardianChangedActivity = Symbol("GuardianChangedActivity")
export const GuardianBackupChangedActivity = Symbol(
  "GuardianBackupChangedActivity",
)
export const SignerChangedActivity = Symbol("SignerChangedActivity")
export const CancelEscapeActivity = Symbol("CancelEscapeActivity")
export const AccountUpgradedActivity = Symbol("AccountUpgradedActivity")
export const MultisigConfigurationUpdatedActivity = Symbol(
  "MultisigConfigurationUpdatedActivity",
)

export type ActivitiesPayload = {
  account: BaseWalletAccount
  activities: Activity[]
}

export type TokenActivityPayload = {
  accounts: BaseWalletAccount[]
  tokens: Token[]
}

export type NftActivityPayload = {
  accounts: BaseWalletAccount[]
  nfts: ContractAddress[]
}

export type SecurityActivityPayload = BaseWalletAccount[]

/**
 * Fired when new activities are discovered on an individual account
 */

export type Events = {
  [Activities]: ActivitiesPayload
  [TokenActivity]: TokenActivityPayload
  [NftActivity]: NftActivityPayload
  [TriggerEscapeGuardianActivity]: SecurityActivityPayload
  [TriggerEscapeSignerActivity]: SecurityActivityPayload
  [EscapeGuardianActivity]: SecurityActivityPayload
  [EscapeSignerActivity]: SecurityActivityPayload
  [GuardianChangedActivity]: SecurityActivityPayload
  [GuardianBackupChangedActivity]: SecurityActivityPayload
  [SignerChangedActivity]: SecurityActivityPayload
  [CancelEscapeActivity]: SecurityActivityPayload
  [AccountUpgradedActivity]: SecurityActivityPayload
  [MultisigConfigurationUpdatedActivity]: SecurityActivityPayload
}

export interface IActivityService {
  readonly emitter: Emittery<Events>
  fetchAccountActivities(
    account?: BaseWalletAccount,
    updateModifiedAfter?: boolean,
  ): Promise<Activity[] | undefined>
  updateSelectedAccountActivities(): Promise<void>
  fetchSelectedAccountActivities(): Promise<ActivitiesPayload | undefined>
}
