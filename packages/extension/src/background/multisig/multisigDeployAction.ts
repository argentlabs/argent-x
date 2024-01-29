import { num } from "starknet"

import { ExtensionActionItemOfType } from "../../shared/actionQueue/types"
import { addTransaction } from "../../shared/transactions/store"
import { Wallet } from "../wallet"
import { estimatedFeeToMaxFeeTotal } from "../../shared/transactionSimulation/utils"
import { checkTransactionHash } from "../../shared/transactions/utils"

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

  const maxFee = await wallet
    .getAccountDeploymentFee(selectedMultisig)
    .then(estimatedFeeToMaxFeeTotal)
    .catch(() => num.toBigInt(20e14))

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
