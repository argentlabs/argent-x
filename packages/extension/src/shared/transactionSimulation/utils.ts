import { num } from "starknet"
import { EstimatedFee, EstimatedFees } from "./fees/fees.model"
import { ApiTransactionSimulationResponse, FRI, WEI } from "./types"
import { ETH_TOKEN_ADDRESS, STRK_TOKEN_ADDRESS } from "../network/constants"
import { Address, isEqualAddress } from "@argent/shared"
import {
  SimulateAndReview,
  feeEstimationSchema,
} from "../transactionReview/schema"
import { ReviewError } from "../errors/review"
import { argentMaxFee } from "../utils/argentMaxFee"
import { upperCase } from "lodash-es"

type FeeEstimationV1<T> = {
  unit: WEI
  maxFee: T
  overallFee: T
  gasPrice: T
  gasUsage: T
}

type FeeEstimationV3<T> = {
  unit: FRI
  overallFee: T
  gasPrice: T
  gasUsage: T
  maxAmount: T
  maxPricePerUnit: T
}

type CastFeeEstimation<T> = FeeEstimationV1<T> | FeeEstimationV3<T>

function toMax<S, T extends CastFeeEstimation<S>>(
  value: T,
): T["unit"] extends WEI ? { maxFee: S } : { amount: S; pricePerUnit: S } {
  if (isWEI(value)) {
    return {
      maxFee: value.maxFee,
    } as T["unit"] extends WEI ? { maxFee: S } : { amount: S; pricePerUnit: S }
  }
  return {
    amount: value.maxAmount,
    pricePerUnit: value.maxPricePerUnit,
  } as T["unit"] extends WEI ? { maxFee: S } : { amount: S; pricePerUnit: S }
}

function isWEI<T>(
  value: Pick<CastFeeEstimation<T>, "unit">,
): value is FeeEstimationV1<T> {
  return upperCase(value.unit) === "WEI"
}

function isFRI<T>(
  value: Pick<CastFeeEstimation<T>, "unit">,
): value is FeeEstimationV3<T> {
  return upperCase(value.unit) === "FRI"
}

function castFeeEstimation<S, T extends CastFeeEstimation<S>, C>(
  feeEstimation: T,
  cast: (value: S) => C,
): CastFeeEstimation<C> {
  if (isWEI(feeEstimation)) {
    return {
      ...feeEstimation,
      maxFee: cast(feeEstimation.maxFee),
      overallFee: cast(feeEstimation.overallFee),
      gasPrice: cast(feeEstimation.gasPrice),
      gasUsage: cast(feeEstimation.gasUsage),
    }
  }
  return {
    ...feeEstimation,
    overallFee: cast(feeEstimation.overallFee),
    gasPrice: cast(feeEstimation.gasPrice),
    gasUsage: cast(feeEstimation.gasUsage),
    maxAmount: cast(feeEstimation.maxAmount),
    maxPricePerUnit: cast(feeEstimation.maxPricePerUnit),
  }
}

export const getEstimatedFeeFromSimulationAndRespectWatermarkFee = (
  simulateAndReviewResult: Pick<SimulateAndReview, "transactions">,
): EstimatedFees & {
  transactions: Required<EstimatedFee>
  deployment?: Required<EstimatedFee>
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
        feeEstimation: castFeeEstimation(tx.simulation.feeEstimation, Number),
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
      max: toMax(
        castFeeEstimation(
          invokeTransaction.simulation.feeEstimation,
          num.toBigInt,
        ),
      ),
    },
    deployment:
      estimatedFee.deployment && deployTransactionOrUndefined
        ? {
            ...estimatedFee.deployment,
            max: toMax(
              castFeeEstimation(
                deployTransactionOrUndefined.simulation.feeEstimation,
                num.toBigInt,
              ),
            ),
          }
        : undefined,
  }
}

