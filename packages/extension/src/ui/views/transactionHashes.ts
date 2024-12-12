import { atomFamily } from "jotai/utils"
import { transactionHashesRepo } from "../../shared/transactions/transactionHashes/transactionHashesRepository"
import { atomFromRepo } from "./implementation/atomFromRepo"
import { atom } from "jotai"

export const allTransactionHashesAtom = atomFromRepo(transactionHashesRepo)

export const transactionHashFindAtom = atomFamily(
  (actionHash: string) =>
    atom(async (get) => {
      const transactionHash = await get(allTransactionHashesAtom)
      const record = transactionHash.find(
        (txHash) => txHash.actionHash === actionHash,
      )
      if (!record) {
        return
      }
      return record.transactionHash
    }),
  (a, b) => a === b,
)
