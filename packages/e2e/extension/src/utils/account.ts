import {
  Account,
  SequencerProvider,
  constants,
  uint256,
  num,
  GetTransactionReceiptResponse,
  TransactionExecutionStatus,
} from "starknet"
import { bigDecimal } from "@argent/shared"
import { getBatchProvider } from "@argent/x-multicall"
import config from "../config"
import { expect } from "@playwright/test"

export interface AccountsToSetup {
  initialBalance: number
  deploy?: boolean
}

const provider = new SequencerProvider({
  network: constants.NetworkName.SN_GOERLI,
})
const tnkETH =
  "0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7" // address of ETH
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const maxRetries = 4

const isEqualAddress = (a: string, b: string) => {
  try {
    return (
      num.hexToDecimalString(a.toLocaleLowerCase()) ===
      num.hexToDecimalString(b.toLocaleLowerCase())
    )
  } catch {
    // ignore parsing error
  }
  return false
}

const formatAmount = (amount: string) => {
  return parseInt(amount, 16) / Math.pow(10, 18)
}

const getTransaction = async (tx: string) => {
  return fetch(
    `${config.starknetTestNetUrl}/feeder_gateway/get_transaction?transactionHash=${tx}`,
    { method: "GET" },
  )
}

export async function transferEth(amount: string, to: string) {
  console.log(
    "########################### transferEth ##################################",
  )
  const account = new Account(
    provider,
    config.senderAddr!,
    config.senderKey!,
    "1",
  )
  const initialBalance = await balanceEther(account.address)
  const initialBalanceFormatted = parseFloat(initialBalance) * Math.pow(10, 18)
  const { low, high } = uint256.bnToUint256(amount)

  if (initialBalanceFormatted < parseInt(amount)) {
    throw `Failed to tranfer: Not enought balance ${initialBalanceFormatted} < ${amount}`
  }
  let placeTXAttempt = 0
  let txHash
  while (placeTXAttempt < maxRetries) {
    /** timemout if we don't receive a valid execution response */
    const placeTXTimeout = setTimeout(() => {
      throw new Error("Place tx timed out")
    }, 30 * 1000) /** 30 seconds */
    try {
      placeTXAttempt++
      const tx = await account.execute({
        contractAddress: tnkETH,
        entrypoint: "transfer",
        calldata: [to, low, high],
      })
      txHash = tx.transaction_hash
      let txStatusResponse
      let hasExecutionStatus = false
      while (!hasExecutionStatus) {
        const txStatus = await getTransaction(tx.transaction_hash)
        txStatusResponse =
          (await txStatus.json()) as GetTransactionReceiptResponse
        hasExecutionStatus =
          "execution_status" in txStatusResponse
            ? Boolean(txStatusResponse.execution_status)
            : false
        if (!hasExecutionStatus) {
          console.log(
            `[TX awating execution_status] hash: ${tx.transaction_hash}, status: ${txStatusResponse.status}`,
          )
          await sleep(5000)
        }
      }
      if (
        txStatusResponse &&
        "execution_status" in txStatusResponse &&
        txStatusResponse.execution_status ===
          TransactionExecutionStatus.SUCCEEDED
      ) {
        console.log(
          `[TX execution_status ${TransactionExecutionStatus.SUCCEEDED}] ${config.starkscanTestNetUrl}/tx/${tx.transaction_hash}`,
        )
        return tx.transaction_hash
      }
      const elements = [
        `[Failed to place TX] ${config.starkscanTestNetUrl}/tx/${tx.transaction_hash}`,
      ]
      if (txStatusResponse) {
        if ("execution_status" in txStatusResponse) {
          elements.push(
            `execution_status: ${txStatusResponse.execution_status}`,
          )
        }
        if ("revert_reason" in txStatusResponse) {
          elements.push(`revert_reason: ${txStatusResponse.revert_reason}`)
        }
        if ("transaction_failure_reason" in txStatusResponse) {
          elements.push(
            `transaction_failure_reason.error_message: ${txStatusResponse.transaction_failure_reason.error_message}`,
          )
        }
        elements.push(`status: ${txStatusResponse.status}`)
      } else {
        elements.push("unable to get tx status response")
      }
      const message = elements.join(", ")
      console.error(message)
    } catch (e) {
      //for debug only
      console.log(`Exception: ${txHash}`, e)
    } finally {
      clearTimeout(placeTXTimeout)
    }
    console.warn("Transfer failed, going to try again ")
  }
}

export async function balanceEther(accountAddress: string) {
  const balanceOfCall = {
    contractAddress: tnkETH,
    entrypoint: "balanceOf",
    calldata: [accountAddress],
  }

  const multicall = getBatchProvider(provider)
  const { result } = await multicall.callContract(balanceOfCall)
  const [low, high] = result
  const balance = bigDecimal.formatEther(uint256.uint256ToBN({ low, high }))
  return parseFloat(balance).toFixed(4)
}

export async function validateTx(
  txHash: string,
  reciever: string,
  amount?: number,
) {
  await provider.waitForTransaction(txHash)
  const txData = await provider.getTransaction(txHash)
  if (!("calldata" in txData)) {
    throw new Error(`Invalid transaction data: ${JSON.stringify(txData)}`)
  }
  const accAdd = txData.calldata[4].toString()
  expect(isEqualAddress(accAdd, reciever)).toBe(true)
  if (amount) {
    expect(formatAmount(txData.calldata[5].toString())).toBe(amount)
  }
}
