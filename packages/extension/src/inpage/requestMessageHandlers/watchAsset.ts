import { WatchAssetParameters } from "@argent/x-window"
import { sendMessage, waitForMessage } from "../messageActions"
import { addressSchema } from "@argent/x-shared"

export async function watchAssetHandler(
  callParams: WatchAssetParameters,
): Promise<boolean> {
  const parsedAddress = addressSchema.safeParse(callParams.options.address)

  if (parsedAddress.success && callParams.type === "ERC20") {
    sendMessage({
      type: "REQUEST_TOKEN",
      data: {
        address: parsedAddress.data,
        symbol: callParams.options.symbol,
        decimals: callParams.options.decimals,
        name: callParams.options.name,
      },
    })
  }
  const { exists, actionHash } = await waitForMessage("REQUEST_TOKEN_RES", 1000)

  if (exists) {
    // token already exists
    return true
  }

  if (!actionHash) {
    throw Error("Unexpected error: actionHash is undefined")
  }

  sendMessage({ type: "OPEN_UI" })

  const result = await Promise.race([
    waitForMessage(
      "APPROVE_REQUEST_TOKEN",
      11 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    ),
    waitForMessage(
      "REJECT_REQUEST_TOKEN",
      10 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    )
      .then(() => "error" as const)
      .catch(() => {
        sendMessage({ type: "REJECT_REQUEST_TOKEN", data: { actionHash } })
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
