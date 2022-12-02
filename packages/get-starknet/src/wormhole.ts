import type { RemoteConnection } from "@argent/x-window"
import { getRemoteHandle } from "@argent/x-window"
import retry from "async-retry"

export const getIframeConnection = async (
  iframe: HTMLIFrameElement,
): Promise<RemoteConnection> => {
  const handle = await retry(
    () =>
      getRemoteHandle({
        remoteWindow: iframe.contentWindow,
        remoteOrigin: "*", // TODO: restrict to the iframe origin
        localWindow: window,
      }),
    {
      maxRetryTime: 5,
      minTimeout: 500,
    },
  ).catch((cause) => {
    throw Error("Failed to connect to iframe", { cause })
  })

  await handle.once("ARGENT_WEB_WALLET::LOADED")
  console.log("get-starknet: ARGENT_WEB_WALLET::LOADED")

  return handle
}
