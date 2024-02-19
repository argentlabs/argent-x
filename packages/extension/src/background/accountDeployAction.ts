import { ExtensionActionItemOfType } from "../shared/actionQueue/types"
import { IFeeTokenService } from "../shared/feeToken/service/interface"
import { addTransaction } from "../shared/transactions/store"
import { checkTransactionHash } from "../shared/transactions/utils"
import { getTxVersionFromFeeToken } from "../shared/utils/getTransactionVersion"
import { Wallet } from "./wallet"

export const accountDeployAction = async (
  action: ExtensionActionItemOfType<"DEPLOY_ACCOUNT">,
  wallet: Wallet,
  feeTokenService: IFeeTokenService,
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

  const bestFeeToken = await feeTokenService.getBestFeeToken(selectedAccount)
  const version = getTxVersionFromFeeToken(bestFeeToken.address)

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
    },
  })

  return txHash
}
