import { Abi, Contract } from "starknet"

import MULTICALL_ABI from "../../abis/Mulitcall.json"
import { Account } from "../features/accounts/Account"

export const getMulticallContract = (account: Account): Contract | null => {
  const multicallAddress = account.network.multicallAddress

  if (!multicallAddress) {
    return null
  }

  return new Contract(MULTICALL_ABI as Abi, multicallAddress, account.provider)
}
