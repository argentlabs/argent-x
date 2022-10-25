import { ActionItem } from "../shared/actionQueue/types"
import { BaseWalletAccount } from "../shared/wallet.model"
import { Queue } from "./actionQueue"

export interface IDeployAccount {
  account: BaseWalletAccount
  actionQueue: Queue<ActionItem>
}

export const deployAccountAction = async ({
  actionQueue,
  account,
}: IDeployAccount) => {
  await actionQueue.push({
    type: "DEPLOY_ACCOUNT_ACTION",
    payload: account,
  })
}
