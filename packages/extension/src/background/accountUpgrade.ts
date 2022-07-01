import { stark } from "starknet/src"

import { ActionItem } from "../shared/actionQueue"
import { BaseWalletAccount } from "../shared/wallet.model"
import { Queue } from "./actionQueue"
import { getNetwork } from "./customNetworks"
import { Wallet } from "./wallet"

export interface IUpgradeAccount {
  account: BaseWalletAccount
  wallet: Wallet
  actionQueue: Queue<ActionItem>
}

/* TODO: remove
contract class hashes
0x3e327de1c40540b98d05cbcb13552008e36f0ec8d61d46956d2f9752c294328
0x2dd6540d2f692de21cea9e842672f6fdf70063dd801ccd8d354ede601156d58
*/

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
