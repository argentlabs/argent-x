import { Abi, Call } from "starknet"

import {
  TransactionMeta,
  entryPointToHumanReadable,
} from "../../shared/transactions"

export function nameTransaction(
  calls: Call | Call[],
  _abis?: Abi[],
): TransactionMeta {
  const callsArray = Array.isArray(calls) ? calls : [calls]
  const entrypointNames = callsArray.map((call) =>
    entryPointToHumanReadable(call.entrypoint),
  )
  const lastName = entrypointNames.pop()
  return {
    title: entrypointNames.length
      ? `${entrypointNames.join(", ")} and ${lastName}`
      : lastName,
  }
}
