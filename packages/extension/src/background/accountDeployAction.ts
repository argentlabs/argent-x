import { ExtQueueItem } from "../shared/actionQueue/types"
import { BaseWalletAccount } from "../shared/wallet.model"
import { BackgroundService } from "./background"
import { addTransaction } from "./transactions/store"
import { checkTransactionHash } from "./transactions/transactionExecution"

type DeployAccountAction = ExtQueueItem<{
  type: "DEPLOY_ACCOUNT_ACTION"
  payload: BaseWalletAccount
}>

export const accountDeployAction = async (
  { payload: baseAccount }: DeployAccountAction,
  { wallet }: BackgroundService,
) => {
  if (!(await wallet.isSessionOpen())) {
    throw Error("you need an open session")
  }
  const selectedAccount = await wallet.getAccount(baseAccount)

  const accountNeedsDeploy = selectedAccount.needsDeploy

  if (!accountNeedsDeploy) {
    throw Error("Account already deployed")
  }

  const { account, txHash } = await wallet.deployAccount(selectedAccount)

  if (!checkTransactionHash(txHash)) {
    throw Error(
      "Deploy Account Transaction could not be added to the sequencer",
    )
  }

  await addTransaction({
    hash: txHash,
    account,
    meta: {
      title: "Activate Account",
      isDeployAccount: true,
      type: "DEPLOY_ACCOUNT",
    },
  })

  return txHash
}
