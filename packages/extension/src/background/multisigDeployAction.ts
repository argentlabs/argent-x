import { number } from "starknet"

import { ExtQueueItem } from "../shared/actionQueue/types"
import { BaseWalletAccount } from "../shared/wallet.model"
import { BackgroundService } from "./background"
import { addTransaction } from "./transactions/store"
import { checkTransactionHash } from "./transactions/transactionExecution"
import { argentMaxFee } from "./utils/argentMaxFee"

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

  let maxFee: string

  try {
    const { suggestedMaxFee } = await wallet.getAccountDeploymentFee(
      selectedMultisig,
    )

    maxFee = argentMaxFee(suggestedMaxFee)
  } catch (error) {
    const fallbackPrice = number.toBN(10e14)
    maxFee = argentMaxFee(fallbackPrice)
  }

  const { account, txHash } = await wallet.deployAccount(selectedMultisig, {
    maxFee,
  })

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
