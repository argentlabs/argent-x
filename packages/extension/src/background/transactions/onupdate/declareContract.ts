import { declaredTransactionsStore } from "../../../shared/udc/store"
import { UcdTransactionType } from "../../udcAction"
import { TransactionUpdateListener } from "./type"

export const handleDeclareContractTransaction: TransactionUpdateListener =
  async (transactions) => {
    for (const transaction of transactions) {
      if (
        transaction.meta?.type === UcdTransactionType.DECLARE_CONTRACT &&
        transaction.status !== "REJECTED"
      ) {
        await declaredTransactionsStore.push(transaction)
      }

      if (
        transaction.meta?.type === UcdTransactionType.DECLARE_CONTRACT &&
        transaction.status === "REJECTED"
      ) {
        await declaredTransactionsStore.remove(transaction)
      }
    }
  }
