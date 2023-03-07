import { Call, number } from "starknet"

import { getMulticallForNetwork } from "../../multicall"
import { getNetwork } from "../../network"
import { BaseWalletAccount } from "../../wallet.model"

/** https://github.com/argentlabs/argent-contracts-starknet/blob/main/contracts/account/library.cairo#L249-L250 */

export const ESCAPE_TYPE_GUARDIAN = 1
export const ESCAPE_TYPE_SIGNER = 2

export const ESCAPE_SECURITY_PERIOD_DAYS = 7

export interface Escape {
  /** Time stamp escape will be active, in seconds */
  activeAt: number
  type: typeof ESCAPE_TYPE_GUARDIAN | typeof ESCAPE_TYPE_SIGNER
}

/**
 * Get escape state from account
 */

export const getEscapeForAccount = async (account: BaseWalletAccount) => {
  const network = await getNetwork(account.networkId)
  const call: Call = {
    contractAddress: account.address,
    entrypoint: "getEscape",
  }
  const multicall = getMulticallForNetwork(network)
  const response = await multicall.call(call)
  return shapeResponse(response)
}

/*
Example responses:

inactive
[
  "0x0", <- activeAt
  "0x0" <- type
]

active
[
  "0x63e3bb79", <- activeAt
  "0x1" <- type
]
*/

const shapeResponse = (response: string[]) => {
  if (response.length !== 2) {
    return
  }
  const [activeAtHex, typeHex] = response
  const activeAt = Number(number.hexToDecimalString(activeAtHex))
  const type = Number(number.hexToDecimalString(typeHex))
  if (
    activeAt === 0 ||
    (type !== ESCAPE_TYPE_GUARDIAN && type !== ESCAPE_TYPE_SIGNER)
  ) {
    return
  }
  return {
    activeAt,
    type,
  } as Escape
}
