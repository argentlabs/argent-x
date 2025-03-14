import { TransactionType } from "starknet"

import {
  estimatedFeeToMaxResourceBounds,
  getTxVersionFromFeeToken,
} from "@argent/x-shared"
import type { ExtensionActionItemOfType } from "../../shared/actionQueue/types"
import { AccountError } from "../../shared/errors/account"
import { SessionError } from "../../shared/errors/session"
import { addTransaction } from "../../shared/transactions/store"
import { checkTransactionHash } from "../../shared/transactions/utils"
import type { Wallet } from "../wallet"
import type { DeployActionExtra } from "../../shared/actionQueue/schema"
import { getEstimatedFees } from "../../shared/transactionSimulation/fees/estimatedFeesRepository"
import { TransactionError } from "../../shared/errors/transaction"

export const addMultisigDeployAction = async (
  action: ExtensionActionItemOfType<"DEPLOY_MULTISIG">,
  wallet: Wallet,
  extra?: DeployActionExtra,
) => {
  if (!(await wallet.isSessionOpen())) {
    throw new SessionError({ code: "NO_OPEN_SESSION" })
  }
  const { account: baseAccount } = action.payload
  const selectedMultisig = await wallet.getMultisigAccount(baseAccount.id)

  const multisigNeedsDeploy = selectedMultisig.needsDeploy

  if (!multisigNeedsDeploy) {
    throw new AccountError({ code: "ACCOUNT_ALREADY_DEPLOYED" })
  }

  if (!extra) {
    throw Error("Missing fee token address data")
  }

  const { feeTokenAddress } = extra
  const version = getTxVersionFromFeeToken(feeTokenAddress)

  const accountDeployPayload =
    await wallet.getMultisigDeploymentPayload(selectedMultisig)

  const preComputedFees = await getEstimatedFees({
    type: TransactionType.DEPLOY_ACCOUNT,
    payload: accountDeployPayload,
  })

  if (!preComputedFees) {
    throw new TransactionError({ code: "NO_PRE_COMPUTED_FEES" })
  }

  if (preComputedFees.type === "paymaster") {
    throw new TransactionError({ code: "PAYMASTER_FEES_NOT_SUPPORTED" })
  }

  const deployDetails = {
    version,
    ...estimatedFeeToMaxResourceBounds(preComputedFees.transactions),
  }

  const { account, txHash } = await wallet.deployAccount(
    selectedMultisig,
    deployDetails,
  )

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
