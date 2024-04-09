import { SwitchStarknetChainParameters } from "@argent/x-window"
import { sendMessage, waitForMessage } from "../messageActions"

export async function switchStarknetChainHandler({
  chainId,
}: SwitchStarknetChainParameters): Promise<boolean> {
  sendMessage({
    type: "REQUEST_SWITCH_CUSTOM_NETWORK",
    data: { chainId },
  })

  const req = await Promise.race([
    waitForMessage("REQUEST_SWITCH_CUSTOM_NETWORK_RES", 1000),
    waitForMessage("REQUEST_SWITCH_CUSTOM_NETWORK_REJ", 1000),
  ])

  if ("error" in req) {
    throw Error(req.error)
  }

  const { actionHash, exists } = req

  if (!exists) {
    // If network does not exist, we cannot switch to it
    return false
  }

  sendMessage({ type: "OPEN_UI" })

  if (!actionHash) {
    throw Error("Unexpected error: actionHash is undefined")
  }

  const result = await Promise.race([
    waitForMessage(
      "APPROVE_REQUEST_SWITCH_CUSTOM_NETWORK",
      11 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    ),
    waitForMessage(
      "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK",
      10 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    )
      .then(() => "error" as const)
      .catch(() => {
        sendMessage({
          type: "REJECT_REQUEST_SWITCH_CUSTOM_NETWORK",
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
