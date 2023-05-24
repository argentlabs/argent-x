import { stark } from "starknet"

import { ActionItem } from "../shared/actionQueue/types"
import { getNetwork } from "../shared/network"
import { ArgentAccountType, BaseWalletAccount } from "../shared/wallet.model"
import { Queue } from "./actionQueue"
import { Wallet } from "./wallet"

export interface IUpgradeAccount {
  account: BaseWalletAccount
  wallet: Wallet
  actionQueue: Queue<ActionItem>
  targetImplementationType?: ArgentAccountType
}

export const upgradeAccount = async ({
  account,
  wallet,
  actionQueue,
  targetImplementationType,
}: IUpgradeAccount) => {
  const fullAccount = await wallet.getAccount(account)
  const starknetAccount = await wallet.getStarknetAccount(account)

  const accountType = targetImplementationType ?? fullAccount.type

  const { accountClassHash: newImplementation } = await getNetwork(
    fullAccount.network.id,
  )

  if (!newImplementation || !newImplementation.standard) {
    throw "Cannot upgrade account without a new contract implementation"
  }

  const implementationClassHash =
    newImplementation[accountType] ?? newImplementation.standard

  const calldata = stark.compileCalldata({
    implementation: implementationClassHash,
  })

  if ("estimateAccountDeployFee" in starknetAccount) {
    // new starknet accounts have a new upgrade interface to allow for transactions right after upgrade
    calldata.push("0")
  }

  await actionQueue.push({
    type: "TRANSACTION",
    payload: {
      transactions: {
        contractAddress: fullAccount.address,
        entrypoint: "upgrade",
        calldata,
      },
      meta: { isUpgrade: true, title: "Switch account type" },
    },
  })
}
