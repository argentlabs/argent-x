import { Account, SequencerProvider, constants, uint256 } from "starknet"
import { bigDecimal } from "@argent/shared"
import { Multicall } from "@argent/x-multicall"
import config from "../config"

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

const getTransaction = async (tx: string) => {
  return fetch(
    `${config.starknetTestNetUrl}/feeder_gateway/get_transaction?transactionHash=${tx}`,
    { method: "GET" },
  )
}

export async function transferEth(amount: string, to: string) {
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
  while (placeTXAttempt < maxRetries) {
    try {
      placeTXAttempt++
      const tx = await account.execute({
        contractAddress: tnkETH,
        entrypoint: "transfer",
        calldata: [to, low, high],
      })
      let failed = true
      let txSuccessAttempt = 0
      let txStatusResponse
      while (failed && txSuccessAttempt < maxRetries) {
        txSuccessAttempt++
        const txStatus = await getTransaction(tx.transaction_hash)
        txStatusResponse = await txStatus.json()
        if (txStatusResponse.execution_status === "REJECTED") {
          console.error(
            `Failed to place TX: ${config.starkscanTestNetUrl}/tx/${tx.transaction_hash}, execution_status: ${txStatusResponse.execution_status}, status: ${txStatusResponse.status}`,
          )
          txSuccessAttempt = maxRetries
        } else if (
          txStatusResponse.execution_status !== "SUCCEEDED" &&
          txStatusResponse.status !== "ACCEPTED_ON_L2"
        ) {
          console.log(
            `TX not processed: hash: ${tx.transaction_hash}, execution_status: ${txStatusResponse.execution_status}, status: ${txStatusResponse.status}`,
          )
          await sleep(5000)
        } else {
          failed = false
        }
      }
      if (failed) {
        throw `Failed to place TX: ${config.starkscanTestNetUrl}/tx/${tx.transaction_hash}, execution_status: ${txStatusResponse.execution_status}, status: ${txStatusResponse.status}`
      }

      console.log(
        `[Successful TX] ${config.starkscanTestNetUrl}/tx/${tx.transaction_hash}`,
      )
      return tx.transaction_hash
    } catch (e) {
      //for debug only
      console.log("Exception: ", e)
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

  const multicall = new Multicall(provider)
  const response = await multicall.call(balanceOfCall)
  const [low, high] = response
  const balance = bigDecimal.formatEther(uint256.uint256ToBN({ low, high }))
  return balance
}
