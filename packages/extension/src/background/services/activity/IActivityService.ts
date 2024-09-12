import type { Token } from "@argent/x-shared"
import type Emittery from "emittery"

import type { Activity } from "@argent/x-shared/simulation"
import type { ActivitiesPayload } from "../../../shared/activity/types"
import type { ContractAddress } from "../../../shared/nft/store"
import { BaseToken } from "../../../shared/token/__new/types/token.model"
import type { BaseWalletAccount } from "../../../shared/wallet.model"

/** raw */
export const Activities = Symbol("Activities")

/** finance */
export const TokenActivity = Symbol("TokenActivity")
export const NftActivity = Symbol("NftActivity")
export const NewTokenActivity = Symbol("NewTokenActivity")

/** account */
export const AccountDeployActivity = Symbol("AccountDeployActivity")
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

export type TokenActivityPayload = {
  accounts: BaseWalletAccount[]
  tokens: Token[]
}

export type NewTokenActivityPayload = {
  tokens: BaseToken[]
}

export type NftActivityPayload = {
  accounts: BaseWalletAccount[]
  nfts: ContractAddress[]
}

export type AccountActivityPayload = BaseWalletAccount[]

/**
 * Fired when new activities are discovered on an individual account
 */

export type Events = {
  [Activities]: ActivitiesPayload
  [TokenActivity]: TokenActivityPayload
  [NftActivity]: NftActivityPayload
  [NewTokenActivity]: NewTokenActivityPayload
  [AccountDeployActivity]: AccountActivityPayload
  [TriggerEscapeGuardianActivity]: AccountActivityPayload
  [TriggerEscapeSignerActivity]: AccountActivityPayload
  [EscapeGuardianActivity]: AccountActivityPayload
  [EscapeSignerActivity]: AccountActivityPayload
  [GuardianChangedActivity]: AccountActivityPayload
  [GuardianBackupChangedActivity]: AccountActivityPayload
  [SignerChangedActivity]: AccountActivityPayload
  [CancelEscapeActivity]: AccountActivityPayload
  [AccountUpgradedActivity]: AccountActivityPayload
  [MultisigConfigurationUpdatedActivity]: AccountActivityPayload
}

export interface IActivityService {
  readonly emitter: Emittery<Events>
  fetchAccountActivities(
    account?: BaseWalletAccount,
    updateModifiedAfter?: boolean,
  ): Promise<Activity[] | undefined>
  updateSelectedAccountActivities(): Promise<Activity[] | undefined>
  updateAccountActivities(
    account: BaseWalletAccount,
  ): Promise<Activity[] | undefined>
  // fetchSelectedAccountActivities(): Promise<ActivitiesPayload | undefined>
}
