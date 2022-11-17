import type { DeclareContractPayload } from "starknet"

import { ExtQueueItem } from "../shared/actionQueue/types"
import { BackgroundService } from "./background"
import { addTransaction } from "./transactions/store"
import { checkTransactionHash } from "./transactions/transactionExecution"

type DeployAccountAction = ExtQueueItem<{
  type: "DECLARE_CONTRACT_ACTION"
  payload: DeclareContractPayload
}>

export const udpDeclareContract = async (
  { payload }: DeployAccountAction,
  { wallet }: BackgroundService,
) => {
  if (!(await wallet.isSessionOpen())) {
    throw Error("you need an open session")
  }
  const account = await wallet.getSelectedAccount()
  if (!account) {
    throw new Error("No account selected")
  }

  const starknetAccount = await wallet.getStarknetAccount({
    address: account.address,
    networkId: account.networkId,
  })

  if ("declare" in starknetAccount) {
    const { classHash, contract } = payload
    const { transaction_hash: txHash } = await starknetAccount.declare({
      classHash,
      contract,
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
        title: "Contract declared",
        subTitle: classHash,
      },
    })

    return txHash
  }

  throw Error("Account does not support Starknet declare")
}
