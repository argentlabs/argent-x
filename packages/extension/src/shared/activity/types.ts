import { Activity } from "./schema"
import { BaseWalletAccount } from "../wallet.model"

export interface IActivityStorage {
  modifiedAfter: Record<string, number>
}
export type ActivitiesPayload = {
  account: BaseWalletAccount
  activities: Activity[]
}

export type ProvisionActivityPayload = {
  account: BaseWalletAccount
  activity: Activity
}
