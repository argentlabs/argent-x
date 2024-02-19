import { num } from "starknet"

import { ExtensionActionItemOfType } from "../../shared/actionQueue/types"
import { addTransaction } from "../../shared/transactions/store"
import { Wallet } from "../wallet"
import { estimatedFeeToMaxFeeTotal } from "../../shared/transactionSimulation/utils"
import { checkTransactionHash } from "../../shared/transactions/utils"
import { ETH_TOKEN_ADDRESS } from "../../shared/network/constants"
import { TransactionInvokeVersion } from "../../shared/utils/transactionVersion"
import { AccountError } from "../../shared/errors/account"
import { SessionError } from "../../shared/errors/session"

export const addMultisigDeployAction = async (
  action: ExtensionActionItemOfType<"DEPLOY_MULTISIG">,
  wallet: Wallet,
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

  // TODO: TXV3 - allow for deploying multisig with STRK fee token
  const version: TransactionInvokeVersion = "0x1"
  const feeTokenAddress = ETH_TOKEN_ADDRESS

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
