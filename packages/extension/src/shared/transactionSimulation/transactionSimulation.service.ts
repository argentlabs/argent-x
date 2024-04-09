import { isArgentNetworkId } from "@argent/x-shared"
import { ARGENT_TRANSACTION_BULK_SIMULATION_URL } from "../api/constants"
import { fetcher } from "../api/fetcher"
import { TransactionError } from "../errors/transaction"
import {
  ApiTransactionSimulationResponseUnparsed,
  IFetchTransactionSimulationBulk,
  ApiTransactionBulkSimulationResponse,
} from "./types"
import { argentXHeaders } from "../api/headers"

export const fetchTransactionBulkSimulation = async ({
  invocations,
  networkId,
  chainId,
  fetcher: fetcherImpl = fetcher,
}: IFetchTransactionSimulationBulk): Promise<
  ApiTransactionBulkSimulationResponse | undefined
> => {
  if (!ARGENT_TRANSACTION_BULK_SIMULATION_URL) {
    throw new TransactionError({
      code: "SIMULATION_DISABLED",
    })
  }
  if (!isArgentNetworkId(networkId)) {
    return
  }
  try {
    const backendSimulation =
      await fetcherImpl<ApiTransactionSimulationResponseUnparsed>(
        ARGENT_TRANSACTION_BULK_SIMULATION_URL,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...argentXHeaders,
          },
          body: JSON.stringify({
            chainId,
            transactions: invocations,
          }),
        },
      )

    return backendSimulation.simulationResults
  } catch (e) {
    /** Disable client-side simulation
     */
    // if ((e as SimulationError).status >= 500) {
    //   console.error("Failed to fetch transaction simulation from backend", e)
    //   console.warn("Falling back to client-side simulation")
    //   return undefined
    // }
    // throw e
    return undefined
  }
}
