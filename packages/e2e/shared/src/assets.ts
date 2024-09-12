import {
  Account,
  uint256,
  TransactionExecutionStatus,
  RpcProvider,
  constants,
  TransactionFinalityStatus,
  num,
} from "starknet"
import commonConfig from "../config"
import { expect } from "@playwright/test"
import { logInfo, sleep } from "./common"
import { sendSlackMessage } from "./slack"

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

export type TokenSymbol = "ETH" | "WBTC" | "STRK" | "SWAY" | "USDC" | "DAI"
export type TokenName =
  | "Ethereum"
  | "Wrapped BTC"
  | "Starknet"
  | "Standard Weighted Adalian Yield"
  | "USD Coin"
  | "DAI"
export type FeeTokens = "ETH" | "STRK"
export interface AccountsToSetup {
  assets: {
    token: TokenSymbol
    balance: number
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

export const getTokenInfo = (tkn: string) => {
  const tokenInfo = tokenAddresses.get(tkn)
  if (!tokenInfo) {
    throw new Error(`Invalid token: ${tkn}`)
  }
  return tokenInfo
}

const maxRetries = 4

const formatAmount = (amount: string) => {
  return parseInt(amount, 16)
}

export const formatAmountBase18 = (amount: number) => {
  return amount * Math.pow(10, 18)
}

const getAccount = async (amount: string, token: TokenSymbol) => {
  const log: string[] = []
  const maxAttempts = 5
  let i = 0
  while (i < maxAttempts) {
    i++
    const randomAccountPosition = Math.floor(
      Math.random() * commonConfig.senderKeys!.length,
    )
    const acc = new Account(
      provider,
      commonConfig.senderAddrs![randomAccountPosition],
      commonConfig.senderKeys![randomAccountPosition],
      "1",
    )
    const initialBalance = await getBalance(acc.address, token)
    const initialBalanceFormatted =
      parseFloat(initialBalance) * Math.pow(10, 18)
    if (initialBalanceFormatted < parseInt(amount)) {
      log.push(
        `${
          commonConfig.senderAddrs![randomAccountPosition]
        } Not enough balance ${initialBalanceFormatted} ${token} < ${amount}`,
      )
    } else {
      logInfo({
        op: "getAccount",
        randomAccountPosition,
        address: acc.address,
        balance: `initialBalance ${initialBalanceFormatted} ${token}`,
      })
      return acc
    }
  }
  console.error(log.join("\n"))
  throw new Error("No account with enough balance")
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
export async function transferTokens(
  amount: number,
  to: string,
  token: TokenSymbol = "ETH",
) {
  const tokenInfo = getTokenInfo(token)
  const amountToTransfer = `${amount * Math.pow(10, tokenInfo.decimals)}`
  logInfo({ op: "transferTokens", amount, amountToTransfer, to, token })

  const { low, high } = uint256.bnToUint256(amountToTransfer)
  let placeTXAttempt = 0
  let txHash: string | null = null
  let account
  while (placeTXAttempt < maxRetries) {
    account = await getAccount(amountToTransfer, token)
    /** timeout if we don't receive a valid execution response */
    const placeTXTimeout = setTimeout(() => {
      throw new Error(`Place tx timed out: ${txHash}`)
    }, 60 * 1000) /** 60 seconds */
    try {
      placeTXAttempt++
      const tx = await account.execute({
        contractAddress: tokenInfo.address,
        entrypoint: "transfer",
        calldata: [to, low, high],
      })
      txHash = tx.transaction_hash
      const { txProcessed, txStatusResponse } = await isTXProcessed(
        tx.transaction_hash,
      )
      if (txProcessed) {
        logInfo({
          TxStatus: TransactionExecutionStatus.SUCCEEDED,
          transaction_hash: tx.transaction_hash,
        })
        return tx.transaction_hash
      }

      console.error(
        `[Failed to place TX] ${tx.transaction_hash} ${JSON.stringify(txStatusResponse)}`,
      )
    } catch (e) {
      if (e instanceof Error) {
        //for debug only
        console.error(
          `placeTXAttempt: ${placeTXAttempt}, Exception: ${txHash}`,
          e,
        )
      }
    } finally {
      clearTimeout(placeTXTimeout)
    }
    console.warn("Transfer failed, going to try again ")
  }
  return null
}

async function getBalance(accountAddress: string, token: TokenSymbol = "ETH") {
  const tokenInfo = getTokenInfo(token)
  logInfo({ op: "getBalance", accountAddress, token, tokenInfo })
  const balanceOfCall = {
    contractAddress: tokenInfo.address,
    entrypoint: "balanceOf",
    calldata: [accountAddress],
  }
  const [low] = await provider.callContract(balanceOfCall)
  const balance = (
    parseInt(low, 16) / Math.pow(10, tokenInfo.decimals)
  ).toFixed(4)

  logInfo({
    op: "getBalance",
    balance,
    formattedBalance: balance,
  })
  return balance
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
  txType === "token"
    ? (accAdd = txData.calldata[4].toString())
    : (accAdd = txData.calldata[5].toString())

  if (accAdd.length === 65) {
    accAdd = accAdd.replace("0x", "0x0")
  }
  expect(isEqualAddress(accAdd, receiver)).toBe(true)
  if (amount) {
    expect(formatAmount(txData.calldata[5].toString())).toBe(amount)
  }
}

export function isScientific(num: number) {
  const scientificPattern = /(.*)([eE])(.*)$/
  return scientificPattern.test(String(num))
}

export function convertScientificToDecimal(num: number) {
  const exponent = String(num).split("e")[1]
  return Number(num).toFixed(Math.abs(Number(exponent)))
}

export async function notifyLowBalance() {
  let msg: string = ""
  for (const acc of commonConfig.senderAddrs!) {
    for (const token of ["ETH", "STRK"]) {
      const balance = await getBalance(acc, token as TokenSymbol)
      if (parseFloat(balance) < 0.1) {
        logInfo(`###### Low balance for ${acc} ${balance}`)
        msg += "`" + acc + "`  *" + balance + " " + token + "*\n"
      }
    }
  }
  if (msg) {
    await sendSlackMessage(`*Low balance for:*\n\n${msg}\n`)
  }
}

export async function getBalances() {
  let msg: string = ""
  for (const acc of commonConfig.senderAddrs!) {
    for (const token of ["ETH", "STRK"]) {
      const balance = await getBalance(acc, token as TokenSymbol)
      logInfo(`###### Balance: ${acc} ${balance}`)
      msg += "`" + acc + "`  *" + balance + " " + token + "*\n"
    }
  }
  if (msg) {
    logInfo(`\nBalance:\n\n${msg.replaceAll("`", "").replaceAll("*", "")}\n`)
    await sendSlackMessage(`*Balance:*\n\n ${msg}\n`)
  }
}
