import { stark } from "starknet"
import { EstimatedFees } from "./fees/fees.model"
import { ApiTransactionBulkSimulationResponse } from "./types"

export const getEstimatedFeeFromSimulation = (
  simulation: ApiTransactionBulkSimulationResponse | undefined,
): EstimatedFees => {
  if (!simulation) {
    return {
      amount: "0",
      suggestedMaxFee: "0",
    }
  }

  // TODO: Use Zod to validate the response during / after Tx Review V2
  if (!Array.isArray(simulation)) {
    throw Error(
      `Unexpected simulation response. Expected array. Got ${typeof simulation}`,
    )
  }

  if (simulation.length === 1) {
    // No account deployment
    return {
      amount: simulation[0].feeEstimation.overallFee.toString(),
      suggestedMaxFee: stark
        .estimatedFeeToMaxFee(simulation[0].feeEstimation.overallFee)
        .toString(),
    }
  }

  if (simulation.length === 2) {
    // Simulation includes account deployment
    return {
      accountDeploymentFee: simulation[0].feeEstimation.overallFee.toString(),
      maxADFee: stark
        .estimatedFeeToMaxFee(simulation[0].feeEstimation.overallFee)
        .toString(),
      amount: simulation[1].feeEstimation.overallFee.toString(),
      suggestedMaxFee: stark
        .estimatedFeeToMaxFee(simulation[1].feeEstimation.overallFee)
        .toString(),
    }
  }

  throw Error("Unexpected simulation response length")
}
