import { Call, ProviderInterface, number, transaction } from "starknet"

const partitionResponses = (responses: string[]): string[][] => {
  if (responses.length === 0) {
    return []
  }

  const [responseLength, ...restResponses] = responses
  const responseLengthInt = number.toBN(responseLength).toNumber()
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
