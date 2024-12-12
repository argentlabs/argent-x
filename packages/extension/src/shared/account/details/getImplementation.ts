import type { Call } from "starknet"
import { num } from "starknet"
import { accountsEqual } from "../../utils/accountsEqual"

import { TXV1_ACCOUNT_CLASS_HASH } from "@argent/x-shared"
import { getMulticallForNetwork } from "../../multicall"
import { getProvider } from "../../network"
import { networkService } from "../../network/service"
import type { BaseWalletAccount } from "../../wallet.model"
import type { IAccountService } from "../service/accountService/IAccountService"

/**
 * Get implementation class hash of account
 */

export const getImplementationForAccount = async (
  account: BaseWalletAccount,
  accountService: IAccountService,
): Promise<string> => {
  const network = await networkService.getById(account.networkId)
  try {
    // Implementation Class Hash for Cairo 0 accounts
    const call: Call = {
      contractAddress: account.address,
      entrypoint: "get_implementation",
    }
    const multicall = getMulticallForNetwork(network)
    const response = await multicall.callContract(call)
    return response[0]
  } catch {
    try {
      // If it fails, get implementation Class Hash for Cairo 1 accounts
      const provider = getProvider(network)

      const classHash = await provider.getClassHashAt(account.address)
      return classHash
    } catch {
      const [walletAccount] = await accountService.get((acc) =>
        accountsEqual(acc as any, account),
      )

      return (
        walletAccount.network.accountClassHash?.[walletAccount.type] ??
        TXV1_ACCOUNT_CLASS_HASH
      )
    }
  }
}

/**
 * Returns true if implementation class hash of account is included in the account network `accountClassHash`
 */

export const getIsCurrentImplementation = async (
  account: BaseWalletAccount,
  accountService: IAccountService,
) => {
  const network = await networkService.getById(account.networkId)
  const currentImplementations = Object.values(network.accountClassHash || {})
  const accountImplementation = await getImplementationForAccount(
    account,
    accountService,
  )

  const isCurrentImplementation = currentImplementations.some(
    (currentImplementation) =>
      num.toBigInt(currentImplementation) ===
      num.toBigInt(accountImplementation),
  )
  return isCurrentImplementation
}
