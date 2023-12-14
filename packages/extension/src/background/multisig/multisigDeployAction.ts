import { num } from "starknet"

import { ExtensionActionItemOfType } from "../../shared/actionQueue/types"
import { addTransaction } from "../transactions/store"
import { checkTransactionHash } from "../transactions/transactionExecution"
import { argentMaxFee } from "../../shared/utils/argentMaxFee"
import { Wallet } from "../wallet"

export const addMultisigDeployAction = async (
  action: ExtensionActionItemOfType<"DEPLOY_MULTISIG">,
  wallet: Wallet,
) => {
  if (!(await wallet.isSessionOpen())) {
    throw Error("you need an open session")
  }
  const { account: baseAccount } = action.payload
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

    maxFee = argentMaxFee({ suggestedMaxFee: suggestedMaxFee })
  } catch (error) {
    const fallbackPrice = num.toBigInt(10e14)
    maxFee = argentMaxFee({ suggestedMaxFee: fallbackPrice })
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
