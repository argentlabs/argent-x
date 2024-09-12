import { RequestAccountsParameters } from "@starknet-io/types-js"
import { sendMessage, waitForMessage } from "../messageActions"

export async function requestAccountsHandler(
  params?: RequestAccountsParameters,
) {
  sendMessage({
    type: "CONNECT_DAPP",
    data: { silent: params?.silent_mode },
  })
  const result = await Promise.race([
    waitForMessage("CONNECT_DAPP_RES", 10 * 60 * 1000),
    waitForMessage("REJECT_PREAUTHORIZATION", 10 * 60 * 1000).then(
      () => "USER_ABORTED" as const,
    ),
  ])

  if (!result) {
    throw Error("No wallet account (should not be possible)")
  }
  if (result === "USER_ABORTED") {
    throw Error("User aborted")
  }

  const { address } = result

  return [address]
}
