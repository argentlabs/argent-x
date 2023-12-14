import { ExtensionActionItemOfType } from "../shared/actionQueue/types"
import { addTransaction } from "./transactions/store"
import { checkTransactionHash } from "./transactions/transactionExecution"
import { Wallet } from "./wallet"

export const accountDeployAction = async (
  action: ExtensionActionItemOfType<"DEPLOY_ACCOUNT">,
  wallet: Wallet,
) => {
  if (!(await wallet.isSessionOpen())) {
    throw Error("you need an open session")
  }
  const { account: baseAccount } = action.payload
  const selectedAccount = await wallet.getAccount(baseAccount)

  const accountNeedsDeploy = selectedAccount?.needsDeploy

  if (!accountNeedsDeploy) {
    throw Error("Account already deployed")
  }

  const { account, txHash } = await wallet.deployAccount(selectedAccount)

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
    },
  })

  return txHash
}
