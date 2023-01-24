import { declaredTransactionsStore } from "../../../shared/udc/store"
import { TransactionUpdateListener } from "./type"

export const handleDeclareContractTransaction: TransactionUpdateListener =
  async (transactions) => {
    for (const transaction of transactions) {
      if (transaction.meta?.type === "DECLARE") {
        if (transaction.status !== "REJECTED") {
          await declaredTransactionsStore.push(transaction)
        } else {
          await declaredTransactionsStore.remove(transaction)
        }
      }
    }
  }
