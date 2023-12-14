import { IActivity } from "../../../../shared/activity/types"
import { BaseWalletAccount } from "../../../../shared/wallet.model"
import { Activity } from "./model"

export interface IActivityService {
  fetchActivities({
    address,
    networkId,
  }: BaseWalletAccount): Promise<Activity[]>
  shouldUpdateBalance({ address, networkId }: BaseWalletAccount): Promise<{
    shouldUpdate: boolean
    lastModified?: number
    id?: string
  }>
  addActivityToStore({
    address,
    lastModified,
    id,
  }: IActivity & {
    address: string
  }): Promise<void>
}
