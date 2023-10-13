import {
  Call,
  GatewayError,
  ProviderInterface,
  num,
  transaction,
  CallData,
} from "starknet"

const partitionResponses = (responses: string[]): string[][] => {
  if (responses.length === 0) {
    return []
  }

  const [responseLength, ...restResponses] = responses
  const responseLengthInt = Number(num.toBigInt(responseLength))
  const response = restResponses.slice(0, responseLengthInt)
  const remainingResponses = restResponses.slice(responseLengthInt)

  return [response, ...partitionResponses(remainingResponses)]
}

const extractErrorCallIndex = (e: Error) => {
  try {
    const errorCallIndex = (e as any)
      .toString()
      .match(/Error message: multicall (\d+) failed/)?.[1]
    if (errorCallIndex === undefined) {
      throw e
    }
    return parseInt(errorCallIndex, 10)
  } catch {
    throw e
  }
}

const fallbackAggregate = async (
  provider: ProviderInterface,
  calls: Call[],
): Promise<(string[] | Error)[]> => {
  const results = await Promise.allSettled(
    calls.map((call) =>
      provider
        .callContract({
          contractAddress: call.contractAddress,
          entrypoint: call.entrypoint,
          calldata: CallData.toCalldata(call.calldata),
        })
        .then((res) => res.result),
    ),
  )

  return results.map((result) => {
    if (result.status === "fulfilled") {
      return result.value
    }
    return result.reason
  })
}

const shouldFallbackToProvider = (e: unknown) => {
  if (
    e instanceof GatewayError &&
    e.errorCode === "StarknetErrorCode.UNINITIALIZED_CONTRACT"
  ) {
    return true
  }
  if (e instanceof Error && e.toString().includes("-32603")) {
    // RPC ERROR
    return true
  }
  return false
}

export const aggregate = async (
  provider: ProviderInterface,
  multicallAddress: string,
  calls: Call[],
): Promise<(string[] | Error)[]> => {
  if (calls.length === 0) {
    return []
  }
  try {
    const res = await provider.callContract({
      contractAddress: multicallAddress,
      entrypoint: "aggregate",
      calldata: transaction.fromCallsToExecuteCalldata([...calls]),
    })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_blockNumber, _totalLength, ...results] = res.result

    return partitionResponses(results)
  } catch (e) {
    if (!(e instanceof Error)) {
      throw e
    }

    if (shouldFallbackToProvider(e)) {
      return fallbackAggregate(provider, calls)
    }

    const errorCallIndex = extractErrorCallIndex(e)
    const remainingCalls = calls.filter((_, i) => i !== errorCallIndex)
    const remainingResults = await aggregate(
      provider,
      multicallAddress,
      remainingCalls,
    )
    return [
      ...remainingResults.slice(0, errorCallIndex),
      e,
      ...remainingResults.slice(errorCallIndex),
    ]
  }
}
