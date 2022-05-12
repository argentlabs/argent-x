import { capitalize } from "lodash-es"
import { Abi, Call } from "starknet"

import { TransactionMeta } from "../../shared/transactions"

function entryPointToHumanReadable(entryPoint: string): string {
  return capitalize(entryPoint.split("_").join(" "))
}

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
