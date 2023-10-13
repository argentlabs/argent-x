import { Call, num } from "starknet"

import { getMulticallForNetwork } from "../../multicall"
import { networkService } from "../../network/service"
import { BaseWalletAccount } from "../../wallet.model"

import {
  ESCAPE_TYPE_GUARDIAN,
  ESCAPE_TYPE_SIGNER,
  Escape,
} from "./escape.model"

/**
 * Get escape state from account
 */

export const getEscapeForAccount = async (account: BaseWalletAccount) => {
  const network = await networkService.getById(account.networkId)

  // Prioritize Cairo 1 get_escape over cairo 0 getEscape
  const call: Call = {
    contractAddress: account.address,
    entrypoint: "get_escape",
  }
  const multicall = getMulticallForNetwork(network)
  let response: string[] = []

  try {
    response = await multicall.call(call)
  } catch {
    call.entrypoint = "getEscape"
    response = await multicall.call(call)
  }

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
  const activeAt = Number(num.hexToDecimalString(activeAtHex))
  const type = Number(num.hexToDecimalString(typeHex))
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
