import {
  Address,
  TransactionAction,
  swrRefetchDisabledConfig,
} from "@argent/shared"
import { useCallback } from "react"
import { TransactionType } from "starknet"

import { sendMessage, waitForMessage } from "../../../../shared/messages"
import { ApiTransactionBulkSimulationResponse } from "../../../../shared/transactionSimulation/types"
import { useConditionallyEnabledSWR } from "../../../services/swr.service"
import { ARGENT_TRANSACTION_SIMULATION_API_ENABLED } from "./../../../../shared/api/constants"

export interface IUseTransactionSimulation {
  transactionAction: TransactionAction
  feeTokenAddress: Address
  actionHash?: string
}

export const useTransactionSimulationEnabled = () => {
  return ARGENT_TRANSACTION_SIMULATION_API_ENABLED
}

export const useTransactionSimulation = ({
  transactionAction,
  feeTokenAddress,
  actionHash = "",
}: IUseTransactionSimulation) => {
  const transactionSimulationEnabled = useTransactionSimulationEnabled()
  const transactionSimulationFetcher = useCallback(async () => {
    if (transactionAction.type !== TransactionType.INVOKE) {
      // Backend Tx simulation only supports INVOKE transactions
      return undefined
    }

    void sendMessage({
      type: "SIMULATE_TRANSACTIONS",
      data: { call: transactionAction.payload, feeTokenAddress },
    })

    const result = await Promise.race([
      waitForMessage("SIMULATE_TRANSACTIONS_RES"),
      waitForMessage("SIMULATE_TRANSACTIONS_REJ"),
    ])

    if (result === null) {
      console.warn(
        "Old Account detected. Falling back to client-side simulation",
      )
      return undefined
    }

    if ("error" in result) {
      throw result.error
    }

    return result.simulation
  }, [transactionAction]) // eslint-disable-line react-hooks/exhaustive-deps
  return useConditionallyEnabledSWR<
    ApiTransactionBulkSimulationResponse | undefined
  >(
    Boolean(actionHash) && transactionSimulationEnabled,
    [actionHash, "transactionSimulation"],
    transactionSimulationFetcher,
    swrRefetchDisabledConfig,
  )
}
