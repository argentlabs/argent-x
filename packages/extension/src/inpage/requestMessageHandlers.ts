import type {
  AddStarknetChainParameters,
  WatchAssetParameters,
} from "@argent/x-window"

import type { Network } from "../shared/network"
import { sendMessage, waitForMessage } from "./messageActions"

export async function handleAddTokenRequest(
  callParams: WatchAssetParameters,
): Promise<boolean> {
  sendMessage({
    type: "REQUEST_TOKEN",
    data: {
      address: callParams.options.address,
      symbol: callParams.options.symbol,
      decimals: callParams.options.decimals,
      name: callParams.options.name,
    },
  })
  const { actionHash } = await waitForMessage("REQUEST_TOKEN_RES", 1000)

  if (!actionHash) {
    // token already exists
    return false
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

export async function handleAddNetworkRequest(
  callParams: AddStarknetChainParameters,
): Promise<boolean> {
  sendMessage({
    type: "REQUEST_ADD_CUSTOM_NETWORK",
    data: {
      id: callParams.id,
      name: callParams.chainName,
      chainId: callParams.chainId,
      baseUrl: callParams.baseUrl,
      rpcUrl: callParams.rpcUrls?.[0],
      explorerUrl: callParams.blockExplorerUrls?.[0],
      accountClassHash: (callParams as any).accountImplementation,
    },
  })

  const req = await Promise.race([
    waitForMessage("REQUEST_ADD_CUSTOM_NETWORK_RES", 1000),
    waitForMessage("REQUEST_ADD_CUSTOM_NETWORK_REJ", 1000),
  ])

  if ("error" in req) {
    throw Error(req.error)
  }

  const { actionHash } = req

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

export async function handleSwitchNetworkRequest(callParams: {
  chainId: Network["chainId"]
}): Promise<boolean> {
  sendMessage({
    type: "REQUEST_SWITCH_CUSTOM_NETWORK",
    data: { chainId: callParams.chainId },
  })

  const req = await Promise.race([
    waitForMessage("REQUEST_SWITCH_CUSTOM_NETWORK_RES", 1000),
    waitForMessage("REQUEST_SWITCH_CUSTOM_NETWORK_REJ", 1000),
  ])

  if ("error" in req) {
    throw Error(req.error)
  }

  const { actionHash } = req

  sendMessage({ type: "OPEN_UI" })

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
