import { Abi, Contract } from "starknet"

import MULTICALL_ABI from "../../abis/Mulitcall.json"
import { useSelectedAccount } from "./../features/accounts/accounts.state"
import { useCurrentNetwork } from "../features/networks/useNetworks"

const MULTICALL_ADDRESS: Record<string, string> = {
  SN_MAIN: "0x0740a7a14618bb7e4688d10059bc42104d22c315bb647130630c77d3b6d3ee50",
  SN_GOERLI:
    "0x042a12c5a641619a6c58e623d5735273cdfb0e13df72c4bacb4e188892034bd6",
}

export function useMulticallContract(): Contract | null {
  const account = useSelectedAccount()
  const network = useCurrentNetwork()

  const multicallAddress = MULTICALL_ADDRESS[network.chainId]

  if (!account || !multicallAddress) {
    return null
  }

  return new Contract(MULTICALL_ABI as Abi, multicallAddress, account.provider)
}
