import { num } from "starknet"

import {
  estimatedFeeToMaxFeeTotal,
  getTxVersionFromFeeToken,
} from "@argent/x-shared"
import { ExtensionActionItemOfType } from "../../shared/actionQueue/types"
import { AccountError } from "../../shared/errors/account"
import { SessionError } from "../../shared/errors/session"
import { addTransaction } from "../../shared/transactions/store"
import { checkTransactionHash } from "../../shared/transactions/utils"
import { Wallet } from "../wallet"
import { DeployActionExtra } from "../../shared/actionQueue/schema"

export const addMultisigDeployAction = async (
  action: ExtensionActionItemOfType<"DEPLOY_MULTISIG">,
  wallet: Wallet,
  extra?: DeployActionExtra,
) => {
  if (!(await wallet.isSessionOpen())) {
    throw new SessionError({ code: "NO_OPEN_SESSION" })
  }
  const { account: baseAccount } = action.payload
  const selectedMultisig = await wallet.getMultisigAccount(baseAccount)

  const multisigNeedsDeploy = selectedMultisig.needsDeploy

  if (!multisigNeedsDeploy) {
    throw new AccountError({ code: "ACCOUNT_ALREADY_DEPLOYED" })
  }

  if (!extra) {
    throw Error("Missing fee token address data")
  }

  const { feeTokenAddress } = extra
  const version = getTxVersionFromFeeToken(feeTokenAddress)

  // TODO: refactor to use the fee estimation repo
  const maxFee = await wallet
    .getAccountDeploymentFee(selectedMultisig, feeTokenAddress)
    .then(estimatedFeeToMaxFeeTotal)
    .catch(() => num.toBigInt(20e14))

  const { account, txHash } = await wallet.deployAccount(selectedMultisig, {
    maxFee,
    version,
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
