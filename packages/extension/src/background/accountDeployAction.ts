import {
  estimatedFeeToMaxResourceBounds,
  getAccountTxVersion,
} from "@argent/x-shared"
import type { ExtensionActionItemOfType } from "../shared/actionQueue/types"
import { addTransaction } from "../shared/transactions/store"
import { checkTransactionHash } from "../shared/transactions/utils"
import type { Wallet } from "./wallet"
import { sanitizeAccountType } from "../shared/utils/sanitizeAccountType"
import type { DeployActionExtra } from "../shared/actionQueue/schema"
import { getEstimatedFees } from "../shared/transactionSimulation/fees/estimatedFeesRepository"
import { TransactionType } from "starknet"
import { TransactionError } from "../shared/errors/transaction"
import type { EstimatedFeesV2 } from "@argent/x-shared/simulation"
import { estimatedFeeSchema } from "@argent/x-shared/simulation"
import type { WalletAccount } from "../shared/wallet.model"

export const accountDeployAction = async (
  action: ExtensionActionItemOfType<"DEPLOY_ACCOUNT">,
  wallet: Wallet,
  _?: DeployActionExtra,
) => {
  if (!(await wallet.isSessionOpen())) {
    throw Error("you need an open session")
  }
  const { account: baseAccount } = action.payload

  const selectedAccount = await wallet.getArgentAccount(baseAccount.id)

  const accountNeedsDeploy = selectedAccount?.needsDeploy

  if (!accountNeedsDeploy) {
    throw Error("Account already deployed")
  }

  const accountDeployPayload =
    await wallet.getAccountDeploymentPayload(selectedAccount)

  const preComputedFees = await getEstimatedFees({
    type: TransactionType.DEPLOY_ACCOUNT,
    payload: accountDeployPayload,
  })

  if (!preComputedFees) {
    throw new TransactionError({ code: "NO_PRE_COMPUTED_FEES" })
  }

  const deployDetails = buildDeployDetails(selectedAccount, preComputedFees)

  const { account, txHash } = await wallet.deployAccount(
    selectedAccount,
    deployDetails,
  )

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
      ampliProperties: {
        "is deployment": true,
        "transaction type": "deploy contract",
        "account index": account.index,
        "account type": sanitizeAccountType(account.type),
        "wallet platform": "browser extension",
      },
    },
  })

  return txHash
}

export const buildDeployDetails = (
  account: WalletAccount,
  preComputedFees: EstimatedFeesV2,
) => {
  const version = getAccountTxVersion(account)
  const parsedFees = estimatedFeeSchema.safeParse(preComputedFees.transactions)

  if (!parsedFees.success) {
    throw new TransactionError({ code: "PAYMASTER_FEES_NOT_SUPPORTED" })
  }

  return {
    version,
    ...estimatedFeeToMaxResourceBounds(parsedFees.data),
  }
}
