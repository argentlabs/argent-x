import { addressSchema, hexSchema } from "@argent/x-shared"
import type { TypedData } from "@starknet-io/types-js"
import { z } from "zod"

const allowedMethodSchema = z.object({
  "Contract Address": addressSchema,
  selector: z.string(),
})

export const sessionKeyMetadataTxFeeSchema = z.object({
  tokenAddress: addressSchema,
  maxAmount: z.string(),
})

export type SessionKeyMetadataTxFee = z.infer<
  typeof sessionKeyMetadataTxFeeSchema
>

const sessionKeyMetadataJsonSchema = z.object({
  projectID: z.string(),
  txFees: z.array(sessionKeyMetadataTxFeeSchema),
})

export const sessionKeyMetadataSchema = z
  .string()
  .transform((str, ctx): z.infer<typeof sessionKeyMetadataJsonSchema> => {
    try {
      const json = JSON.parse(str)
      return sessionKeyMetadataJsonSchema.parse(json)
    } catch (e) {
      ctx.addIssue({ code: "custom", message: "Invalid Metadata" })
      return z.NEVER
    }
  })

export const sessionKeyMessageSchema = z.object({
  "Allowed Methods": z.array(allowedMethodSchema),
  "Expires At": z.number(),
  Metadata: sessionKeyMetadataSchema,
  "Session Key": hexSchema,
})

export type SessionKeyMessage = z.infer<typeof sessionKeyMessageSchema>

export function isSessionKeyMessage(
  message: unknown,
): message is SessionKeyMessage {
  return sessionKeyMessageSchema.safeParse(message).success
}

/** Only checks the `primaryType` and `domain.name` - you should further validate message using `sessionKeyMessageSchema` */
export function isSessionKeyTypedData(dataToSign: TypedData) {
  return (
    dataToSign.primaryType === "Session" &&
    dataToSign.domain.name === "SessionAccount.session"
  )
}
