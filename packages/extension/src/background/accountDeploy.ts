import { BlockNumber, CallData, num } from "starknet"
import type { BaseWalletAccount, WalletAccount } from "../shared/wallet.model"
import type { Wallet } from "./wallet"
import type { IBackgroundActionService } from "./__new/services/action/interface"

export interface IDeployAccount {
  account: BaseWalletAccount
  actionService: IBackgroundActionService
  wallet: Wallet
}

/** TODO: this should be in a service with dependency injection and tests */

export const addDeployAccountAction = async ({
  account,
  actionService,
  wallet,
}: IDeployAccount) => {
  const walletAccount = await wallet.getAccount(account)
  if (!walletAccount) {
    throw new Error("Account not found")
  }

  /** determine the calldata to display to the end user */
  let displayCalldata: string[] = []

  try {
    const deployAccountPayload =
      await wallet.getAccountOrMultisigDeploymentPayload(walletAccount)
    const { constructorCalldata } = deployAccountPayload
    displayCalldata = CallData.toCalldata(constructorCalldata)
  } catch {
    /** ignore non-critical error */
  }

  await actionService.add(
    {
      type: "DEPLOY_ACCOUNT",
      payload: {
        account,
        displayCalldata,
      },
    },
    {
      title: "Activate account",
      icon: "DeployIcon",
    },
  )
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
    console.warn(e)
    return false
  }
}
