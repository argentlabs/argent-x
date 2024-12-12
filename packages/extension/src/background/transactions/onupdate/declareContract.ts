import { declaredTransactionsStore } from "../../../shared/udc/store"
import { UdcTransactionType } from "../../udcAction"
import type { TransactionUpdateListener } from "./type"
import { getTransactionStatus } from "../../../shared/transactions/utils"

export const handleDeclareContractTransaction: TransactionUpdateListener =
  async (transactions) => {
    for (const transaction of transactions) {
      if (transaction.meta?.type === UdcTransactionType.DECLARE_CONTRACT) {
        const { finality_status } = getTransactionStatus(transaction)
        if (finality_status !== "REJECTED") {
          await declaredTransactionsStore.push(transaction)
        } else {
          await declaredTransactionsStore.remove(transaction)
        }
      }
    }
  }
