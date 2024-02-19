import { addressSchema, addressSchemaArgentBackend } from "@argent/shared"
import { z } from "zod"
import { estimatedFeesSchema } from "../transactionSimulation/fees/fees.model"
import { reasonsSchema, severitySchema } from "../warning/schema"

const linkSchema = z.object({
  name: z.string(),
  url: z.string(),
  position: z.number(),
})

const tokenSchema = z.object({
  address: z.string(),
  name: z.string(),
  symbol: z.string().optional(),
  decimals: z.number(),
  unknown: z.boolean(),
  iconUrl: z.string().optional(),
  type: z.string(),
})

export const propertySchema = z.union([
  z.object({
    type: z.literal("amount"),
    label: z.string(),
    token: tokenSchema,
    amount: z.string(),
    usd: z.string(),
    editable: z.boolean(),
  }),
  z.object({
    type: z.literal("address"),
    label: z.string(),
    address: z.string(),
    addressName: z.string().optional(),
    // tbd whether it's isVerified or verified
    verified: z.boolean(),
  }),
  z.object({
    type: z.literal("timestamp"),
    label: z.string(),
    value: z.string(),
  }),
  z.object({
    type: z.literal("token_address"),
    label: z.string(),
    token: tokenSchema,
  }),
  z.object({
    type: z.literal("calldata"),
    label: z.string(),
    entrypoint: z.string(),
    calldata: z.array(z.string()),
  }),
  z.object({
    type: z.literal("text"),
    label: z.string(),
    text: z.string(),
  }),
])

export const actionSchema = z.object({
  name: z.string(),
  properties: z.array(propertySchema),
  defaultProperties: z.array(propertySchema).optional(),
})

export const assessmentSchema = z.union([
  z.literal("verified"),
  z.literal("neutral"),
  z.literal("partial"),
  z.literal("warn"),
])

export const warningDetailsSchema = z.object({
  unknown_token: z.unknown().optional(),
  date_of_addition: z.string().optional(),
  contract_address: addressSchema.optional(),
  reason: z.string().optional(),
  value: z.string().or(z.number()).optional(),
})

export const warningSchema = z.object({
  reason: reasonsSchema,
  details: warningDetailsSchema.optional(),
  severity: severitySchema,
})

const reviewSchema = z.object({
  assessment: assessmentSchema,
  warnings: z.array(warningSchema).optional(),
  assessmentReasons: z.array(z.string()).optional(),
  assessmentDetails: z
    .object({
      contract_address: z.string(),
    })
    .optional(),
  action: actionSchema,
})

const targetedDappSchema = z.object({
  name: z.string(),
  description: z.string(),
  logoUrl: z.string(),
  iconUrl: z.string(),
  argentVerified: z.boolean(),
  links: z.array(linkSchema),
})

const reviewOfTransactionSchema = z
  .object({
    assessment: z.union([
      z.literal("verified"),
      z.literal("neutral"),
      z.literal("partial"),
      z.literal("warn"),
    ]),
    warnings: z.array(warningSchema).optional(),
    assessmentDetails: z
      .object({
        contract_address: z.string(),
      })
      .optional(),
    targetedDapp: targetedDappSchema.optional(),
    reviews: z.array(reviewSchema),
  })
  .optional()

const imageUrlsSchema = z.object({
  banner: z.string().nullable().optional(),
  preview: z.string().nullable().optional(),
  full: z.string().nullable().optional(),
  original: z.string().nullable().optional(),
})

const linksSchema = z.object({
  twitter: z.string().optional(),
  external: z.string().optional(),
  discord: z.string().optional(),
})

const tokenDetailsSchema = z.object({
  address: addressSchemaArgentBackend,
  decimals: z.number().optional(),
  symbol: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  type: z.string().optional(),
  usdValue: z.string().optional(),
  iconUrl: z.string().optional(),
  unknown: z.boolean().optional(),
  imageUrls: imageUrlsSchema.optional(),
  links: linksSchema.optional(),
})

const approvalSchema = z.object({
  tokenAddress: addressSchemaArgentBackend,
  owner: addressSchemaArgentBackend,
  spender: addressSchemaArgentBackend,
  value: z.string().optional(),
  approvalForAll: z.boolean(),
  details: tokenDetailsSchema.optional(),
})

