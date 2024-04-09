import { TypedData } from "starknet"
import { sendMessage, waitForMessage } from "../messageActions"

export async function signTypedDataHandler(params: TypedData) {
  const skipDeploy = "skipDeploy" in params ? !!params.skipDeploy : false

  sendMessage({
    type: "SIGN_MESSAGE",
    data: { typedData: params, options: { skipDeploy } },
  })
  const { actionHash } = await waitForMessage("SIGN_MESSAGE_RES", 1000)
  sendMessage({ type: "OPEN_UI" })

  const result = await Promise.race([
    waitForMessage(
      "SIGNATURE_SUCCESS",
      11 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    ),
    waitForMessage(
      "SIGNATURE_FAILURE",
      10 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    )
      .then((x) => x)
      .catch((e) => {
        sendMessage({
          type: "SIGNATURE_FAILURE",
          data: { actionHash, error: e.message }, // this error will be thrown by waitForMessage after the timeout
        })
        return "timeout" as const
      }),
  ])

  if (result === "timeout") {
    throw Error("User action timed out")
  }

  if ("error" in result) {
    throw Error(result.error)
  }

  return result.signature
}
