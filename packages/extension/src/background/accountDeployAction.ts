import { getTxVersionFromFeeToken } from "@argent/x-shared"
import { ExtensionActionItemOfType } from "../shared/actionQueue/types"
import { addTransaction } from "../shared/transactions/store"
import { checkTransactionHash } from "../shared/transactions/utils"
import { Wallet } from "./wallet"
import { sanitizeAccountType } from "../shared/utils/sanitizeAccountType"
import { DeployActionExtra } from "../shared/actionQueue/schema"

export const accountDeployAction = async (
  action: ExtensionActionItemOfType<"DEPLOY_ACCOUNT">,
  wallet: Wallet,
  extra?: DeployActionExtra,
) => {
  if (!(await wallet.isSessionOpen())) {
    throw Error("you need an open session")
  }
  const { account: baseAccount } = action.payload

  if (!extra) {
    throw Error("Missing fee token address data")
  }

  const { feeTokenAddress } = extra
  const selectedAccount = await wallet.getAccount(baseAccount)

  const accountNeedsDeploy = selectedAccount?.needsDeploy

  if (!accountNeedsDeploy) {
    throw Error("Account already deployed")
  }

  const version = getTxVersionFromFeeToken(feeTokenAddress)

  const { account, txHash } = await wallet.deployAccount(selectedAccount, {
    version,
  })

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
