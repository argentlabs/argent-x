import {
  RpcProvider,
  constants,
  TransactionFinalityStatus,
  num,
} from "starknet"
import commonConfig from "../config"
import { expect } from "@playwright/test"
import { logInfo, sleep } from "./common"

const isEqualAddress = (a?: string, b?: string) => {
  try {
    if (!a || !b) {
      return false
    }
    return num.hexToDecimalString(a) === num.hexToDecimalString(b)
  } catch {
    // ignore parsing error
  }
  return false
}

export type TokenSymbol =
  | "ETH"
  | "WBTC"
  | "STRK"
  | "SWAY"
  | "USDC"
  | "DAI"
  | "ádfas"
export type TokenName =
  | "Ethereum"
  | "Wrapped BTC"
  | "Starknet"
  | "Standard Weighted Adalian Yield"
  | "DAI"
  | "USD Coin (Fake)"
export type FeeTokens = "ETH" | "STRK"
export interface AccountsToSetup {
  assets: {
    token: TokenSymbol
    balance: number | string
  }[]
  deploy?: boolean
  feeToken?: FeeTokens
}
const rpcUrl = commonConfig.rpcUrl
logInfo({ op: "Creating RPC provider with url", rpcUrl })

const provider = new RpcProvider({
  nodeUrl: rpcUrl,
  chainId: constants.StarknetChainId.SN_SEPOLIA,
  headers: {
    "argent-version": process.env.VERSION || "Unknown version",
    "argent-client": "argent-x",
  },
})

interface TokenInfo {
  name: string
  address: string
  decimals: number
}
const tokenAddresses = new Map<string, TokenInfo>()
tokenAddresses.set("ETH", {
  name: "Ethereum",
  address: "0x049D36570D4e46f48e99674bd3fcc84644DdD6b96F7C741B1562B82f9e004dC7",
  decimals: 18,
})
tokenAddresses.set("WBTC", {
  name: "Wrapped BTC",
  address: "0x00c6164dA852d230360333D6adE3551eE3e48124C815704f51fA7F12D8287Dcc",
  decimals: 8,
})
tokenAddresses.set("STRK", {
  name: "Starknet Token",
  address: "0x04718f5a0Fc34cC1AF16A1cdee98fFB20C31f5cD61D6Ab07201858f4287c938D",
  decimals: 18,
})
tokenAddresses.set("SWAY", {
  name: "Standard Weighted Adalian Yield",
  address: "0x0030058F19Ed447208015F6430F0102e8aB82D6c291566D7E73fE8e613c3D2ed",
  decimals: 18,
})
tokenAddresses.set("USDC", {
  name: "USD Coin (Fake)",
  address: "0x07ab0b8855a61f480b4423c46c32fa7c553f0aac3531bbddaa282d86244f7a23",
  decimals: 6,
})
export const getTokenInfo = (tkn: string) => {
  const tokenInfo = tokenAddresses.get(tkn)
  if (!tokenInfo) {
    throw new Error(`Invalid token: ${tkn}`)
  }
  return tokenInfo
}

const formatAmount = (amount: string) => {
  return parseInt(amount, 16)
}

export const formatAmountBase18 = (amount: number) => {
  return amount * Math.pow(10, 18)
}

const isTXProcessed = async (txHash: string) => {
  let txProcessed = false
  let txAcceptedRetries = 10
  let txStatusResponse
  while (!txProcessed && txAcceptedRetries > 0) {
    txAcceptedRetries--
    txStatusResponse = await provider.getTransactionStatus(txHash)
    if (
      txStatusResponse.finality_status ===
        TransactionFinalityStatus.ACCEPTED_ON_L2 ||
      txStatusResponse.finality_status ===
        TransactionFinalityStatus.ACCEPTED_ON_L1
    ) {
      txProcessed = true
    } else {
      await sleep(2 * 1000)
    }
  }
  if (!txProcessed) {
    console.error("txStatusResponse", txStatusResponse)
  }
  return { txProcessed, txStatusResponse }
}

const getTXData = async (txHash: string) => {
  const isProcessed = await isTXProcessed(txHash)
  if (!isProcessed) {
    throw new Error(`Transaction not processed: ${txHash}`)
  }
  let nodeUpdated = false
  let txAcceptedRetries = 10
  let txData
  while (!nodeUpdated && txAcceptedRetries > 0) {
    txAcceptedRetries--
    txData = await provider.getTransactionByHash(txHash)
    if (txData.type) {
      nodeUpdated = true
    } else {
      await sleep(2 * 1000)
    }
  }
  if (!nodeUpdated) {
    console.error("txData", txData)
  }
  return { nodeUpdated, txData }
}

export async function validateTx({
  txHash,
  receiver,
  amount,
  txType = "token",
}: {
  txHash: string
  receiver: string
  amount?: number
  txType?: "token" | "nft"
}) {
  const log: string[] = []
  logInfo({
    op: "validateTx",
    txHash,
    receiver,
    amount,
  })
  const processed = await isTXProcessed(txHash)
  if (!processed) {
    throw new Error(`Transaction not processed: ${txHash}`)
  }
  const { nodeUpdated, txData } = await getTXData(txHash)
  if (!nodeUpdated) {
    console.error(log.join("\n"))
    throw new Error(`Transaction data not found: ${txHash}`)
  }
  log.push("txData", JSON.stringify(txData))
  if (!("calldata" in txData!)) {
    console.error(log.join("\n"))
    throw new Error(
      `Invalid transaction data: ${txHash}, ${JSON.stringify(txData)}`,
    )
  }
  logInfo(log)
  let accAdd
  //todo add a function to this
  const isPaymasterTx = txData.calldata.length > 10

  txType === "token"
    ? (accAdd = isPaymasterTx
        ? txData.calldata[25].toString()
        : txData.calldata[4].toString()) // TODO: This only works with paymaster. Support native deployment too
    : (accAdd = txData.calldata[5].toString())

  if (accAdd.length === 65) {
    accAdd = accAdd.replace("0x", "0x0")
  }
  expect(isEqualAddress(accAdd, receiver)).toBe(true)
  if (amount) {
    expect(
      formatAmount(
        isPaymasterTx
          ? txData.calldata[26].toString()
          : txData.calldata[5].toString(),
      ),
    ).toBe(amount) // TODO: This only works with paymaster. Support native deployment too
  }
}

export function isScientific(num: number | string) {
  const scientificPattern = /(.*)([eE])(.*)$/
  return scientificPattern.test(String(num))
}

export function convertScientificToDecimal(num: number | string) {
  const exponent = String(num).split("e")[1]
  return Number(num).toFixed(Math.abs(Number(exponent)))
}
