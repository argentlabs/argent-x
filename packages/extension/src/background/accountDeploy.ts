import { ActionItem } from "../shared/actionQueue/types"
import { BaseWalletAccount, WalletAccount } from "../shared/wallet.model"
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

export const deployMultisigAction = async ({
  actionQueue,
  account,
}: IDeployAccount) => {
  await actionQueue.push({
    type: "DEPLOY_MULTISIG_ACTION",
    payload: account,
  })
}

export const isAccountDeployed = async (
  account: WalletAccount,
  getClassAt: (address: string, blockIdentifier?: unknown) => Promise<unknown>,
) => {
  if (!account.needsDeploy) {
    return true
  }
  try {
    await getClassAt(account.address)
    return true
  } catch (e) {
    return false
  }
}
