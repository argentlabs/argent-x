import { Address, isAddress } from "@argent/shared"
import type {
  AddStarknetChainParameters,
  WatchAssetParameters,
} from "@argent/x-window"

import type { Network } from "../shared/network/type"
import { sendMessage, waitForMessage } from "./messageActions"
import { ETH_TOKEN_ADDRESS } from "../shared/network/constants"
import { inpageMessageClient } from "./trpcClient"

export async function handleAddTokenRequest(
  callParams: WatchAssetParameters,
): Promise<boolean> {
  if (isAddress(callParams.options.address)) {
    sendMessage({
      type: "REQUEST_TOKEN",
      data: {
        address: callParams.options.address as Address,
        symbol: callParams.options.symbol,
        decimals: callParams.options.decimals,
        name: callParams.options.name,
      },
    })
  }
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
      rpcUrl: callParams.rpcUrls?.[0] ?? "",
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

interface GetDeploymentDataResult {
  address: string // Represented as 'felt252'
  class_hash: string // Represented as 'felt252'
  salt: string // Represented as 'felt252'
  calldata: string[] // Array of 'felt252', length := calldata_len
}

const toHex = (x: bigint) => `0x${x.toString(16)}`

const isStringArray = (x: any): x is string[] =>
  x.every((y: any) => typeof y === "string")

export async function handleDeploymentData(): Promise<GetDeploymentDataResult> {
  const deploymentData =
    await inpageMessageClient.accountMessaging.getAccountDeploymentPayload.query()

  const { classHash, constructorCalldata, addressSalt, contractAddress } =
    deploymentData

  if (!classHash || !constructorCalldata || !addressSalt || !contractAddress) {
    throw new Error("Deployment data not found")
  }

  if (!isStringArray(constructorCalldata)) {
    throw new Error("Constructor calldata is not an array of hex strings")
  }

  const _addressSalt = toHex(BigInt(addressSalt))
  const _callData = constructorCalldata.map((x) => toHex(BigInt(x)))

  return {
    address: contractAddress,
    class_hash: classHash,
    salt: _addressSalt,
    calldata: _callData,
  }
}
