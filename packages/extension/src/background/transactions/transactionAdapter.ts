import { CallData, Call } from "starknet"
import { Call as Callv4 } from "starknet4"

export function transactionCallsAdapter(transactions: Call | Call[]): Callv4[] {
  const calls = Array.isArray(transactions) ? transactions : [transactions]

  return calls.map((tx) => ({
    ...tx,
    calldata: CallData.toCalldata(tx.calldata),
  }))
}
