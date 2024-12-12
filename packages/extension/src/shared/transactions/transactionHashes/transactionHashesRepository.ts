import browser from "webextension-polyfill"
import { ChromeRepository } from "../../storage/__new/chrome"
import type { Hex } from "@argent/x-shared"
import { hexSchema } from "@argent/x-shared"

export type TransactionHashMap = {
  actionHash: string
  transactionHash: Hex
}

export const transactionHashesRepo = new ChromeRepository<TransactionHashMap>(
  browser,
  {
    namespace: "core:transactionHashes",
    areaName: "session",
    compare: (a, b) => a.actionHash === b.actionHash,
  },
)

export const addTransactionHash = async (
  actionHash: string,
  transactionHash: string,
) => {
  const transactionHashData: TransactionHashMap = {
    actionHash,
    transactionHash: hexSchema.parse(transactionHash),
  }
  await transactionHashesRepo.upsert(transactionHashData)
  return transactionHashData
}

export const getTransactionHash = async (
  actionHash: string,
): Promise<TransactionHashMap | null> => {
  const [txHash] = await transactionHashesRepo.get(
    (tx) => tx.actionHash === actionHash,
  )

  if (!txHash) {
    console.error(`No txHash found for ${actionHash} Action Hash`)
    return null
  }

  return txHash
}
