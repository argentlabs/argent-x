import { Status } from "starknet"

// Global Constants for Transactions
export const SUCCESS_STATUSES: Status[] = [
  "ACCEPTED_ON_L1",
  "ACCEPTED_ON_L2",
  "PENDING",
]

export const TRANSACTION_STATUSES_TO_TRACK: Status[] = [
  "RECEIVED",
  "NOT_RECEIVED",
]
