import { stark } from "starknet"

import { ActionItem } from "../shared/actionQueue"
import { getNetwork } from "../shared/network"
import { BaseWalletAccount } from "../shared/wallet.model"
import { Queue } from "./actionQueue"
import { Wallet } from "./wallet"

export interface IUpgradeAccount {
  account: BaseWalletAccount
  wallet: Wallet
  actionQueue: Queue<ActionItem>
}

export const upgradeAccount = async ({
  account,
  wallet,
  actionQueue,
}: IUpgradeAccount) => {
  const fullAccount = await wallet.getAccount(account)

  const { accountClassHash: newImplementation } = await getNetwork(
    fullAccount.network.id,
  )

  if (!newImplementation) {
    throw "Cannot upgrade account without a new contract implementation"
  }

  const payload = {
    transactions: {
      contractAddress: fullAccount.address,
      entrypoint: "upgrade",
      calldata: stark.compileCalldata({
        implementation: newImplementation,
      }),
    },
  }

  await actionQueue.push({
    type: "TRANSACTION",
    payload,
  })
}
