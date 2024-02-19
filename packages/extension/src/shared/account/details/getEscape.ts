import { Call, num } from "starknet"

import { getMulticallForNetwork } from "../../multicall"
import { networkService } from "../../network/service"
import { BaseWalletAccount } from "../../wallet.model"

import {
  ESCAPE_TYPE_GUARDIAN,
  ESCAPE_TYPE_SIGNER,
  Escape,
} from "./escape.model"
import { multicallWithCairo0Fallback } from "./multicallWithCairo0Fallback"

/**
 * Get escape state from account
 */

export const getEscapeForAccount = async (account: BaseWalletAccount) => {
  const network = await networkService.getById(account.networkId)

  const call: Call = {
    contractAddress: account.address,
    entrypoint: "get_escape",
  }
  const multicall = getMulticallForNetwork(network)
  const response = await multicallWithCairo0Fallback(call, multicall)

  return shapeResponse(response.result)
}

/*
Example responses:

Cairo 0

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

Cairo 1

inactive
[
  "0x0", <- ready_at
  "0x0" <- escape_type
  "0x0" <- new_signer
]

active
[
  "0x653a33a3", <- ready_at
  "0x1", <- escape_type
  "0x0" <- new_signer
]

*/

const shapeResponse = (response: string[]) => {
  if (response.length !== 2 && response.length !== 3) {
    return
  }
  const [activeAtHex, typeHex] = response /** ignore Cairo 1 new_signer */
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
