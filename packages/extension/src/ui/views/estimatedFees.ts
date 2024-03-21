import {
  estimatedFeesRepo,
  getIdForTransactions,
} from "../../shared/transactionSimulation/fees/estimatedFeesRepository"
import { atomFromRepo } from "./implementation/atomFromRepo"
import { atomFamily } from "jotai/utils"
import { atom } from "jotai"
import { objectHash } from "../../shared/objectHash"
import { TransactionAction } from "@argent/x-shared"

export const allEstimatedFeesAtom = atomFromRepo(estimatedFeesRepo)

export const estimatedFeesAtom = atomFamily(
  (transactionAction: TransactionAction) =>
    atom(async (get) => {
      const estimatedFees = await get(allEstimatedFeesAtom)
      const id = getIdForTransactions(transactionAction)
      return estimatedFees.find((estimatedFee) => id === estimatedFee.id)
    }),
  (a, b) => objectHash(a) === objectHash(b),
)
