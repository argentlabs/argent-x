import {
  AddStarknetChainParameters,
  WatchAssetParameters,
} from "./inpage.model"
import { sendMessage, waitForMsgOfType } from "./messageActions"

export async function handleAddTokenRequest(
  callParams: WatchAssetParameters,
): Promise<boolean> {
  sendMessage({
    type: "REQUEST_TOKEN",
    data: {
      address: callParams.options.address,
      symbol: callParams.options.symbol,
      decimals: callParams.options.decimals?.toString(),
      name: callParams.options.name,
    },
  })
  const { actionHash } = await waitForMsgOfType("REQUEST_TOKEN_RES", 1000)

  if (!actionHash) {
    // token already exists
    return false
  }

  sendMessage({ type: "OPEN_UI" })

  const result = await Promise.race([
    waitForMsgOfType(
      "APPROVE_REQUEST_TOKEN",
      11 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    ),
    waitForMsgOfType(
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

export async function handleAddNetworkRequest(
  callParams: AddStarknetChainParameters,
): Promise<boolean> {
  sendMessage({
    type: "REQUEST_CUSTOM_NETWORK",
    data: {
      id: callParams.id,
      name: callParams.chainName,
      chainId: callParams.chainId,
      baseUrl: callParams.baseUrl,
      rpcUrl: callParams.rpcUrl,
      explorerUrl: callParams.blockExplorerUrl,
      accountImplementation: callParams.accountImplementation,
    },
  })

  const { actionHash } = await waitForMsgOfType(
    "REQUEST_CUSTOM_NETWORK_RES",
    1000,
  )

  if (!actionHash) {
    return false
  }

  sendMessage({ type: "OPEN_UI" })

  const result = await Promise.race([
    waitForMsgOfType(
      "APPROVE_REQUEST_CUSTOM_NETWORK",
      11 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    ),
    waitForMsgOfType(
      "REJECT_REQUEST_CUSTOM_NETWORK",
      10 * 60 * 1000,
      (x) => x.data.actionHash === actionHash,
    )
      .then(() => "error" as const)
      .catch(() => {
        sendMessage({
          type: "REJECT_REQUEST_CUSTOM_NETWORK",
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
