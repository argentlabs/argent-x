import type { Address } from "@argent/x-shared"
import type { AddStarknetChainParameters } from "@starknet-io/types-js"
import { AddStarknetChainParametersSchema } from "@argent/x-window"
import { ETH_TOKEN_ADDRESS } from "../../shared/network/constants"
import { sendMessage, waitForMessage } from "../messageActions"
import { WalletRPCError, WalletRPCErrorCodes } from "./errors"

export async function addStarknetChainHandler(
  callParams: AddStarknetChainParameters,
): Promise<boolean> {
  const {
    chain_id,
    chain_name,
    id,
    block_explorer_url,
    native_currency,
    rpc_urls,
  } = AddStarknetChainParametersSchema.parse(callParams)

  sendMessage({
    type: "REQUEST_ADD_CUSTOM_NETWORK",
    data: {
      id,
      name: chain_name,
      chainId: chain_id,
      rpcUrl: rpc_urls?.[0],
      explorerUrl: block_explorer_url?.[0],
      possibleFeeTokenAddresses: [
        (native_currency?.options.address as Address) ?? ETH_TOKEN_ADDRESS,
      ],
    },
  })

  const req = await Promise.race([
    waitForMessage("REQUEST_ADD_CUSTOM_NETWORK_RES", 1000),
    waitForMessage("REQUEST_ADD_CUSTOM_NETWORK_REJ", 1000),
  ])

  if ("error" in req) {
    throw Error(req.error)
  }

  const { exists, actionHash } = req

  if (exists) {
    // network already exists
    return true
  }

  if (!actionHash) {
    throw Error("Unexpected error: actionHash is undefined")
  }

  sendMessage({ type: "OPEN_UI" })

  const result = await Promise.race([
    waitForMessage(
      "APPROVE_REQUEST_ADD_CUSTOM_NETWORK",
      11 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    ),
    waitForMessage(
      "REJECT_REQUEST_ADD_CUSTOM_NETWORK",
      10 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    )
      .then(() => "error" as const)
      .catch(() => {
        sendMessage({
          type: "REJECT_REQUEST_ADD_CUSTOM_NETWORK",
          data: { actionHash },
        })
        return "timeout" as const
      }),
  ])

  if (result === "error") {
    throw new WalletRPCError({ code: WalletRPCErrorCodes.UserAborted })
  }
  if (result === "timeout") {
    throw new WalletRPCError({ code: WalletRPCErrorCodes.Unknown })
  }

  return true
}
