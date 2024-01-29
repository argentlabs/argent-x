import { num } from "starknet"
import { EstimatedFee, EstimatedFees } from "./fees/fees.model"
import { ApiTransactionSimulationResponse } from "./types"
import { ETH_TOKEN_ADDRESS } from "../network/constants"
import { isEqualAddress } from "@argent/shared"
import { SimulateAndReview } from "../transactionReview/schema"
import { ReviewError } from "../errors/review"
import { argentMaxFee } from "../utils/argentMaxFee"

// TODO: Remove this once we have the watermark fee in the amount*pricePerUnit product
export const getEstimatedFeeFromSimulationAndRespectWatermarkFee = (
  simulateAndReviewResult: Pick<SimulateAndReview, "transactions">,
): EstimatedFees & {
  transactions: EstimatedFee & { watermarkedMaxFee: bigint }
  deployment?: EstimatedFee & { watermarkedMaxFee: bigint }
} => {
  const { transactions: _transactions } = simulateAndReviewResult

  const transactions = _transactions.map((tx) => {
    if (!tx.simulation) {
      throw new ReviewError({
        code: "SIMULATE_AND_REVIEW_FAILED",
        message: "Missing simulation",
      })
    }
    return tx
  })

  const sims = transactions.map(
    (tx): Pick<ApiTransactionSimulationResponse, "feeEstimation"> => {
      return {
        ...tx.simulation,
        feeEstimation: {
          ...tx.simulation.feeEstimation,
          gasPrice: Number(tx.simulation.feeEstimation.gasPrice),
          gasUsage: Number(tx.simulation.feeEstimation.gasUsage),
          overallFee: Number(tx.simulation.feeEstimation.overallFee),
          maxFee: Number(tx.simulation.feeEstimation.maxFee),
        },
      }
    },
  )

  const estimatedFee = getEstimatedFeeFromBulkSimulation(sims)

  const [invokeTransaction, deployTransactionOrUndefined] =
    transactions.length === 1
      ? [transactions[0], undefined]
      : [transactions[1], transactions[0]]

  return {
    ...estimatedFee,
    transactions: {
      ...estimatedFee.transactions,
      watermarkedMaxFee: num.toBigInt(
        invokeTransaction.simulation.feeEstimation.maxFee,
      ),
    },
    deployment:
      estimatedFee.deployment && deployTransactionOrUndefined
        ? {
            ...estimatedFee.deployment,
            watermarkedMaxFee: num.toBigInt(
              deployTransactionOrUndefined.simulation.feeEstimation.maxFee,
            ),
          }
        : undefined,
  }
}

export const getEstimatedFeeFromBulkSimulation = (
  simulation:
    | Pick<ApiTransactionSimulationResponse, "feeEstimation">[]
    | undefined,
): EstimatedFees => {
  if (!simulation) {
    return {
      transactions: {
        feeTokenAddress: ETH_TOKEN_ADDRESS,
        amount: 0n,
        pricePerUnit: 0n,
      },
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
      transactions: {
        feeTokenAddress: ETH_TOKEN_ADDRESS,
        amount: num.toBigInt(simulation[0].feeEstimation.gasUsage),
        pricePerUnit: num.toBigInt(simulation[0].feeEstimation.gasPrice),
        watermarkedMaxFee: num.toBigInt(simulation[0].feeEstimation.maxFee),
      },
    }
  }

  if (simulation.length === 2) {
    // Simulation includes account deployment
    return {
      deployment: {
        feeTokenAddress: ETH_TOKEN_ADDRESS,
        amount: num.toBigInt(simulation[0].feeEstimation.gasUsage),
        pricePerUnit: num.toBigInt(simulation[0].feeEstimation.gasPrice),
        watermarkedMaxFee: num.toBigInt(simulation[0].feeEstimation.maxFee),
      },
      transactions: {
        feeTokenAddress: ETH_TOKEN_ADDRESS,
        amount: num.toBigInt(simulation[1].feeEstimation.gasUsage),
        pricePerUnit: num.toBigInt(simulation[1].feeEstimation.gasPrice),
        watermarkedMaxFee: num.toBigInt(simulation[1].feeEstimation.maxFee),
      },
    }
  }

  throw Error("Unexpected simulation response length")
}

export const estimatedFeeToTotal = (estimatedFee: EstimatedFee): bigint => {
  return estimatedFee.amount * estimatedFee.pricePerUnit
}

export const estimatedFeesToTotal = (estimatedFees: EstimatedFees): bigint => {
  if (
    estimatedFees.deployment &&
    !isEqualAddress(
      estimatedFees.deployment.feeTokenAddress,
      estimatedFees.transactions.feeTokenAddress,
    )
  ) {
    throw Error("Cannot calculate estimated fees for different tokens")
  }

  return (
    estimatedFeeToTotal(estimatedFees.transactions) +
    (estimatedFees.deployment
      ? estimatedFeeToTotal(estimatedFees.deployment)
      : 0n)
  )
}

const estimatedFeeToMaxFee = (estimatedFee: EstimatedFee): EstimatedFee => {
  return {
    ...estimatedFee,
    amount: num.toBigInt(argentMaxFee({ estimatedFee: estimatedFee.amount })),
    pricePerUnit: num.toBigInt(
      argentMaxFee({ estimatedFee: estimatedFee.pricePerUnit }),
    ),
  }
}

export const estimatedFeeToMaxFeeTotal = (
  estimatedFee: EstimatedFee,
): bigint => {
  const maxFee = estimatedFeeToMaxFee(estimatedFee)
  return maxFee.watermarkedMaxFee ?? estimatedFeeToTotal(maxFee)
}

export const estimatedFeesToMaxFeeTotal = (
  estimatedFees: EstimatedFees,
): bigint => {
  if (
    estimatedFees.deployment &&
    !isEqualAddress(
      estimatedFees.deployment.feeTokenAddress,
      estimatedFees.transactions.feeTokenAddress,
    )
  ) {
    throw Error("Cannot calculate estimated fees for different tokens")
  }

  const deployment = !estimatedFees.deployment
    ? 0n
    : estimatedFees.deployment.watermarkedMaxFee ??
      estimatedFeeToMaxFeeTotal(estimatedFees.deployment)

  const transactions =
    estimatedFees.transactions.watermarkedMaxFee ??
    estimatedFeeToMaxFeeTotal(estimatedFees.transactions)

  return deployment + transactions
}

export const estimatedFeeToResourceBounds = (estimatedFee: EstimatedFee) => {
  return {
    // for v1 transactions
    maxFee: {
      suggestedMaxFee: estimatedFeeToTotal(estimatedFee),
    },
    // for v3 transactions
    l1_gas: {
      max_amount: {
        suggestedMaxFee: estimatedFee.amount,
      },
      max_price_per_unit: {
        suggestedMaxFee: estimatedFee.pricePerUnit,
      },
    },
    l2_gas: {
      max_amount: "0x0",
      max_price_per_unit: "0x0",
    },
  }
}
