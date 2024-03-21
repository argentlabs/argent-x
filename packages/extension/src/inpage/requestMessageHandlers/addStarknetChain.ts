import { AddStarknetChainParameters } from "@argent/x-window"
import { sendMessage, waitForMessage } from "../messageActions"
import { Address } from "@argent/x-shared"
import { ETH_TOKEN_ADDRESS } from "../../shared/network/constants"

export async function addStarknetChainHandler(
  callParams: AddStarknetChainParameters,
): Promise<boolean> {
  sendMessage({
    type: "REQUEST_ADD_CUSTOM_NETWORK",
    data: {
      id: callParams.id,
      name: callParams.chainName,
      chainId: callParams.chainId,
      rpcUrl: callParams.rpcUrls?.[0],
      explorerUrl: callParams.blockExplorerUrls?.[0],
      accountClassHash: (callParams as any).accountImplementation,
      possibleFeeTokenAddresses: [
        (callParams.nativeCurrency?.address as Address) ?? ETH_TOKEN_ADDRESS,
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
    throw Error("User abort")
  }
  if (result === "timeout") {
    throw Error("User action timed out")
  }

  return true
}
