import { transactionsStore } from "../../../../../shared/transactions/store"
import { TransactionsWorker } from "./implementation"

export const transactionsWorker = new TransactionsWorker(transactionsStore)
