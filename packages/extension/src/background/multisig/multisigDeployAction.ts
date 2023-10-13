import { num } from "starknet"

import { ExtQueueItem } from "../../shared/actionQueue/types"
import { BaseWalletAccount } from "../../shared/wallet.model"
import { addTransaction } from "../transactions/store"
import { checkTransactionHash } from "../transactions/transactionExecution"
import { argentMaxFee } from "../utils/argentMaxFee"
import { Wallet } from "../wallet"

type DeployMultisigAction = ExtQueueItem<{
  type: "DEPLOY_MULTISIG_ACTION"
  payload: BaseWalletAccount
}>

export const multisigDeployAction = async (
  { payload: baseAccount }: DeployMultisigAction,
  wallet: Wallet,
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
    const fallbackPrice = num.toBigInt(10e14)
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
