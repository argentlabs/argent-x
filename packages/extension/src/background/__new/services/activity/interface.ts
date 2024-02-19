import type { Token } from "@argent/shared"
import type Emittery from "emittery"

import type { ContractAddress } from "../../../../shared/storage/__new/repositories/nft"
import type { BaseWalletAccount } from "../../../../shared/wallet.model"
import type { Activity } from "../../../../shared/activity/schema"
import {
  ActivitiesPayload,
  ProvisionActivityPayload,
} from "../../../../shared/activity/types"

/** raw */
export const Activities = Symbol("Activities")

/** finance */
export const TokenActivity = Symbol("TokenActivity")
export const NftActivity = Symbol("NftActivity")

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

/** Provision */
export const ProvisionActivity = Symbol("ProvisionActivity")

export type TokenActivityPayload = {
  accounts: BaseWalletAccount[]
  tokens: Token[]
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
  [ProvisionActivity]: ProvisionActivityPayload
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
