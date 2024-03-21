import {
  Account,
  uint256,
  TransactionExecutionStatus,
  RpcProvider,
  constants,
  TransactionFinalityStatus,
} from "starknet"
import { isEqualAddress } from "@argent/x-shared"
import config from "../config"
import { expect } from "@playwright/test"
import { sleep } from "./common"
import { sendSlackMessage } from "./slack"

export type TokenSymbol = "ETH" | "WBTC" | "STRK" | "AST" | "USDC" | "DAI"
export type TokenName =
  | "Ethereum"
  | "Wrapped BTC"
  | "Starknet"
  | "Astraly"
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
const rpcUrl = process.env.ARGENT_TESTNET_RPC_URL
console.log("Creating RPC provider with url", rpcUrl)
if (!rpcUrl) {
  throw new Error("Missing ARGENT_TESTNET_RPC_URL env variable")
}
const startScanUrl = config.starkscanTestNetUrl
if (!startScanUrl) {
  throw new Error("Missing STARKSCAN_TESTNET_URL env variable")
}
const provider = new RpcProvider({
  nodeUrl: rpcUrl,
  chainId: constants.StarknetChainId.SN_GOERLI,
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
  address: "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  decimals: 18,
})
tokenAddresses.set("WBTC", {
  name: "Wrapped BTC",
  address: "0x12d537dc323c439dc65c976fad242d5610d27cfb5f31689a0a319b8be7f3d56",
  decimals: 8,
})
tokenAddresses.set("STRK", {
  name: "Starknet Token",
  address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  decimals: 18,
})
tokenAddresses.set("AST", {
  name: "Astraly",
  address: "0x05A6B68181bb48501a7A447a3f99936827E41D77114728960f22892F02E24928",
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
      Math.random() * config.senderKeys!.length,
    )
    const acc = new Account(
      provider,
      config.senderAddrs![randomAccountPosition],
      config.senderKeys![randomAccountPosition],
      "1",
    )

    const initialBalance = await getBalance(acc.address, token)
    const initialBalanceFormatted =
      parseFloat(initialBalance) * Math.pow(10, 18)
    if (initialBalanceFormatted < parseInt(amount)) {
      log.push(
        `${
          config.senderAddrs![randomAccountPosition]
        } Not enough balance ${initialBalanceFormatted} < ${amount}`,
      )
    } else {
      console.log({
        op: "getAccount",
        randomAccountPosition,
        address: acc.address,
        balance: initialBalance,
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
  console.log({ op: "transferTokens", amount, amountToTransfer, to, token })

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
        console.log({
          TxStatus: TransactionExecutionStatus.SUCCEEDED,
          url: `${startScanUrl}/tx/${tx.transaction_hash}`,
        })
        return tx.transaction_hash
      }

      console.error(
        `[Failed to place TX] ${startScanUrl}/tx/${tx.transaction_hash} ${txStatusResponse}`,
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
  console.log({ op: "getBalance", accountAddress, token, tokenInfo })
  const balanceOfCall = {
    contractAddress: tokenInfo.address,
    entrypoint: "balanceOf",
    calldata: [accountAddress],
  }
  const [low] = await provider.callContract(balanceOfCall)
  const balance = (
    parseInt(low, 16) / Math.pow(10, tokenInfo.decimals)
  ).toFixed(4)

  console.log({
    op: "getBalance",
    balance,
    formattedBalance: balance,
  })
  return balance
}

export async function validateTx(
  txHash: string,
  receiver: string,
  amount?: number,
) {
  const log: string[] = []
  log.push("validateTx txHash:", txHash)
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
  const accAdd = txData.calldata[4].toString()
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
  for (const acc of config.senderAddrs!) {
    for (const token of ["ETH", "STRK"]) {
      const balance = await getBalance(acc, token as TokenSymbol)
      if (parseFloat(balance) < 0.1) {
        console.log(`###### Low balance for ${acc} ${balance}`)
        msg += "`" + acc + "`  *" + balance + " " + token + "*\n"
      }
    }
  }
  if (msg) {
    await sendSlackMessage(`*Low balance for:*\n\n ${msg}\n`)
  }
}
