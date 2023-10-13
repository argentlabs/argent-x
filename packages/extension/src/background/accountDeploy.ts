import { BlockNumber, num } from "starknet"
import { BaseWalletAccount, WalletAccount } from "../shared/wallet.model"
import { IBackgroundActionService } from "./__new/services/action/interface"

export interface IDeployAccount {
  account: BaseWalletAccount
  actionService: IBackgroundActionService
}

export const deployAccountAction = async ({
  account,
  actionService,
}: IDeployAccount) => {
  await actionService.add({
    type: "DEPLOY_ACCOUNT_ACTION",
    payload: account,
  })
}

export const isAccountDeployed = async (
  account: WalletAccount,
  getClassAt: (
    address: string,
    blockIdentifier?: BlockNumber | num.BigNumberish, // from starknet.js due to missing export
  ) => Promise<unknown>,
) => {
  if (!account.needsDeploy) {
    return true
  }
  try {
    await getClassAt(account.address)
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
