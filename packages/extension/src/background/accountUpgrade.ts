import { CallData } from "starknet"

import { networkService } from "../shared/network/service"
import { ArgentAccountType, BaseWalletAccount } from "../shared/wallet.model"
import { IBackgroundActionService } from "./__new/services/action/interface"
import { Wallet } from "./wallet"
import { isAccountV5 } from "../shared/utils/accountv4"
import { AccountError } from "../shared/errors/account"

export interface IUpgradeAccount {
  account: BaseWalletAccount
  wallet: Wallet
  actionService: IBackgroundActionService
  targetImplementationType?: ArgentAccountType
}

export const upgradeAccount = async ({
  account,
  wallet,
  actionService,
  targetImplementationType,
}: IUpgradeAccount) => {
  const fullAccount = await wallet.getAccount(account)
  if (!fullAccount) {
    throw new AccountError({ code: "NOT_FOUND" })
  }
  const starknetAccount = await wallet.getStarknetAccount(account)

  const accountType = targetImplementationType ?? fullAccount.type

  const { accountClassHash: newImplementation } = await networkService.getById(
    fullAccount.network.id,
  )

  if (!newImplementation || !newImplementation.standard) {
    throw "Cannot upgrade account without a new contract implementation"
  }

  const accountTypeWithCairo0Check =
    accountType === "standardCairo0" ? "standard" : accountType
  const implementationClassHash =
    newImplementation[accountTypeWithCairo0Check] ?? newImplementation.standard

  if (!isAccountV5(starknetAccount)) {
    throw new AccountError({ code: "UPGRADE_NOT_SUPPORTED" })
  }

  const upgradeCalldata = {
    implementation: implementationClassHash,
    // new starknet accounts have a new upgrade interface to allow for transactions right after upgrade
    calldata: [0],
  }

  const calldata = CallData.compile(upgradeCalldata)
  await actionService.add({
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
