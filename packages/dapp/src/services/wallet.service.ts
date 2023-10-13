import { StarknetWindowObject, connect } from "@argent/get-starknet"
import type { AddStarknetChainParameters } from "get-starknet-core"
import {
  AccountInterface,
  DeclareContractPayload,
  InvocationsDetails,
  ProviderInterface,
  UniversalDeployerContractPayload,
  shortString,
} from "starknet"

export type StarknetWindowObjectV5 = StarknetWindowObject & {
  account: AccountInterface
}

export let windowStarknet: StarknetWindowObjectV5 | null = null

export const starknetVersion = "v5"

export const silentConnectWallet = async () => {
  const _windowStarknet = await connect({
    modalMode: "neverAsk",
  })
  // comment this when using webwallet -- enable is already done by @argent/get-starknet and webwallet is currently using only v4
  // to remove when @argent/get-starknet will support both v4 and v5
  //await _windowStarknet?.enable({ starknetVersion })
  windowStarknet = _windowStarknet as StarknetWindowObjectV5 | null
  return windowStarknet ?? undefined
}

export const connectWallet = async (enableWebWallet: boolean) => {
  const _windowStarknet = await connect({
    exclude: enableWebWallet ? [] : ["argentWebWallet"],
    modalWalletAppearance: "all",
    enableArgentMobile: true,
  })

  // comment this when using webwallet -- enable is already done by @argent/get-starknet and webwallet is currently using only v4
  // to remove when @argent/get-starknet will support both v4 and v5
  //await _windowStarknet?.enable({ starknetVersion })
  windowStarknet = _windowStarknet as StarknetWindowObjectV5 | null
  return windowStarknet ?? undefined
}

export const walletAddress = async (): Promise<string | undefined> => {
  if (!windowStarknet?.isConnected) {
    return
  }
  return windowStarknet.selectedAddress
}

export const addToken = async (address: string): Promise<void> => {
  if (!windowStarknet?.isConnected) {
    throw Error("starknet wallet not connected")
  }
  await windowStarknet.request({
    type: "wallet_watchAsset",
    params: {
      type: "ERC20",
      options: {
        address,
      },
    },
  })
}

export const getChainId = async (
  provider?: ProviderInterface,
): Promise<string | undefined> => {
  try {
    if (!provider) {
      throw Error("no provider")
    }
    const chainId = await provider.getChainId()
    return shortString.decodeShortString(chainId)
  } catch {}
}

export const signMessage = async (message: string) => {
  if (!windowStarknet?.isConnected) throw Error("starknet wallet not connected")
  if (!shortString.isShortString(message)) {
    throw Error("message must be a short string")
  }

  return windowStarknet.account.signMessage({
    domain: {
      name: "Example DApp",
      chainId: windowStarknet.chainId,
      version: "0.0.1",
    },
    types: {
      StarkNetDomain: [
        { name: "name", type: "felt" },
        { name: "chainId", type: "felt" },
        { name: "version", type: "felt" },
      ],
      Message: [{ name: "message", type: "felt" }],
    },
    primaryType: "Message",
    message: {
      message,
    },
  })
}

export const waitForTransaction = async (hash: string) => {
  if (!windowStarknet?.isConnected) {
    return
  }
  return windowStarknet.provider.waitForTransaction(hash)
}

export const addWalletChangeListener = async (
  handleEvent: (accounts: string[]) => void,
) => {
  if (!windowStarknet?.isConnected) {
    return
  }
  windowStarknet.on("accountsChanged", handleEvent)
}

export const removeWalletChangeListener = async (
  handleEvent: (accounts: string[]) => void,
) => {
  if (!windowStarknet?.isConnected) {
    return
  }
  windowStarknet.off("accountsChanged", handleEvent)
}

export const declare = async (
  payload: DeclareContractPayload,
  transactionsDetail?: InvocationsDetails,
) => {
  if (!windowStarknet?.isConnected) {
    throw Error("starknet wallet not connected")
  }

  return windowStarknet.account.declare(payload, transactionsDetail)
}

export const deploy = async (
  payload: UniversalDeployerContractPayload,
  details?: InvocationsDetails,
) => {
  if (!windowStarknet?.isConnected) {
    throw Error("starknet wallet not connected")
  }

  return windowStarknet.account.deploy(payload, details)
}

export const declareAndDeploy = async (
  payload: DeclareContractPayload,
  transactionsDetail?: InvocationsDetails,
) => {
  if (!windowStarknet?.isConnected) {
    throw Error("starknet wallet not connected")
  }

  return windowStarknet.account.declareAndDeploy(payload, transactionsDetail)
}

export const addNetwork = async (params: AddStarknetChainParameters) => {
  if (!windowStarknet?.isConnected) {
    throw Error("starknet wallet not connected")
  }
  await windowStarknet.request({
    type: "wallet_addStarknetChain",
    params,
  })
}
