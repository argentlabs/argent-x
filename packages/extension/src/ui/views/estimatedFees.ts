import { Call } from "starknet"
import { estimatedFeesRepo } from "../../shared/transactionSimulation/fees/estimatedFeesRepository"
import { atomFromRepo } from "./implementation/atomFromRepo"
import { atomFamily } from "jotai/utils"
import { atom } from "jotai"
import { objectHash } from "../../shared/objectHash"

export const allEstimatedFeesAtom = atomFromRepo(estimatedFeesRepo)

export const estimatedFeesAtom = atomFamily(
  (transactions: Call | Call[]) =>
    atom(async (get) => {
      const estimatedFees = await get(allEstimatedFeesAtom)
      const id = objectHash(transactions)
      return estimatedFees.find((estimatedFee) => id === estimatedFee.id)
    }),
  (a, b) => objectHash(a) === objectHash(b),
)
