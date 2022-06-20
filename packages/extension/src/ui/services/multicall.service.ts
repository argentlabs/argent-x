import { Abi, Contract } from "starknet"

import MULTICALL_ABI from "../../abis/Mulitcall.json"
import { Network } from "../../shared/networks"
import { Account } from "../features/accounts/Account"

export const getMulticallContract = (
  account: Account,
  network: Network,
): Contract | null => {
  const multicallAddress = network.multicallAddress

  if (!multicallAddress) {
    return null
  }

  return new Contract(MULTICALL_ABI as Abi, multicallAddress, account.provider)
}
