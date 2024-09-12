import type { Activity } from "@argent/x-shared/simulation"
import type { BaseWalletAccount } from "../wallet.model"

export interface IActivityStorage {
  modifiedAfter: Record<string, number>
}

export type ActivitiesPayload = {
  account: BaseWalletAccount
  activities: Activity[]
}