export function unitToFeeTokenAddress(unit: WEI | FRI): Address {
  return isFRI({ unit }) ? STRK_TOKEN_ADDRESS : ETH_TOKEN_ADDRESS
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
    const feeEstimation = feeEstimationSchema.parse(simulation[0].feeEstimation)
    // No account deployment
    return {
      transactions: {
        feeTokenAddress: unitToFeeTokenAddress(feeEstimation.unit),
        amount: num.toBigInt(feeEstimation.gasUsage),
        pricePerUnit: num.toBigInt(feeEstimation.gasPrice),
        max: toMax(castFeeEstimation(feeEstimation, num.toBigInt)),
      },
    }
  }

  if (simulation.length === 2) {
    // Simulation includes account deployment
    return {
      deployment: {
        feeTokenAddress: unitToFeeTokenAddress(
          simulation[0].feeEstimation.unit,
        ),
        amount: num.toBigInt(simulation[0].feeEstimation.gasUsage),
        pricePerUnit: num.toBigInt(simulation[0].feeEstimation.gasPrice),
        max: toMax(
          castFeeEstimation(simulation[0].feeEstimation, num.toBigInt),
        ),
      },
      transactions: {
        feeTokenAddress: unitToFeeTokenAddress(
          simulation[1].feeEstimation.unit,
        ),
        amount: num.toBigInt(simulation[1].feeEstimation.gasUsage),
        pricePerUnit: num.toBigInt(simulation[1].feeEstimation.gasPrice),
        max: toMax(
          castFeeEstimation(simulation[1].feeEstimation, num.toBigInt),
        ),
      },
    }
  }

  throw Error("Unexpected simulation response length")
}

export const estimatedFeeToTotal = (
  estimatedFee: Pick<EstimatedFee, "amount" | "pricePerUnit">,
): bigint => {
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
  // Respect the watermark fee if it exists
  if (estimatedFee.max && "amount" in estimatedFee.max) {
    return {
      ...estimatedFee,
      ...estimatedFee.max,
    }
  }

  // Otherwise, calculate the max fee with the fallback overhead
  const scale = 10000n
  const totalFee = estimatedFee.amount * estimatedFee.pricePerUnit

  if (totalFee < 0) {
    throw Error("Cannot calculate max fee for negative fee")
  }

  const adjustedTotalFee = num.toBigInt(
    argentMaxFee({ estimatedFee: totalFee }),
  )

  const factor = Math.sqrt(Number(adjustedTotalFee) / Number(totalFee))
  const adjustmentFactor = isNaN(factor)
    ? Math.sqrt(2) // fallback multiplier if ratio is NaN, square root of 2
    : factor

  const scaledAdjustmentFactor = BigInt(
    Math.trunc(adjustmentFactor * Number(scale)),
  )

  return {
    ...estimatedFee,
    amount: (estimatedFee.amount * scaledAdjustmentFactor) / scale,
    pricePerUnit: (estimatedFee.pricePerUnit * scaledAdjustmentFactor) / scale,
  }
}

export const getWatermarkedMaxFeeTotal = (
  estimatedFee: EstimatedFee,
): bigint | undefined => {
  if (!estimatedFee.max) {
    return undefined
  }
  if ("maxFee" in estimatedFee.max) {
    return estimatedFee.max.maxFee
  }
  return estimatedFeeToTotal(estimatedFee.max)
}

export const estimatedFeeToMaxFeeTotal = (
  estimatedFee: EstimatedFee,
): bigint => {
  const watermarkedMaxFee = getWatermarkedMaxFeeTotal(estimatedFee)
  if (watermarkedMaxFee) {
    return watermarkedMaxFee
  }
  return estimatedFeeToTotal(estimatedFeeToMaxFee(estimatedFee))
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
    : estimatedFeeToMaxFeeTotal(estimatedFees.deployment)

  const transactions = estimatedFeeToMaxFeeTotal(estimatedFees.transactions)

  return deployment + transactions
}

export const estimatedFeeToMaxResourceBounds = (estimatedFee: EstimatedFee) => {
  const maxFee = estimatedFeeToMaxFee(estimatedFee)
  return {
    // for v1 transactions
    maxFee: estimatedFeeToMaxFeeTotal(estimatedFee),
    // for v3 transactions
    resourceBounds: {
      l1_gas: {
        max_amount: num.toHex(maxFee.amount),
        max_price_per_unit: num.toHex(maxFee.pricePerUnit),
      },
      l2_gas: {
        max_amount: "0x0",
        max_price_per_unit: "0x0",
      },
    },
  }
}
