import { transactionsStore } from "../../../../shared/transactions/store"
import { TransactionsWorker } from "./TransactionsWorker"

export const transactionsWorker = new TransactionsWorker(transactionsStore)
