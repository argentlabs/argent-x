import { createOffchainSession } from "@argent/x-sessions"
import type {
  AddStarknetChainParameters,
  StarknetWindowObject,
} from "get-starknet-core"
import {
  AccountInterface,
  DeclareContractPayload,
  InvocationsDetails,
  ProviderInterface,
  UniversalDeployerContractPayload,
  num,
  shortString,
} from "starknet"
import { connect, disconnect } from "starknetkit"
import { ETHTokenAddress } from "./token.service"
import getConfig from "next/config"
import { Hex, bigDecimal } from "@argent/shared"

export type StarknetWindowObjectV5 = StarknetWindowObject & {
  account: AccountInterface
}

const { publicRuntimeConfig } = getConfig()
const { webWalletUrl, argentMobileChainId } = publicRuntimeConfig

export let windowStarknet: StarknetWindowObjectV5 | null = null

export const starknetVersion = "v5"

export const silentConnectWallet = async () => {
  const { wallet } = await connect({
    modalMode: "neverAsk",
    webWalletUrl,
    argentMobileOptions: {
      dappName: "Example dapp",
      chainId: argentMobileChainId,
    },
  })
  // comment this when using webwallet -- enable is already done by @argent/get-starknet and webwallet is currently using only v4
  // to remove when @argent/get-starknet will support both v4 and v5
  //await _windowStarknet?.enable({ starknetVersion })
  windowStarknet = wallet as StarknetWindowObjectV5 | null
  return windowStarknet ?? undefined
}

export const connectWallet = async () => {
  const { wallet } = await connect({
    webWalletUrl, // TODO: remove hardcoding
    argentMobileOptions: {
      dappName: "Example dapp",
      chainId: argentMobileChainId,
    },
  })

  // comment this when using webwallet -- enable is already done by @argent/get-starknet and webwallet is currently using only v4
  // to remove when @argent/get-starknet will support both v4 and v5
  //await _windowStarknet?.enable({ starknetVersion })
  windowStarknet = wallet as StarknetWindowObjectV5 | null
  return windowStarknet ?? undefined
}

export const disconnectWallet = async () => {
  if (!windowStarknet?.isConnected) {
    return
  }
  await disconnect()
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

export const signMessage = async (message: string, skipDeploy = false) => {
  if (!windowStarknet?.isConnected) throw Error("starknet wallet not connected")
  if (!shortString.isShortString(message)) {
    throw Error("message must be a short string")
  }

  return windowStarknet.account.signMessage(
    {
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
    },
    // @ts-ignore
    { skipDeploy },
  )
}

export const createSessionKeys = async (
  sessionKey: string,
  approvedFees: string,
  account: AccountInterface,
) => {
  if (!account) throw Error("starknet wallet not connected")

  return await createOffchainSession(
    {
      sessionKey,
      expirationTime: Math.floor((Date.now() + 1000 * 60 * 60 * 24) / 1000), // 1 day in seconds
      allowedMethods: [
        {
          contractAddress: ETHTokenAddress,
          method: "transfer",
        },
      ],
    },
    account,
    {
      tokenAddress: ETHTokenAddress, // Only used for test purposes in this dapp
      maximumAmount: {
        low: num.toHex(bigDecimal.parseUnits(approvedFees, 18).value) as Hex,
        high: "0x0",
      },
    },
  )
}

export const waitForTransaction = async (hash: string) => {
  if (!windowStarknet?.isConnected) {
    return
  }
  return windowStarknet.provider.waitForTransaction(hash)
}

export const addWalletAccountsChangedListener = async (
  handleEvent: (accounts: string[]) => void,
) => {
  if (!windowStarknet?.isConnected) {
    return
  }
  windowStarknet.on("accountsChanged", handleEvent)
}

export const removeWalletAccountsChangedListener = async (
  handleEvent: (accounts: string[]) => void,
) => {
  if (!windowStarknet?.isConnected) {
    return
  }
  windowStarknet.off("accountsChanged", handleEvent)
}

export const addWalletNetworkChangedListener = async (
  handleEvent: (network?: string) => void,
) => {
  if (!windowStarknet?.isConnected) {
    return
  }
  windowStarknet.on("networkChanged", handleEvent)
}

export const removeWalletNetworkChangedListener = async (
  handleEvent: (network?: string) => void,
) => {
  if (!windowStarknet?.isConnected) {
    return
  }
  windowStarknet.off("networkChanged", handleEvent)
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

export const switchNetwork = async (chainId: string) => {
  if (!windowStarknet?.isConnected) {
    throw Error("starknet wallet not connected")
  }
  await windowStarknet.request({
    type: "wallet_switchStarknetChain",
    params: {
      chainId,
    },
  })
}
