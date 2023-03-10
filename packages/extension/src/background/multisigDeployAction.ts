import { ExtQueueItem } from "../shared/actionQueue/types"
import { BaseWalletAccount } from "../shared/wallet.model"
import { BackgroundService } from "./background"
import { addTransaction } from "./transactions/store"
import { checkTransactionHash } from "./transactions/transactionExecution"

type DeployMultisigAction = ExtQueueItem<{
  type: "DEPLOY_MULTISIG_ACTION"
  payload: BaseWalletAccount
}>

export const multisigDeployAction = async (
  { payload: baseAccount }: DeployMultisigAction,
  { wallet }: BackgroundService,
) => {
  if (!(await wallet.isSessionOpen())) {
    throw Error("you need an open session")
  }
  const selectedMultisig = await wallet.getMultisigAccount(baseAccount)

  const multisigNeedsDeploy = selectedMultisig.needsDeploy

  if (!multisigNeedsDeploy) {
    throw Error("Account already deployed")
  }

  const { account, txHash } = await wallet.deployAccount(selectedMultisig)

  if (!checkTransactionHash(txHash)) {
    throw Error(
      "Deploy Multisig Transaction could not be added to the sequencer",
    )
  }

  await addTransaction({
    hash: txHash,
    account,
    meta: {
      title: "Activate Multisig",
      isDeployAccount: true,
      type: "DEPLOY_ACCOUNT",
    },
  })

  return txHash
}