const transferSchema = z.object({
  tokenAddress: addressSchemaArgentBackend,
  from: addressSchemaArgentBackend,
  to: addressSchemaArgentBackend,
  tokenId: z.string().optional(),
  value: z.string().optional(),
  details: tokenDetailsSchema.optional(),
})
// Not great but this is to deal with backend inconsistencies
const stringOrNumberAsNumberSchema = z
  .union([z.string(), z.number()])
  .transform((val) => parseInt(val.toString(), 10))
const feeEstimationCommonFields = {
  overallFee: stringOrNumberAsNumberSchema,
  gasPrice: stringOrNumberAsNumberSchema,
  gasUsage: stringOrNumberAsNumberSchema,
}

export const feeEstimationSchema = z
  .object({
    ...feeEstimationCommonFields,
    unit: z
      .string()
      .transform((t) => t.toUpperCase())
      .pipe(z.literal("WEI")),

    maxFee: stringOrNumberAsNumberSchema,
  })
  .or(
    z.object({
      ...feeEstimationCommonFields,
      unit: z
        .string()
        .transform((t) => t.toUpperCase())
        .pipe(z.literal("FRI")),

      maxAmount: stringOrNumberAsNumberSchema,
      maxPricePerUnit: stringOrNumberAsNumberSchema,
    }),
  )

const summarySchema = z.object({
  type: z.string(),
  label: z.string(),
  tokenId: z.string().optional(),
  value: z.string().optional(),
  usdValue: z.string().optional(),
  token: tokenDetailsSchema,
  sent: z.boolean().optional(),
  tokenIdDetails: z
    .object({
      name: z.string().optional(),
      description: z.string().optional(),
      imageUrls: imageUrlsSchema.optional(),
    })
    .optional(),
})

const simulationSchema = z.object({
  approvals: z.array(approvalSchema).optional(),
  transfers: z.array(transferSchema).optional(),
  calculatedNonce: z.string().optional(),
  feeEstimation: feeEstimationSchema,
  summary: z.array(summarySchema).optional(),
})

const simulationErrorSchema = z.object({
  label: z.string().optional(),
  code: z.number().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
})

const transactionSimulationSchema = z.object({
  reviewOfTransaction: reviewOfTransactionSchema,
  simulation: simulationSchema,
  simulationError: z.undefined(),
})

const transactionSimulationErrorSchema = z.object({
  reviewOfTransaction: reviewOfTransactionSchema,
  simulation: z.undefined(),
  simulationError: simulationErrorSchema,
})

const transactionSchema = transactionSimulationSchema.or(
  transactionSimulationErrorSchema,
)

export const simulateAndReviewSchema = z.object({
  transactions: z.array(transactionSchema),
})

export const enrichedSimulateAndReviewSchema = z.object({
  transactions: z.array(transactionSchema),
  enrichedFeeEstimation: estimatedFeesSchema.optional(),
  isBackendDown: z.boolean().default(false).optional(),
})

export type EnrichedSimulateAndReview = z.infer<
  typeof enrichedSimulateAndReviewSchema
>

export type SimulateAndReview = z.infer<typeof simulateAndReviewSchema>

export type Assessment = z.infer<typeof assessmentSchema>
export type FeeEstimation = z.infer<typeof feeEstimationSchema>
export type ReviewOfTransaction = z.infer<typeof reviewOfTransactionSchema>
export type Action = z.infer<typeof actionSchema>
export type Property = z.infer<typeof propertySchema>
export type Simulation = z.infer<typeof simulationSchema>
export type SimulationError = z.infer<typeof simulationErrorSchema>
export type SimulationSummary = z.infer<typeof summarySchema>

export type TransactionReviewTransaction = z.infer<typeof transactionSchema>

type TransactionSimulation = z.infer<typeof transactionSimulationSchema>

type TransactionSimulationError = z.infer<
  typeof transactionSimulationErrorSchema
>

export function isNotTransactionSimulationError(
  transaction: TransactionReviewTransaction,
): transaction is TransactionSimulation {
  return transactionSimulationSchema.safeParse(transaction).success
}

export function isTransactionSimulationError(
  transaction: TransactionReviewTransaction,
): transaction is TransactionSimulationError {
  return transactionSimulationErrorSchema.safeParse(transaction).success
}

export function getMessageFromSimulationError(
  simulationError: SimulationError,
) {
  if (simulationError.error) {
    return simulationError.error
  }
  if (simulationError.message && simulationError.code) {
    return `${simulationError.code}: ${simulationError.message}`
  }
  return "Unknown error"
}

export type Warning = z.infer<typeof warningSchema>
